const Popup = require('../popup');
const Cursor = require('./Cursor');

class Window {
    constructor(parent, buffer, label) {
        this.buffer = buffer;
        this.box = this.createWindowBox(parent, label);
        this.isFocused = false;
        this.cursor = new Cursor();
        this.render();
        this.createPopup = new Popup(this.box.screen).show;
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

    handleBackspace() {
        if (!this.isFocused) return;
        try {
            const lines = this.buffer.lines;

            if (this.cursor.x > 0) {
                lines[this.cursor.y] = lines[this.cursor.y].slice(0, this.cursor.x - 1) + lines[this.cursor.y].slice(this.cursor.x);
                this.cursor.x = _.max([this.cursor.x - 1, 0]);  
            } else if (this.cursor.y > 0) {
                this.cursor.x = lines[this.cursor.y - 1].length;
                lines[this.cursor.y - 1] += lines[this.cursor.y];
                lines.splice(this.cursor.y, 1);
                this.cursor.y = _.max([this.cursor.y - 1, 0]);  
            }
            this.buffer.setLine(this.cursor.y, lines[this.cursor.y]);
            this.render();
        } catch (error) {
            this.createPopup('error', error.message);
        }
    }

    handleEnter() {
        if (!this.isFocused) return;
        try {
            const lines = this.buffer.lines;
            const currentLine = lines[this.cursor.y] || '';

            const beforeCursor = currentLine.slice(0, this.cursor.x);
            const afterCursor = currentLine.slice(this.cursor.x);

            lines[this.cursor.y] = beforeCursor;
            lines.splice(this.cursor.y + 1, 0, afterCursor);

            this.buffer.setLine(this.cursor.y, beforeCursor);
            this.buffer.setLine(this.cursor.y + 1, afterCursor);

            this.cursor.x = 0;
            this.cursor.y += 1;
            this.render();
        } catch (error) {
            this.createPopup('error', error.message);
        }
    }

    handleInput(ch) {
        if (!this.isFocused) return;
        try {
            const lines = this.buffer.lines;
            let cursorYoffset = 0;

            if (typeof lines[this.cursor.y] !== 'undefined') {
                lines[this.cursor.y] = lines[this.cursor.y].slice(0, this.cursor.x) + ch + lines[this.cursor.y].slice(this.cursor.x);
            } else {
                lines.push(ch);
                cursorYoffset += 1;
            }
            this.buffer.setLine(this.cursor.y, lines[this.cursor.y]);
            this.cursor.x += 1;
            this.cursor.y += cursorYoffset;
            this.render();
        } catch (error) {
            this.createPopup('error', error.message);
        }
    }

    render() {
        try {
            const content = this.getDisplayContent();
            this.box.setContent(content);
            this.box.screen.render();
        } catch (error) {
            this.createPopup('error', error.message);
        }
    }

    getDisplayContent() {
        const lines = this.buffer.lines;
        const maxLineNumberWidth = (lines.length).toString().length;

        return lines.map((line, i) => {
            let updatedLine = this.highlightKeywords(line);
            if (i === this.cursor.y) {
                updatedLine = this.highlightCursor(updatedLine, this.cursor.x);
            }
            const lineNumber = (i + 1).toString().padStart(maxLineNumberWidth, ' ');
            return `${lineNumber} ${updatedLine}`;
        }).join('\n');
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

    highlightCursor(line, cursorX) {
        const maxX = line.length;
    
        if (cursorX < maxX) {
            return line.slice(0, cursorX) +
                   this.colorize(line[cursorX] || ' ', { bg: '82', fg: '97' }) +
                   line.slice(cursorX + 1);
        } else {
            return line + this.colorize(' ', { bg: '82', fg: '97' });
        }
    }

    highlightKeywords(line) {
        const keywordStyle = { fg: '214', bold: true };
        const keywords = []; 
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            line = line.replace(regex, match => this.colorize(match, keywordStyle));
        });
        return line;
    }

    moveCursorVertical(count) {
        const lines = this.buffer.getLines();
        let cursorY = this.cursor.y + count;
        cursorY = _.clamp(cursorY, 0, lines.length - 1);
        this.cursor.y = cursorY;
        this.cursor.x = _.min([this.cursor.x, (lines[this.cursor.y] || '').length]);
        this.render();
    }

    moveCursorHorizontal(count) {
        const lines = this.buffer.getLines();
        let newX = this.cursor.x + count;
        let newY = this.cursor.y;

        if (newX < 0) {
            if (newY > 0) {
                newY -= 1;
                newX = (lines[newY] || '').length;
            } else {
                newX = 0;
            }
        } else if (newX > (lines[newY] || '').length) {
            if (newY < lines.length - 1) {
                newY += 1;
                newX = 0;
            } else {
                newX = (lines[newY] || '').length;
            }
        }

        this.cursor.x = newX;
        this.cursor.y = newY;
        this.render();
    }
}

module.exports = Window;
