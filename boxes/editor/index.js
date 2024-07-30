const fs = require('fs-extra');
const blessed = require('blessed');
const createPopup = require('../popup');

class Editor {
    constructor(parent, filePath, nextBoxCallback) {
        this.filePath = filePath;
        this.editorBox = this.createEditorBox(parent);
        this.isFocused = false;
        this.nextBoxCallback = nextBoxCallback;
        this.initialize();
    }

    createEditorBox(parent) {
        return blessed.textarea({
            label: 'Editor',
            parent,
            top: 0,
            right: 0,
            width: '85%',
            height: '73%',
            border: {
                type: 'line'
            },
            style: {
                border: {
                    fg: "blue"
                },
                focus: {
                    border: {
                        fg: "yellow"
                    }
                }
            },
            scrollable: true,
            mouse: true,
            alwaysScroll: true,
            keys: true,
            vi: true,
            inputOnFocus: true,
            content: '',
            cursor: {
                shape: 'block', // Устанавливаем форму курсора как 'block'
                blink: true, // Включаем мигание курсора
                color: 'yellow' // Устанавливаем цвет курсора
            }
        });
    }

    focus() {
        this.isFocused = true;
        this.editorBox.focus();
        this.editorBox.screen.render();
    }

    unfocus() {
        this.isFocused = false;
    }

    setContent(content) {
        this.editorBox.setValue(content);
        this.editorBox.screen.render();
    }

    getContent() {
        return this.editorBox.getValue();
    }

    saveFile() {
        const content = this.getContent();
        fs.writeFile(this.filePath, content, 'utf8', (err) => {
            if (err) {
                console.error('Error saving file:', err);
            } else {
                createPopup(this.editorBox, 'File was saved');
                this.editorBox.render();
            }
        });
    }

    initialize() {
        if (this.filePath) {
            fs.readFile(this.filePath, 'utf8', (err, data) => {
                if (err) {
                    createPopup(err.message);
                    return;
                }
                this.setContent(data);
            });
        }

        this.editorBox.on('keypress', (ch, key) => {
            if (this.isFocused) {
                if (key.ctrl && key.name === 's') {
                    this.saveFile();
                } else if (key.meta && key.name === 'e') {
                    this.unfocus();
                    if (this.nextBoxCallback) {
                        this.nextBoxCallback();
                    }
                }
            }
        });
    }
}

module.exports = Editor;
