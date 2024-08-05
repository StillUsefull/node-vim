const fs = require('fs-extra');
const path = require('path');

class FileBuffer {
    constructor(filePath) {
        this.filePath = filePath;
        this.lines = [];
        this.load(); 
    }

    
    async load() {
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            this.lines = content.split('\n');
        } catch (error) {
            console.error(`Ошибка при загрузке файла ${this.filePath}:`, error);
            this.lines = [];
        }
    }

    async save() {
        try {
            await fs.writeFile(this.filePath, this.toString(), 'utf8');
        } catch (error) {
            console.error(`Ошибка при сохранении файла ${this.filePath}:`, error);
        }
    }

    
    getFileName() {
        return path.basename(this.filePath);
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

    
    toString() {
        return this.lines.join('\n');
    }
}

module.exports = FileBuffer;
