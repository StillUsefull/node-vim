const fileTreeBox = require('./box');
const functionality = require('./functionality');

async function initialize(parent, parentDir) {
    const fileTree = fileTreeBox(parent);
    const directoryPath = parentDir || process.cwd();
    await functionality(fileTree, directoryPath);
}

module.exports = initialize;