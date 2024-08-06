const EventEmitter = require('events');

class Observer extends EventEmitter {
    constructor() {
        super();

        // this.on('text-change', (content) => this.api.broadcast('text-change', content));
        // this.on('cursor-move', (position) => this.api.broadcast('cursor-move', position));
        // this.on('save', (fileMetadata) => this.api.broadcast('save', fileMetadata));
        // this.on('key-pressed', (pressedMetadata) => this.api.broadcast('key-pressed', pressedMetadata));
    }

}

const observer = new Observer();

module.exports = observer;