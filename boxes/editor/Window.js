const blessed = require('blessed');
const _ = require('lodash');

class Window {
    constructor(parent, buffer) {
        this.buffer = buffer;
        this.box = this.createWindowBox(parent);
        this.isFocused = false;
        this.cursor = { x: 0, y: 0 };
        this.render();
    }

    createWindowBox(parent) {
        return blessed.box({
            label: 'Editor',
            parent,
            top: 0, 
            right: 0,
            width: '84%',
            height: '99%',
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

    render() {
        const lines = this.buffer.getContent().split('\n');
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

    updateCursorPosition(newX, newY) {
        const lines = this.buffer.getContent().split('\n');
        this.cursor.x = _.clamp(newX, 0, (lines[this.cursor.y] || ' ').length);
        this.cursor.y = _.clamp(newY, 0, lines.length - 1);
        this.render();
    }

    moveCursorLeft() {
        if (this.cursor.x > 0) {
            this.updateCursorPosition(this.cursor.x - 1, this.cursor.y);
        } else if (this.cursor.y > 0) {
            const lines = this.buffer.getContent().split('\n');
            this.updateCursorPosition(lines[this.cursor.y - 1].length, this.cursor.y - 1);
        }
    }

    moveCursorRight() {
        const lines = this.buffer.getContent().split('\n');
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
        const lines = this.buffer.getContent().split('\n');
        if (this.cursor.x > 0) {
            lines[this.cursor.y] = lines[this.cursor.y].slice(0, this.cursor.x - 1) + lines[this.cursor.y].slice(this.cursor.x);
            this.updateCursorPosition(this.cursor.x - 1, this.cursor.y);
        } else if (this.cursor.y > 0) {
            lines[this.cursor.y - 1] += lines[this.cursor.y];
            lines.splice(this.cursor.y, 1);
            this.updateCursorPosition(lines[this.cursor.y - 1].length, this.cursor.y - 1);
        }
        this.buffer.setContent(lines.join('\n'));
        this.render();
    }

    handleEnter() {
        const lines = this.buffer.getContent().split('\n');
        const currentLine = lines[this.cursor.y];
        lines[this.cursor.y] = currentLine.slice(0, this.cursor.x);
        lines.splice(this.cursor.y + 1, 0, currentLine.slice(this.cursor.x));
        this.updateCursorPosition(0, this.cursor.y + 1);
        this.buffer.setContent(lines.join('\n'));
        this.render();
    }

    handleInput(ch) {
        const lines = this.buffer.getContent().split('\n');
        if (lines[this.cursor.y]) {
            lines[this.cursor.y] = lines[this.cursor.y].slice(0, this.cursor.x) + ch + lines[this.cursor.y].slice(this.cursor.x);
        } else {
            lines.push(ch);
        }
        this.updateCursorPosition(this.cursor.x + 1, this.cursor.y);
        this.buffer.setContent(lines.join('\n'));
        this.render();
    }
}

module.exports = Window;