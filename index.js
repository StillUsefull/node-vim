global.blessed = require('blessed');

const EditorScene = require('./scenes/editor.js');

const screen = blessed.screen({
    smartCSR: true,
    title: 'node-vim'
});


const editorScene = EditorScene(screen);

screen.append(editorScene);

screen.key(['escape', 'C-q'], function(ch, key) {
    return process.exit(0);
});

screen.on('size', (width, height) => {
    screen.columns = width;
    screen.rows = height;
    screen.emit('resize')
})

editorScene.focus();
screen.render();