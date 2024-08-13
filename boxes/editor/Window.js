const Popup = require('../popup');
const Cursor = require('./Cursor');

class Window {
    constructor(parent, buffer, label) {
        this.buffer = buffer;
        this.box = this.createWindowBox(parent, label);
        this.isFocused = false;
        this.cursor = new Cursor();
        this.render();
        this.createPopup = (type, content, timeout = 2000) => {
            new Popup(this.box.screen).show(type, content, timeout);
        };
    }

    createWindowBox(parent, label) {
        return blessed.box({
            label,
            parent,
            bottom: 0,
            right: 0,
            width: '84%',
            height: '96%',
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
            const { x, y } = this.cursor;
            this.cursor.moveHorizontal(-1,  this.buffer.getLines())
            this.buffer.removeCharacter(x, y);
            this.render();
        } catch (error) {
            this.createPopup('error', error.message);
        }
    }

    handleEnter() {
        if (!this.isFocused) return;
        try {
            const currentLine = this.buffer.getLine(this.cursor.y);
            const beforeCursor = currentLine.slice(0, this.cursor.x);
            const afterCursor = currentLine.slice(this.cursor.x);
            this.buffer.setLine(this.cursor.y, beforeCursor);
            this.buffer.insertLine(this.cursor.y + 1, afterCursor);
            this.cursor.preferredCursorX = 0;
            this.cursor.moveVertical(1, this.buffer.getLines());
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
            this.cursor.preferredCursorX += 1;
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
        this.cursor.moveVertical(count, lines);
        this.render();
    }

    moveCursorHorizontal(direction) {
        const lines = this.buffer.getLines();
        this.cursor.moveHorizontal(direction, lines);
        this.render();
    }
}

module.exports = Window;
