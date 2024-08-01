const fs = require('fs-extra');
const createPopup = require('../popup');
const Observer = require('../../pluginManager/observer')

class Editor {
    constructor(parent, filePath) {
        this.filePath = filePath;
        this.box = this.createEditorBox(parent);
        this.isFocused = false;
        this.content = '';
        this.changeQueue = [];
        this.cursor = { x: 0, y: 0 };
        this.initialize();
    }

    createEditorBox(parent) {
        return blessed.box({
            label: 'Editor',
            parent,
            top: 0, 
            right: 0,
            width: '84%',
            height: '73%',
            border: {
                type: 'line'
            },
            style: {
                border: {
                    fg: 'blue'
                },
                focus: {
                    border: {
                        fg: 'yellow'
                    }
                },
                scrollbar: {
                    bg: 'red',
                    fg: 'blue'
                }
            },
            tags: true,
            scrollable: true,
            mouse: true,
            keys: true,
            vi: true,
            content: '',
        });
    }

    focus() {
        this.isFocused = true;
        this.box.focus();
        this.render();
    }

    unfocus() {
        this.isFocused = false;
    }

    setContent(content) {
        this.content = content;
        this.render();
    }

    getContent() {
        return this.content;
    }


    queueChange(changeFunction){
        this.changeQueue.push(changeFunction);
        if (!this.isApplyingChange) {
            this.applyNextChange();
        }
    }

    async applyNextChange() {
        if (this.changeQueue.length === 0) {
            this.isApplyingChange = false;
            return;
        }

        this.isApplyingChange = true;
        const changeFunction = this.changeQueue.shift();

        try {
            await changeFunction();
        } catch (err) {
            console.error('Failed to apply change:', err);
        } finally {
            this.applyNextChange();
        }
    }

    removeTags(content) {
        return content.replace(/\x1b\[\d+(;\d+)*m/g, '');
    }

    async setFilePath(filePath) {
        this.filePath = filePath;
        if (filePath) {
            try {
                const data = await fs.readFile(filePath, 'utf8');
                this.setContent(data);
            } catch (err) {
                createPopup('error', this.box, err.message);
            }
        } else {
            this.setContent('');
        }
    }

    async saveFile() {
        const content = this.removeTags(this.getContent());
        try {
            await fs.writeFile(this.filePath, content, 'utf8');
            createPopup('success', this.box, 'File was saved');
        } catch (err) {
            createPopup('error', this.box, `Error: ${err.message}`);
        }
        this.render();
    }

    updateCursorPosition(newX, newY) {
        const lines = this.content.split('\n');
        this.cursor.x = _.clamp(newX, 0, (lines[this.cursor.y] || ' ').length);
        this.cursor.y = _.clamp(newY, 0, lines.length - 1);
        this.render();
    }

    moveCursorLeft() {
        if (this.cursor.x > 0) {
            this.updateCursorPosition(this.cursor.x - 1, this.cursor.y);
        } else if (this.cursor.y > 0) {
            const lines = this.content.split('\n');
            this.updateCursorPosition(lines[this.cursor.y - 1].length, this.cursor.y - 1);
        }
    }

    moveCursorRight() {
        const lines = this.content.split('\n');
        if (this.cursor.x < (lines[this.cursor.y]?.length || 0)) {
            this.updateCursorPosition(this.cursor.x + 1, this.cursor.y);
        } else if (this.cursor.y < lines.length - 1) {
            this.updateCursorPosition(0, this.cursor.y + 1);
        }
    }

    moveCursorUp() {
        this.updateCursorPosition(this.cursor.x, this.cursor.y - 1);
    }
    
    moveCursorDown() {
        this.updateCursorPosition(this.cursor.x, this.cursor.y + 1);
    }

    handleBackspace() {
        const lines = this.content.split('\n');
        if (this.cursor.x > 0) {
            lines[this.cursor.y] = lines[this.cursor.y].slice(0, this.cursor.x - 1) + lines[this.cursor.y].slice(this.cursor.x);
            this.updateCursorPosition(this.cursor.x - 1, this.cursor.y);
        } else if (this.cursor.y > 0) {
            lines[this.cursor.y - 1] += lines[this.cursor.y];
            lines.splice(this.cursor.y, 1);
            this.updateCursorPosition(lines[this.cursor.y - 1].length, this.cursor.y - 1);
        }
        this.content = lines.join('\n');
        this.render();
    }

    handleEnter() {
        const lines = this.content.split('\n');
        const currentLine = lines[this.cursor.y];
        lines[this.cursor.y] = currentLine.slice(0, this.cursor.x);
        lines.splice(this.cursor.y + 1, 0, currentLine.slice(this.cursor.x));
        this.updateCursorPosition(0, this.cursor.y + 1);
        this.content = lines.join('\n');
        this.render();
    }

    handleInput(ch) {
        const lines = this.content.split('\n');
        if (lines[this.cursor.y]) {
            lines[this.cursor.y] = lines[this.cursor.y].slice(0, this.cursor.x) + ch + lines[this.cursor.y].slice(this.cursor.x);
        } else {
            lines.push(ch);
        }
        this.updateCursorPosition(this.cursor.x + 1, this.cursor.y);
        this.content = lines.join('\n');
        this.render();
    }

    render() {
        const lines = this.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (i === this.cursor.y) {
                if (this.cursor.x < line.length) {
                    lines[i] = line.slice(0, this.cursor.x) + 
                                '\x1b[48;5;82m\x1b[97m' + 
                                line[this.cursor.x] + 
                                '\x1b[0m' + 
                                line.slice(this.cursor.x + 1);
                } else {
                    lines[i] = line + '\x1b[48;5;82m\x1b[97m \x1b[0m';
                }
            }
        }
        this.box.setContent(lines.join('\n'));
        this.box.screen.render();
    }

    initialize() {
        if (this.filePath) {
            this.setFilePath(this.filePath);
        }

        this.box.on('keypress', (ch, key) => {
            if (this.isFocused) {
                switch (true) {
                    case (key.ctrl && key.name === 's'):
                        this.saveFile();
                        const content = this.removeTags(this.getContent());
                        Observer.emit('save', {content})
                        break;
                    case (key.name === 'left'):
                        this.moveCursorLeft();
                        Observer.emit('cursor-move', this.cursor)
                        break;
                    case (key.name === 'right'):
                        this.moveCursorRight();
                        Observer.emit('cursor-move', this.cursor)
                        break;
                    case (key.name === 'up'):
                        this.moveCursorUp();
                        Observer.emit('cursor-move', this.cursor)
                        break;
                    case (key.name === 'down'):
                        this.moveCursorDown();
                        Observer.emit('cursor-move', this.cursor)
                        break;
                    case (key.name === 'backspace'):
                        this.handleBackspace();
                        break;
                    case (key.name === 'return'):
                        this.handleEnter();
                        break;
                    default:
                        if (ch) {
                            this.handleInput(ch);
                        }
                        break;
                }
            }
        });
    }
}

module.exports = Editor;
