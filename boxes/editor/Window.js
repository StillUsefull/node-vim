const blessed = require('blessed');
const createPopup = require('../popup');
const Cursor = require('./Cursor');

class Window {
    constructor(parent, buffer, label) {
        this.buffer = buffer;
        this.box = this.createWindowBox(parent, label);
        this.isFocused = false;
        this.cursor = new Cursor();
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
            keys: true,
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
            const maxX = (lines[this.cursor.y] || '').length;
            const maxY = lines.length - 1;
            this.cursor.updatePosition(newX, newY, maxX, maxY);
            this.render();
        } catch (error) {
            createPopup('error', this.box, error.message);
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
            createPopup('error', this.box, error.message);
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
            createPopup('error', this.box, error.message);
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
            createPopup('error', this.box, error.message);
        }
    }

    render() {
        try {
            const content = this.getDisplayContent();
            this.box.setContent(content);
            this.box.screen.render();
        } catch (error) {
            createPopup('error', this.box, error.message);
        }
    }

    getDisplayContent(words = ['class'], cursorStyle = { bg: '82', fg: '97' }, keywordStyle = { fg: '214', bold: true }) {
        const lines = this.buffer.lines.map((line, i) => {
            if (i === this.cursor.y) {
                line = this.highlightCursor(line, this.cursor.x, cursorStyle);
            }
            return this.highlightKeywords(line, words, keywordStyle);
        });
        return lines.join('\n');
    }
    

    colorize(text, options = {}) {
        const {
            fg = '97',
            bg = '',
            bold = false,
            underline = false
        } = options;
    
        const stylesMap = {
            '1': bold,
            '4': underline,
            [`38;5;${fg}`]: fg,
            [`48;5;${bg}`]: bg
        };
    
        const styles = Object.keys(stylesMap)
            .filter(key => stylesMap[key])
            .join(';');
    
        const stylePrefix = styles ? `\x1b[${styles}m` : '';
        const resetStyle = '\x1b[0m';
    
        return `${stylePrefix}${text}${resetStyle}`;
    }

    highlightCursor(line, cursorX, cursorStyle) {
        if (cursorX < line.length) {
            return line.slice(0, cursorX) +
                   this.colorize(line[cursorX], cursorStyle) +
                   line.slice(cursorX + 1);
        } else {
            return line + this.colorize(' ', cursorStyle);
        }
    }

    highlightKeywords(line, keywords, keywordStyle) {
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            line = line.replace(regex, match => this.colorize(match, keywordStyle));
        });
        return line;
    }

    moveCursorVertical(count) {
        const lines = this.buffer.lines;
        let newY = this.cursor.y + count;
        newY = Math.max(0, Math.min(newY, lines.length - 1));
        if (lines[newY].length === 0) {
            this.cursor.x = 0;
        } else {
            this.cursor.x = Math.min(this.cursor.x, lines[newY].length);
        }

        this.cursor.moveVertical(count, lines.length);
        this.updateCursorPosition(this.cursor.x, newY);
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

        this.cursor.moveHorizontal(count, lines[this.cursor.y] ? lines[this.cursor.y].length : 0);
        this.updateCursorPosition(this.cursor.x, this.cursor.y);
    }
}

module.exports = Window;
