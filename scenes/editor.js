const Editor = require('../boxes/editor/Editor');
const FileTree = require('../boxes/fileTree');
const Terminal = require('../boxes/terminal');
const observer = require('../observer');

class EditorScene {
    constructor(parent) {
        this.editorScene = this.createEditorScene(parent);
        this.fileTreeBox = new FileTree(this.editorScene, this.openFile.bind(this));
        this.terminalBox = new Terminal(this.editorScene);

        // Add each box separately
        observer.addBox(this.fileTreeBox);
        observer.addBox(this.terminalBox);

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

    createTab(label) {
        const tab = blessed.box({
            parent: this.editorScene,
            top: 0,
            left: this.tabs.length * 10,
            width: 10,
            height: 1,
            content: label,
            border: {
                type: 'line'
            },
            style: {
                fg: this.currentTab === this.tabs.length ? 'yellow' : 'white',
                bg: 'blue'
            },
            clickable: true
        });

        tab.on('click', () => {
            this.switchTab(this.tabs.length);
        });

        this.tabs.push(tab);
    }

    switchTab(index) {
        const editors = observer.editors;
        if (index < 0 || index >= editors.length) return;
        editors[this.currentTab].unfocus();
        this.currentTab = index;
        editors[this.currentTab].focus();
        this.updateTabStyles();
    }

    updateTabStyles() {
        this.tabs.forEach((tab, index) => {
            tab.style.fg = index === this.currentTab ? 'yellow' : 'white';
        });
        this.editorScene.render();
    }

    openFile(filePath) {
        let editor = observer.getEditorByFilePath(filePath);
        if (!editor) {
            editor = new Editor(this.editorScene, filePath);
            observer.addEditor(editor, filePath);
            this.createTab(filePath.split('/').pop());
        }
        this.switchTab(observer.getFilePaths().indexOf(filePath));
    }

    initialize() {
        this.editorScene.key(['tab'], () => {
            observer.emit('focus-next-box');
        });
        if (observer.editors.length > 0) {
            observer.editors[0].focus();
        }
    }
}

module.exports = EditorScene;