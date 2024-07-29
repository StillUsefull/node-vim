const fs = require('fs-extra');
const path = require('path');


class FileTree {
    constructor(parent, dir) {
        this.fileTreeBox = this.createFileTreeBox(parent);
        this.directoryPath = dir || process.cwd();
        this.selectedLine = 0;
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

    unfocus(){
        this.isFocused = false;
    }

    async updateContent() {
        try {
            const files = await fs.readdir(this.directoryPath);
            let content = '';
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

    handleKeypress(key) {
        if (this.isFocused){
            if (key.name === 'up') {
                this.selectedLine = Math.max(0, this.selectedLine - 1);
                this.updateSelection(this.selectedLine);
            } else if (key.name === 'down') {
                const lines = this.fileTreeBox.getContent().split('\n');
                this.selectedLine = Math.min(lines.length - 1, this.selectedLine + 1);
                this.updateSelection(this.selectedLine);
            } else if (key.name === 'enter') {
                const content = this.fileTreeBox.getContent().split('\n');
                const selectedItem = content[this.selectedLine];
                console.log(`Selected: ${selectedItem}`);
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
