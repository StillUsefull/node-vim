class Cursor {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.preferredCursorX = 0
    }

    updatePosition(newX, newY, maxX, maxY) {
        this.x = _.clamp(newX, 0, maxX);
        this.y = _.clamp(newY, 0, maxY);
    }

    moveVertical(count, linesLength) {
        const newY = this.y + count;
        this.y = _.clamp(newY, 0, linesLength - 1);
    }

    moveHorizontal(count, lineLength) {
        const newX = this.x + count;
        this.x = _.clamp(newX, 0, lineLength);
    }
}

module.exports = Cursor;