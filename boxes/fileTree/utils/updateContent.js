const fs = require('fs-extra');
const path = require('path');

module.exports = async function updateContent(dir, fileTreeBox) {
    try {
        const files = await fs.readdir(dir);
        let content = '';
        for (let file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                file += '/';
            }
            content += file + '\n';
        }
        fileTreeBox.setContent(content); 
        fileTreeBox.screen.render();
    } catch (error) {
        console.error(error);
    }
}