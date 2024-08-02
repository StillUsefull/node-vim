const fs = require('fs-extra')

class FileBuffer {
    constructor(filePath){
        this.filePath = filePath;
        this.content = ''
    }

    async load(){
        if (this.filePath){
            this.content = await fs.readFile(this.filePath, 'utf-8');
        } else {
            this.content = '';
        }
    }

    async save(){
        if (this.filePath) {
            await fs.writeFile(this.filePath, this.content, 'utf8');
        }
    }

    setContent(content) {
        this.content = content;
    }

    getContent() {
        return this.content;
    }
}

module.exports = FileBuffer