const updateContent = require('./utils/updateContent');
const handleKeypress = require('./utils/handleKeypress');

async function functionality(fileTreeBox, dir) {
    await updateContent(dir, fileTreeBox);
    
    const state = {
        selectedLine: 0
    };

    fileTreeBox.screen.key(['up', 'down', 'enter'], (ch, key) => handleKeypress(key, state, fileTreeBox));
}

module.exports = functionality;
