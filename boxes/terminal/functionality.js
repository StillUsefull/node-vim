

module.exports = function(terminal){
    function writeToTerminal(text) {
        terminal.setContent(terminal.getContent() + '\n' + text);
        terminal.screen.render();
    }

    
    terminal.screen.key(['C-c'], function(ch, key) {
        terminal.screen.destroy();
    });

    
    terminal.screen.program.on('data', function(data) {
        if (data.toString().charCodeAt(0) === 13) {
            writeToTerminal('Command executed');
        }
    });

    return terminal;
}