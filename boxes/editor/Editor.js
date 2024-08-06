
const FileBuffer = require('./File.js')
const Window = require('./Window.js')
const observer = require('../../observer.js');
const createPopup = require('../popup/index.js');
class Editor {
    constructor(parent, filePath, treeBox) {
        this.buffer = new FileBuffer(filePath);
        this.window = new Window(parent, this.buffer, this.buffer.getFileName());
        this.initialize(treeBox);
    }
    
    focus(){
        this.window.focus()
    }

    unfocus(){
        this.window.unfocus()
    }
    
    async initialize(treeBox) {
        await this.buffer.load();
        this.window.render();

        this.window.box.on('keypress', (ch, key) => {
            if (this.window.isFocused) {
                switch (true) {
                    case (key.ctrl && key.name === 's'):
                        this.buffer.save().then(() => {
                            createPopup('success', this.window.box, 'File was saved successfully')
                            // observer.emit('save', { content:  });
                        });
                        break;
                    case (key.name === 'left'):
                        this.window.moveCursorHorizontal(-1);
                        observer.emit('cursor-move', this.window.cursor);
                        break;
                    case (key.name === 'right'):
                        this.window.moveCursorHorizontal(1);
                        observer.emit('cursor-move', this.window.cursor);
                        break;
                    case (key.name === 'up'):
                        this.window.moveCursorVertical(-1);
                        observer.emit('cursor-move', this.window.cursor);
                        break;
                    case (key.name === 'down'):
                        this.window.moveCursorVertical(1);
                        observer.emit('cursor-move', this.window.cursor);
                        break;
                    case (key.name === 'backspace'):
                        this.window.handleBackspace();
                        break;
                    case (key.name === 'return'):
                        this.window.handleEnter();
                        break;
                    case (key.name === 'escape'):
                        this.window.unfocus();
                        treeBox.focus()
                    default:
                        if (ch) {
                            this.window.handleInput(ch);
                        }
                        break;
                }
            }
        });
    }
}

module.exports = Editor;