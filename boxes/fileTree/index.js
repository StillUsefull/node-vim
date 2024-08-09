const fs = require('fs-extra');
const path = require('path');
const Popup = require('../popup');
const pluginManager = require('../../PluginManager');

class FileManager {
    constructor(parent, fileSelectCallback) {
        this.box = this.createFileTreeBox(parent);
        this.fileSelectCallback = fileSelectCallback;
        this._directoryPath = process.cwd();
        this.pluginManager = pluginManager;
        this.createPopup = new Popup(this.box.screen).show;
        this.items = []
        this.currentIndex = 0
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
        this.box.focus();
        this.box.screen.render();
    }

    async updateContent() {
        try {
            const files = await fs.readdir(this.directoryPath);
            const items = ['../', ...await Promise.all(files.map(async (file) => {
                const filePath = path.join(this.directoryPath, file);
                const isDirectory = await fs.stat(filePath).then(stat => stat.isDirectory());
                return isDirectory ? `${file}/` : file;
            }))];
            this.items = items
            this.box.setItems(items);
            this.box.screen.render();
        } catch (error) {
            this.createPopup('error', error.message);
        }
    }

    getSelectedItem(){
        return this.items[this.currentIndex];
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
                }
            } catch (error) {
                this.createPopup('error', error.message);
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

    move(direction) { 
        let newIndex = this.currentIndex + direction;
        if (newIndex < 0) {
            newIndex = 0;
        } else if (newIndex >= this.box.items.length) {
            newIndex = this.box.items.length - 1;
        }
        this.currentIndex = newIndex;
    }


    initialize() {
        this.updateContent();

        this.watcher = fs.watch(this.directoryPath, (eventType, filename) => {
            if (eventType === 'rename' && filename) {
                this.updateContent();
            }
        });

        this.box.on('select', (item) => {
            const selectedItem = item.getText();
            this.handleEnter(selectedItem);
        });

        this.box.on('keypress', (ch, key) => {
            if (key.name === 'up') {
                this.move(-1); 
            } else if (key.name === 'down') {
                this.move(1); 
            } else {
                this.pluginManager.handleKeyPress(key, this);
            }
        });

    }
}

module.exports = FileManager;