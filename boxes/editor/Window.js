const blessed = require('blessed');
const createPopup = require('../popup');
const Cursor = require('./Cursor');

class Window {
    constructor(parent, buffer, label) {
        this.buffer = buffer;
        this.box = this.createWindowBox(parent, label);
        this.isFocused = false;
        this.cursor = new Cursor();
        this.data = { preferredCursorX: 0, updatePreferredX: true };
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
            const maxX = (lines[newY] || '').length;
            const maxY = lines.length - 1;
            newX = Math.min(newX, maxX);
            this.cursor.updatePosition(newX, newY, maxX, maxY);
            this.data.preferredCursorX = this.cursor.x;
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
            const currentLine = lines[this.cursor.y] || '';
    
            const beforeCursor = currentLine.slice(0, this.cursor.x);
            const afterCursor = currentLine.slice(this.cursor.x);
    
            lines[this.cursor.y] = beforeCursor;
            lines.splice(this.cursor.y + 1, 0, afterCursor);
    
            this.buffer.setLine(this.cursor.y, beforeCursor);
            if (this.cursor.y + 1 < lines.length) {
                this.buffer.setLine(this.cursor.y + 1, afterCursor);
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

        return lines.map((line, index) => `${index + 1} ${line}`).join('\n');
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

    moveCursorVertical(count, paragraphs) {
        const lines = this.buffer.lines;
        let cursor = { row: this.cursor.y, column: this.cursor.x };
    
        
        if (count < 0 && cursor.row === 0) {
            cursor.row = 0;
            cursor.column = 0;
        } else if (count > 0 && cursor.row === lines.length - 1) {
            cursor.row = lines.length - 1;
            cursor.column = lines[cursor.row].length;
        } else {
            if (paragraphs) {
                paragraphs = Math.abs(count);
                const direction = count ? paragraphs / count : 0;
                while (paragraphs--) {
                    while (true) {
                        cursor.row += direction;
    
                        if (!(0 <= cursor.row && cursor.row < lines.length)) break;
                        if (/^\s*$/g.test(lines[cursor.row])) break;
                    }
                }
            } else {
                cursor.row += count;
            }
        }
    
        
        let preferredX = this.data.preferredCursorX;
        if (typeof preferredX !== 'undefined') {
            cursor.column = Math.min(preferredX, lines[cursor.row].length);
        }
    
        this.data.updatePreferredX = false;
        this.updateCursorPosition(cursor.column, cursor.row);
        this.data.updatePreferredX = true;
    }

    moveCursorHorizontal(count) {
        const lines = this.buffer.lines;
        let newX = this.cursor.x + count;
        let newY = this.cursor.y;
    
        
        if (newX < 0) {
            if (newY > 0) {
                newY -= 1;
                newX = lines[newY].length;
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
    
        this.updateCursorPosition(newX, newY);
    }
}

module.exports = Window;
