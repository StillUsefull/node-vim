const Editor = require('../boxes/editor');
const FileTree = require('../boxes/fileTree');
const Terminal = require('../boxes/terminal')
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
            }
        }
    });
    const fileTreeBox = new FileTree(editorScene);
    const terminalBox = new Terminal(editorScene);
    const editorBox = new Editor(editorScene, 'C:\\Users\\Debis\\Desktop\\git\\node-vim\\test.js');

    let currentFocus = 0;
    const boxes = [fileTreeBox, terminalBox, editorBox];

    function focusNextBox() {
        boxes[currentFocus].unfocus();
        currentFocus = (currentFocus + 1) % boxes.length;
        boxes[currentFocus].focus();
        editorScene.render()
    }

    parent.key(['M-e'], () => {
        focusNextBox();
    });

    return editorScene;
};
