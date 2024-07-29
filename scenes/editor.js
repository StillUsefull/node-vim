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

    let currentFocus = 0;
    const boxes = [fileTreeBox, terminalBox];

    function focusNextBox() {
        boxes[currentFocus].unfocus();
        currentFocus = (currentFocus + 1) % boxes.length;
        boxes[currentFocus].focus();
    }

    parent.key(['tab'], () => {
        focusNextBox();
    });

    terminalBox.focus();

    return editorScene;
};
