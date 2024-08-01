const blessed = require('blessed');
const Editor = require('../boxes/editor');
const FileTree = require('../boxes/fileTree');
const Terminal = require('../boxes/terminal');
const Api = require('../pluginManager/api')
const Observer = require('../pluginManager/observer');

class EditorScene {
    constructor(parent, observer) {
        this.currentFocus = 0;
        this.editorScene = this.createEditorScene(parent);
        this.editorBox = new Editor(this.editorScene, ''); 
        this.fileTreeBox = new FileTree(this.editorScene, this.openFile.bind(this)); 
        this.terminalBox = new Terminal(this.editorScene);
        this.api = new Api(3000, this.editorBox, observer)
        this.boxes = [this.fileTreeBox, this.terminalBox, this.editorBox];
        this.initialize();
    }
    
    createEditorScene(parent) {
        return blessed.box({
            label: 'node-vim',
            parent,
            width: '100%',
            height: '100%',
            border: {
                type: 'line'
            },
            style: {
                border: {
                    fg: 'blue'
                }
            },
        });
    }

    focusNextBox() {
        this.boxes[this.currentFocus].unfocus();
        this.currentFocus = (this.currentFocus + 1) % this.boxes.length;
        this.boxes[this.currentFocus].focus();
        this.editorScene.render();
    }

    openFile(filePath) {
        this.editorBox.setFilePath(filePath);
        this.fileTreeBox.unfocus();
        this.editorBox.focus();
    }

    initialize() {
        this.editorScene.parent.key(['home'], () => {
            this.focusNextBox();
        });
    }
}

module.exports = EditorScene;
