module.exports = function(parent) {
    const terminal = blessed.box({
        parent,
        label: 'Terminal',
        bottom: 0,
        right: 0,
        width: '85%',
        height: '25%',
        border: {
            type: 'line'
        },
        style: {
            border: {
                fg: 'blue'
            }
        },
        scrollable: true,
        mouse: true,
        alwaysScroll: true,
        content: '' 
    });

    return terminal;
}
