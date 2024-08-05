const blessed = require('blessed');
const _ = require('lodash');

class Window {
    constructor(parent, buffer, label) {
        this.buffer = buffer;
        this.box = this.createWindowBox(parent, label);
        this.isFocused = false;
        this.cursor = { x: 0, y: 0 };
        this.render();
    }

    createWindowBox(parent, label) {
        return blessed.box({
            label,
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

    updateCursorPosition(newX, newY) {
        try {
            const lines = this.buffer.lines;
            this.cursor.y = _.clamp(newY, 0, lines.length - 1);
            this.cursor.x = _.clamp(newX, 0, (lines[this.cursor.y] || '').length);
            this.render();
        } catch (error) {
            console.error('Error updating cursor position:', error);
        }
    }

    handleBackspace() {
        try {
            const lines = this.buffer.lines;
            if (this.cursor.x > 0) {
                lines[this.cursor.y] = lines[this.cursor.y].slice(0, this.cursor.x - 1) + lines[this.cursor.y].slice(this.cursor.x);
                this.updateCursorPosition(this.cursor.x - 1, this.cursor.y);
            } else if (this.cursor.y > 0) {
                lines[this.cursor.y - 1] += lines[this.cursor.y];
                lines.splice(this.cursor.y, 1);
                this.updateCursorPosition(lines[this.cursor.y - 1].length, this.cursor.y - 1);
            }
            this.buffer.setLine(this.cursor.y, lines[this.cursor.y]);
            this.render();
        } catch (error) {
            console.error('Error handling backspace:', error);
        }
    }

    handleEnter() {
        try {
            const lines = this.buffer.lines;
            const currentLine = lines[this.cursor.y];
            lines[this.cursor.y] = currentLine.slice(0, this.cursor.x);
            lines.splice(this.cursor.y + 1, 0, currentLine.slice(this.cursor.x));
            this.buffer.setLine(this.cursor.y, lines[this.cursor.y]);
            if (this.cursor.y + 1 < lines.length) {
                this.buffer.setLine(this.cursor.y + 1, lines[this.cursor.y + 1]);
            }
            this.updateCursorPosition(0, this.cursor.y + 1);
            this.render();
        } catch (error) {
            console.error('Error handling enter:', error);
        }
    }

    handleInput(ch) {
        try {
            const lines = this.buffer.lines;
            if (lines[this.cursor.y]) {
                lines[this.cursor.y] = lines[this.cursor.y].slice(0, this.cursor.x) + ch + lines[this.cursor.y].slice(this.cursor.x);
            } else {
                lines.push(ch);
            }
            this.buffer.setLine(this.cursor.y, lines[this.cursor.y]);
            this.updateCursorPosition(this.cursor.x + 1, this.cursor.y);
            this.render();
        } catch (error) {
            console.error('Error handling input:', error);
        }
    }

    render() {
        try {
            const content = this.getDisplayContent();
            this.box.setContent(content);
            this.box.screen.render();
        } catch (error) {
            console.error('Error rendering:', error);
        }
    }
    
    getDisplayContent() {
        const lines = this.buffer.lines.map((line, i) => {
            if (i === this.cursor.y) {
                line = this.highlightCursor(line);
            }
            return line;
        });
        return lines.join('\n');
    }

    highlightCursor(line) {
        if (this.cursor.x < line.length) {
            return line.slice(0, this.cursor.x) +
                   '\x1b[48;5;82m\x1b[97m' +
                   line[this.cursor.x] +
                   '\x1b[0m' +
                   line.slice(this.cursor.x + 1);
        } else {
            return line + '\x1b[48;5;82m\x1b[97m \x1b[0m';
        }
    }

    moveCursorVertical(count) {
        const lines = this.buffer.lines;
        const newY = this.cursor.y + count;
        this.cursor.y = _.clamp(newY, 0, lines.length - 1);
        this.updateCursorPosition(this.cursor.x, this.cursor.y);
    }

    moveCursorHorizontal(count) {
        const lines = this.buffer.lines;
        let newX = this.cursor.x + count;

        if (newX < 0 && this.cursor.y > 0) {
            this.cursor.y -= 1;
            newX = lines[this.cursor.y].length;
        } else if (newX > (lines[this.cursor.y] || '').length && this.cursor.y < lines.length - 1) {
            this.cursor.y += 1;
            newX = 0;
        }

        const lineLength = lines[this.cursor.y] ? lines[this.cursor.y].length : 0;
        this.cursor.x = _.clamp(newX, 0, lineLength);
        this.updateCursorPosition(this.cursor.x, this.cursor.y);
    }
}

module.exports = Window;
