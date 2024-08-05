const Editor = require('../boxes/editor/Editor');
const FileTree = require('../boxes/fileTree');
const observer = require('../observer');

class EditorScene {
    constructor(parent) {
        this.editorScene = this.createEditorScene(parent);
        this.fileTreeBox = new FileTree(this.editorScene, this.openFile.bind(this));
        observer.addBox(this.fileTreeBox);
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

   

    openFile(filePath) {
        if (this.editor) {
            this.editor.unfocus();  
        }
        this.editor = new Editor(this.editorScene, filePath);
        observer.addBox(this.editor.window, filePath);
        this.editor.focus();  
    }

    initialize() {
        this.editorScene.key(['home'], () => {
            observer.emit('focus-next-box');
        });

        observer.on('focus-next-box', () => {
            if (this.fileTreeBox.isFocused()) {
                this.fileTreeBox.unfocus();
                if (this.editor) {
                    this.editor.focus();
                }
            } else if (this.editor && this.editor.window.isFocused()) {
                this.editor.unfocus();
                this.fileTreeBox.focus();
            }
        });

        this.fileTreeBox.focus();
    }
}

module.exports = EditorScene;