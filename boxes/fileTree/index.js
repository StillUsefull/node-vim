const fs = require('fs-extra');
const path = require('path');
const blessed = require('blessed');

class FileTree {
    constructor(parent, dir) {
        this.fileTreeBox = this.createFileTreeBox(parent);
        this.directoryPath = dir || process.cwd();
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
            style: {
                border: {
                    fg: 'blue'
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
            let content = '../\n';
            for (let file of files) {
                const filePath = path.join(this.directoryPath, file);
                if (await fs.stat(filePath).then(stat => stat.isDirectory())) {
                    file += '/';
                }
                content += file + '\n';
            }
            this.fileTreeBox.setContent(content);
            this.fileTreeBox.screen.render();
        } catch (error) {
            console.error(error);
        }
    }

    updateSelection(newLine) {
        let content = this.fileTreeBox.getContent();
        const cleanContent = content.replace(/-> /g, '');
        const lines = cleanContent.split('\n');
        const updatedLines = lines.map((line, index) =>
            index === newLine ? `-> ${line}` : `${line}`
        ).join('\n');
        this.fileTreeBox.setContent(updatedLines);
        this.fileTreeBox.screen.render();
    }

    async handleKeypress(key) {
        if (this.isFocused) {
            const lines = this.fileTreeBox.getContent().split('\n');
    
            switch (key.name) {
                case 'up':
                    this.selectedLine = Math.max(0, this.selectedLine - 1);
                    this.updateSelection(this.selectedLine);
                    break;
                
                case 'down':
                    this.selectedLine = Math.min(lines.length - 1, this.selectedLine + 1);
                    this.updateSelection(this.selectedLine);
                    break;
    
                case 'enter':
                    if (this.selectedItem === './') {
                        this.directoryPath = path.join(this.directoryPath, '..');
                        await this.updateContent();
                        this.selectedLine = 0;
                        this.updateSelection(this.selectedLine);
                    } else {
                        const selectedPath = path.join(this.directoryPath, this.selectedItem);
                        const stats = await fs.stat(selectedPath);
                        if (stats.isDirectory()) {
                            this.directoryPath = selectedPath;
                            await this.updateContent();
                            this.selectedLine = 0;
                            this.updateSelection(this.selectedLine);
                        } else {
                            // Handle file - leaving empty
                        }
                    }
                    break;
    
                default:
                    break;
            }
        }
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

    destroy() {
        if (this.watcher) {
            this.watcher.close();
        }
    }
}

module.exports = FileTree;
