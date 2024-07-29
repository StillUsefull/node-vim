const updateSelection = require('./updateSelections');

module.exports = function(key, state, fileTreeBox) {
    if (key.name === 'up') {
        state.selectedLine = Math.max(0, state.selectedLine - 1);
        updateSelection(state.selectedLine, fileTreeBox);
    } else if (key.name === 'down') {
        const lines = fileTreeBox.getContent().split('\n');
        state.selectedLine = Math.min(lines.length - 1, state.selectedLine + 1);
        updateSelection(state.selectedLine, fileTreeBox);
    } else if (key.name === 'enter') {
        const content = fileTreeBox.getContent().split('\n');
        const selectedItem = content[state.selectedLine];
        console.log(`Selected: ${selectedItem}`);
    }
}
