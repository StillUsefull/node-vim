const fileTreeBox = require('../boxes/fileTree');
const terminalBox = require('../boxes/terminal')
module.exports = function(parent) {
    const editorScene = blessed.box({
        label: 'node-vim',
        parent,
        width: '100%',
        height: '100%',
        border: {
            type: 'line'
        },
        style: {
            border: {
                fg: 'blue'
            },
            label: {
                
            }
        }
    });

    fileTreeBox(editorScene);
    terminalBox(editorScene)
    return editorScene;
};
