global.blessed = require('blessed');
const EditorScene = require('./scenes/editor.js');

const program = blessed.program();

const screen = blessed.screen({
    smartCSR: true,
    title: 'node-vim',
    program: program
});


const {editorScene} = new EditorScene(screen);
screen.append(editorScene);


screen.on('resize', () => {
    screen.render();
});

screen.render();
program.hideCursor();
program.alternateBuffer();


program.on('keypress', (ch, key) => {
    if (key.name === 'q' && key.ctrl) {
        program.clear();
        program.disableMouse();
        program.normalBuffer();
        return process.exit(0);
    }
});


program.on('resize', () => {
    screen.emit('resize');
});
