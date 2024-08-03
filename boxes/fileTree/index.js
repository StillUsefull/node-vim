const fs = require('fs-extra');
const path = require('path');
const createPopup = require('../popup');
const observer = require('../../observer');

class FileTree {
    constructor(parent, fileSelectCallback) {
        this.fileTreeBox = this.createFileTreeBox(parent);
        this.fileSelectCallback = fileSelectCallback;
        this._directoryPath = process.cwd();
        this.selectedItem = './';
        this.initialize();
    }

    createFileTreeBox(parent) {
        return blessed.list({
            label: 'Files',
            parent,
            top: 0,
            left: 0,
            width: '15%',
            height: '97%',
            border: {
                type: 'line'
            },
            scrollbar: {
                bg: 'blue'
            },
            style: {
                border: {
                    fg: 'blue'
                },
                selected: {
                    bg: 'blue',
                    fg: 'white'
                },
                focus: {
                    border: {
                        fg: 'yellow'
                    }
                }
            },
            scrollable: true,
            mouse: true,
            alwaysScroll: true,
            keys: true,
            vi: true,
            items: []
        });
    }

    focus() {
        this.fileTreeBox.focus();
        this.fileTreeBox.screen.render();
    }

    unfocus() {
        
    }

    async updateContent() {
        try {
            const files = await fs.readdir(this.directoryPath);
            const items = ['../', ...await Promise.all(files.map(async (file) => {
                const filePath = path.join(this.directoryPath, file);
                const isDirectory = await fs.stat(filePath).then(stat => stat.isDirectory());
                return isDirectory ? `${file}/` : file;
            }))];
            this.fileTreeBox.setItems(items);
            this.fileTreeBox.screen.render();
        } catch (error) {
            createPopup('error', this.fileTreeBox.parent, error.message);
        }
    }

    async handleEnter(selectedItem) {
        const selectedPath = path.join(this.directoryPath, selectedItem);
        if (selectedItem === '../') {
            this.directoryPath = path.join(this.directoryPath, '..');
        } else {
            try {
                const stats = await fs.stat(selectedPath);
                if (stats.isDirectory()) {
                    this.directoryPath = selectedPath;
                } else {
                    this.fileSelectCallback(selectedPath);
                    observer.emit('file-selected', selectedPath);
                }
            } catch (error) {
                createPopup('error', this.fileTreeBox.parent, error.message);
            }
        }
    }

    set directoryPath(newPath) {
        this._directoryPath = newPath;
        this.updateContent();
        if (this.watcher) {
            this.watcher.close();
        }
        this.watcher = fs.watch(this._directoryPath, (eventType, filename) => {
            if (eventType === 'rename' && filename) {
                this.updateContent();
            }
        });
    }

    get directoryPath() {
        return this._directoryPath;
    }

    initialize() {
        this.updateContent();

        this.watcher = fs.watch(this.directoryPath, (eventType, filename) => {
            if (eventType === 'rename' && filename) {
                this.updateContent();
            }
        });

        this.fileTreeBox.on('select', (item) => {
            const selectedItem = item.getText();
            this.handleEnter(selectedItem);
        });
    }
}

module.exports = FileTree;
