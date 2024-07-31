const fs = require('fs-extra');
const path = require('path');
const createPopup = require('../popup');


class FileTree {
    constructor(parent, fileSelectCallback) {
        this.fileTreeBox = this.createFileTreeBox(parent);
        this.fileSelectCallback = fileSelectCallback;
        this._directoryPath = process.cwd();
        this.selectedLine = 0;
        this.selectedItem = './';  
        this.isFocused = false;
        this.initialize();
    }

    createFileTreeBox(parent) {
        return blessed.box({
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
                focus: {
                    border: {
                        fg: 'yellow'
                    }
                }
            },
            scrollable: true,
            mouse: true,
            alwaysScroll: true,
            content: '',
            focusable: true
        });
    }

    focus() {
        this.isFocused = true;
        this.fileTreeBox.focus();
        this.fileTreeBox.screen.render();
    }

    unfocus() {
        this.isFocused = false;
    }

    async updateContent() {
        try {
            const files = await fs.readdir(this.directoryPath);
            const content = ['-> ../', ...await Promise.all(files.map(async (file) => {
                const filePath = path.join(this.directoryPath, file);
                const isDirectory = await fs.stat(filePath).then(stat => stat.isDirectory());
                return isDirectory ? `${file}/` : file;
            }))].join('\n');
            this.fileTreeBox.setContent(content);
            this.selectedLine = 0;
            this.fileTreeBox.screen.render();
        } catch (error) {
            createPopup('error', this.fileTreeBox.parent, error.message);
        }
    }

    updateSelection(newLine) {
        let content = this.fileTreeBox.getContent();
        const cleanContent = _.replace(content, /-> /g, '');
        const lines = _.split(cleanContent, '\n');
        const updatedLines = _.map(lines, (line, index) => 
            index === newLine ? `-> ${line}` : line
        );
        const updatedContent = _.join(updatedLines, '\n');
        this.fileTreeBox.setContent(updatedContent);
        this.fileTreeBox.screen.render();
    }

    async handleKeypress(key) {
        if (!this.isFocused) return;

        const lines = this.fileTreeBox.getContent().split('\n');
        switch (key.name) {
            case 'up':
                this.selectedLine = _.max([0, this.selectedLine - 1]);
                this.updateSelection(this.selectedLine);
                break;
            case 'down':
                this.selectedLine = _.min([lines.length - 1, this.selectedLine + 1]); 
                this.updateSelection(this.selectedLine);
                break;
            case 'enter':
                await this.handleEnter(lines);
                break;
            default:
                break;
        }
    }

    async handleEnter(lines) {
        this.selectedItem = _.replace(lines[this.selectedLine], /^-> /, '');
        const selectedPath = path.join(this.directoryPath, this.selectedItem);
        if (this.selectedItem === '../') {
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

        this.fileTreeBox.screen.key(['up', 'down', 'enter'], (ch, key) => this.handleKeypress(key));
    }
}

module.exports = FileTree;
