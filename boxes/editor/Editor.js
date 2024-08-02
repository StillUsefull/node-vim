
const FileBuffer = require('./File.js')
const Window = require('./Window.js')

class Editor {
    constructor(parent, filePath) {
        this.buffer = new FileBuffer(filePath);
        this.window = new Window(parent, this.buffer);
        this.initialize();
    }
    
    focus(){
        this.window.focus()
    }

    unfocus(){
        this.window.unfocus()
    }
    
    async initialize() {
        await this.buffer.load();
        this.window.render();

        this.window.box.on('keypress', (ch, key) => {
            if (this.window.isFocused) {
                switch (true) {
                    case (key.ctrl && key.name === 's'):
                        this.buffer.save().then(() => {
                            Observer.emit('save', { content: this.buffer.getContent() });
                        });
                        break;
                    case (key.name === 'left'):
                        this.window.moveCursorLeft();
                        Observer.emit('cursor-move', this.window.cursor);
                        break;
                    case (key.name === 'right'):
                        this.window.moveCursorRight();
                        Observer.emit('cursor-move', this.window.cursor);
                        break;
                    case (key.name === 'up'):
                        this.window.moveCursorUp();
                        Observer.emit('cursor-move', this.window.cursor);
                        break;
                    case (key.name === 'down'):
                        this.window.moveCursorDown();
                        Observer.emit('cursor-move', this.window.cursor);
                        break;
                    case (key.name === 'backspace'):
                        this.window.handleBackspace();
                        break;
                    case (key.name === 'return'):
                        this.window.handleEnter();
                        break;
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