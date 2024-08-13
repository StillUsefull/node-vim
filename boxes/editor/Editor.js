const EventEmitter = require('events')

const Popup = require('../popup');
const FileBuffer = require('./File');
const Window = require('./Window');
const PluginManager = require('../../PluginManager');


class Editor extends EventEmitter {
    constructor(parent, filePath, treeBox) {
        super()
        this.buffer = new FileBuffer(filePath);
        this.window = new Window(parent, this.buffer, this.buffer.getFileName());
        this.pluginManager = PluginManager;
        this.createPopup = new Popup(this.window.box).show;
        this.initialize(treeBox);
    }

    destroy(){
        this.window.box.destroy();
        this.window = null;
    }

    focus() {
        this.window.focus();
    }

    unfocus() {
        this.window.unfocus();
    }

    async initialize(treeBox) {
        await this.buffer.load();
        this.window.render();

        this.window.box.on('keypress', (ch, key) => {
            if (this.window.isFocused) {
                switch (true) {
                    case (key.ctrl && key.name === 'right'):
                        this.emit('switchTab', 1);
                        break
                    case (key.ctrl && key.name === 'left'):
                        this.emit('switchTab', -1);
                        break
                    case (key.ctrl && key.name === 'delete'):
                        this.emit('closeTab');
                        break
                    case (key.ctrl && key.name === 's'):
                        this.buffer.save().then(() => {
                            this.createPopup('success', 'File was saved successfully');
                        });
                        break;
                    case (key.name === 'left'):
                        this.window.moveCursorHorizontal(-1);
                        break;
                    case (key.name === 'right'):
                        this.window.moveCursorHorizontal(1);
                        break;
                    case (key.name === 'up'):
                        this.window.moveCursorVertical(-1);
                        break;
                    case (key.name === 'down'):
                        this.window.moveCursorVertical(1);
                        break;
                    case (key.name === 'backspace'):
                        this.window.handleBackspace();
                        break;
                    case (key.name === 'return'):
                        this.window.handleEnter();
                        break;
                    case (key.name === 'escape'):
                        this.window.unfocus();
                        treeBox.focus();
                        break;
                    default:
                        if (ch) {
                            this.window.handleInput(ch);
                        }
                        break;
                }
                this.pluginManager.handleKeyPress(key, this);
            }
        });
        const originalGetDisplayContent = this.window.getDisplayContent.bind(this.window);
        this.window.getDisplayContent = (...args) => {
            let content = originalGetDisplayContent(...args);
            content = this.pluginManager.updateDisplayContent(content, this);
            return content;
        };
    }
}

module.exports = Editor;