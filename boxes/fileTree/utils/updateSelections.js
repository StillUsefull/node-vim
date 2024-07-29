


module.exports = function(newLine, fileTreeBox) {
    let content = fileTreeBox.getContent();
    const cleanContent = content.replace(/-> /g, '');
    const lines = cleanContent.split('\n');
    const updatedLines = lines.map((line, index) =>
        index === newLine ? `-> ${line}` : `${line}`
    ).join('\n');
    fileTreeBox.setContent(updatedLines);
    fileTreeBox.screen.render();
}


// updateSelection with color but styles are not dispersed after update

    // function updateSelection(newLine) {
    //     let content = fileTreeBox.getContent();
    //     const cleanContent = content.replace(/{[^}]*}/g, '');
    //     const lines = cleanContent.split('\n');
    //     const updatedLines = lines.map((line, index) =>
    //         index === newLine ? `{black-fg}{blue-bg}${line}{/}` : line
    //     ).join('\n');
    //     fileTreeBox.setContent(updatedLines);
    //     fileTreeBox.screen.render();
    // }