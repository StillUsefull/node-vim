const fs = require('fs-extra');
const path = require('path');

class FileBuffer {
    constructor(filePath) {
        this.filePath = filePath;
        this.lines = [' '];
        this.load(); 
    }

    
    async load() {
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            this.lines = content.split('\n');
        } catch (error) {
            this.lines = [];
        }
    }

    async save() {
        await fs.writeFile(this.filePath, this.toString(), 'utf8');
    }
    
    getFileName() {
        return path.basename(this.filePath);
    }

    getDirectory() {
        return path.dirname(this.filePath);
    }
    
    getLine(index) {
        return this.lines[index] || '';
    }
    
    setLine(index, content) {
        this.lines[index] = content;
    }

    insertLine(index, content) {
        this.lines.splice(index, 0, content);
    }
    
    deleteLine(index) {
        this.lines.splice(index, 1);
    }
    
    getLineCount() {
        return this.lines.length;
    }

    removeCharacter(char, line) {
        const currentLine = this.getLine(line);
        if (char > 0) {
            this.setLine(line, currentLine.slice(0, char - 1) + currentLine.slice(char));
        } else if (line > 0) {
            const prevLine = this.getLines()[line - 1].slice(0, -1)
            const currentLine = this.getLines()[line]
            this.setLine(line - 1, prevLine + currentLine);
            this.deleteLine(line);
        }
    }

    removeAnsiStyles(text) {
        const ansiRegex = /\x1b\[[0-9;]*m/g;
        return text.replace(ansiRegex, '');
    }

    getLines() {
        const lines = this.lines.map(line => line.replace(/\n/g, ''));
        return lines.map(line => this.removeAnsiStyles(line));
    }
    
    toString() {
        return this.getLines().join('\n');
    }
}

module.exports = FileBuffer;
