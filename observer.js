const EventEmitter = require('events');
const Api = require('./api');

class Observer extends EventEmitter {
    constructor() {
        super();
        this.boxes = [];
        this.currentTab = 0;

        this.api = new Api(3000, this);

        this.on('focus-next-box', () => this.focusNextBox());
        this.on('text-change', (content) => this.api.broadcast('text-change', content));
        this.on('cursor-move', (position) => this.api.broadcast('cursor-move', position));
        this.on('save', (fileMetadata) => this.api.broadcast('save', fileMetadata));
        this.on('key-pressed', (pressedMetadata) => this.api.broadcast('key-pressed', pressedMetadata));
    }


    addBox(box) {
        this.boxes.push(box);
    }

    focusNextBox() {
        if (this.boxes.length === 0) return;
        let currentIndex = this.boxes.findIndex(box => box.isFocused);
        if (currentIndex === -1) {
            currentIndex = 0;
        } else {
            this.boxes[currentIndex].unfocus();
            currentIndex = (currentIndex + 1) % this.boxes.length;
        }
        this.boxes[currentIndex].focus();
        this.emit('box-focused', this.boxes[currentIndex]);
    }
}

const observer = new Observer();

module.exports = observer;