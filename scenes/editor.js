const Editor = require('../boxes/editor/Editor');
const FileTree = require('../boxes/fileTree');

class EditorScene {
    constructor(parent) {
        this.editorScene = this.createEditorScene(parent);
        this.fileTreeBox = new FileTree(this.editorScene, this.openFile.bind(this));
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
        this.editor = new Editor(this.editorScene, filePath, this.fileTreeBox);
        this.editor.focus();  
    }

    initialize() {
        this.fileTreeBox.focus();
    }
}

module.exports = EditorScene;