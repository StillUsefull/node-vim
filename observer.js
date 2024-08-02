const EventEmitter = require('events');
const Api = require('./api');

class Observer extends EventEmitter {
    constructor() {
        super();
        this.editors = [];
        this.filePaths = [];
        this.boxes = [];
        this.currentTab = 0;

        this.api = new Api(3000, this);

        this.on('focus-next-box', () => this.focusNextBox());
        this.on('focus-next-tab', () => this.focusNextEditor());
        this.on('text-change', (content) => this.api.broadcast('text-change', content));
        this.on('cursor-move', (position) => this.api.broadcast('cursor-move', position));
        this.on('save', (fileMetadata) => this.api.broadcast('save', fileMetadata));
        this.on('key-pressed', (pressedMetadata) => this.api.broadcast('key-pressed', pressedMetadata));
    }

    addEditor(editor, filePath) {
        this.editors.push(editor);
        this.filePaths.push(filePath);
    }

    getEditorByFilePath(filePath) {
        const index = this.filePaths.indexOf(filePath);
        if (index !== -1) {
            return this.editors[index];
        }
        return null;
    }

    addBox(box) {
        this.boxes.push(box);
    }

    getCurrentTab() {
        return this.editors[this.currentTab];
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

    focusNextEditor() {
        if (this.editors.length === 0) return;
        this.editors[this.currentTab].unfocus();
        this.currentTab = (this.currentTab + 1) % this.editors.length;
        this.editors[this.currentTab].focus();
        this.emit('editor-focused', this.filePaths[this.currentTab]);
    }
}

const observer = new Observer();

module.exports = observer;