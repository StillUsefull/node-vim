const path = require('path');

const Editor = require('../boxes/editor/Editor');
const FileManager = require('../boxes/fileTree');

class EditorScene {
    constructor(parent) {
        this.editorScene = this.createEditorScene(parent);
        this.fileTreeBox = new FileManager(this.editorScene, this.openFile.bind(this));
        this.editors = [];  
        this.activeEditorIndex = -1;
        this.currentEditor = null;  
        this.tabBar = this.createTabBar();
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

    createTabBar() {
        return blessed.listbar({
            parent: this.editorScene,
            top: 0,
            right: 0,
            width: '84%',
            height: 1,
            style: {
                item: {
                    bg: 'blue'
                },
                selected: {
                    bg: 'green'
                }
            },
            items: [],
            keys: true,
            mouse: true
        });
    }

    openFile(filePath) {
        const currentDir = process.cwd() + path.sep;
        const relativePath = filePath.replace(currentDir, '');
        const existingEditorIndex = this.editors.indexOf(filePath);
        if (existingEditorIndex !== -1) {
            this.switchTab(existingEditorIndex); 
            return;
        }
        const newEditor = new Editor(this.editorScene, filePath, this.fileTreeBox);
        newEditor.on('switchTab', (direction) => {
            this.switchTab(direction);
        });
        this.editors.push(filePath);
        this.tabBar.addItem(relativePath); 
        this.switchTab(this.editors.length - 1); 
    }

    switchTab(directionOrIndex) {
        let newIndex;

        if (typeof directionOrIndex === 'number') {
            if (directionOrIndex === 1 || directionOrIndex === -1) {
                newIndex = this.activeEditorIndex + directionOrIndex;
                if (newIndex >= this.editors.length) {
                    newIndex = 0; 
                } else if (newIndex < 0) {
                    newIndex = this.editors.length - 1;
                }
            } else {
                newIndex = directionOrIndex;
            }
        }

        if (this.activeEditorIndex !== -1 && this.currentEditor) {
            this.currentEditor = null;
        }

        this.activeEditorIndex = newIndex;

        const filePath = this.editors[this.activeEditorIndex];
        this.currentEditor = new Editor(this.editorScene, filePath, this.fileTreeBox);
        this.currentEditor.on('switchTab', (direction) => {
            this.switchTab(direction);
        });

        this.currentEditor.on('closeTab', () => {
            this.closeTab()
        })

        this.currentEditor.focus();
        this.tabBar.select(this.activeEditorIndex);
    }

    closeTab() {
        if (this.activeEditorIndex === -1 || !this.currentEditor) return;

        this.currentEditor.destroy();
        this.editors.splice(this.activeEditorIndex, 1); 
        this.tabBar.removeItem(this.activeEditorIndex);
        if (this.editors.length === 0) {
            this.activeEditorIndex = -1;
            this.currentEditor = null;
        } else {
            if (this.activeEditorIndex >= this.editors.length) {
                this.activeEditorIndex = this.editors.length - 1;
            }
            this.switchTab(this.activeEditorIndex);
        }
        this.tabBar.setItems(this.editors.map(filePath => path.basename(filePath)));
        this.tabBar.select(this.activeEditorIndex);
    }

    initialize() {
        this.fileTreeBox.focus();
        this.tabBar.on('select', (item, index) => {
            this.switchTab(index); 
        });
    }
}

module.exports = EditorScene;