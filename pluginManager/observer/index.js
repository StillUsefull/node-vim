const EventEmitter = require('events');

class Observer extends EventEmitter {
    constructor() {
        super();
    }
}

module.exports = new Observer();