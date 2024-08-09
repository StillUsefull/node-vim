class Cursor {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.preferredCursorX = x;
    }

    moveVertical(count, lines) {
        const linesCount = lines.length;
        this.y += count;
        if (this.y < 0) {
            this.y = 0; 
        } else if (this.y >= linesCount) {
            this.y = linesCount - 1; 
        }
        const newLine = lines[this.y] || " "; 
        if (this.preferredCursorX >= newLine.length) {
            this.x = newLine.length - 1; 
        } else if (newLine.length === 0) {
            this.x = 0; 
        } else {
            this.x = this.preferredCursorX;
        }
    }

    moveHorizontal(count, lines) {
        const lineLength = lines[this.y] ? lines[this.y].length : 0;
        this.x += count;

        if (this.x < 0) {
            if (this.y === 0) {
                this.x = 0; 
            } else {
                this.y -= 1; 
                this.x = lines[this.y] ? lines[this.y].length - 1 : 0; 
            }
        } else if (this.x >= lineLength) {
            if (this.y === lines.length - 1) {
                this.x = lineLength - 1; 
            } else {
                this.x = 0; 
                this.y += 1;
            }
        }
        this.preferredCursorX = this.x;
    }
}

module.exports = Cursor;
