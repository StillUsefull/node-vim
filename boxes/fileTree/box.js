module.exports = function(parent) {
    const fileTreeBox = blessed.box({
        label: '{bold} Files {/bold}',
        parent,
        top: 0,
        left: 0,
        width: '15%',
        height: '97%',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'blue',
            bg: 'black',
            bold: true,
            border: {
              fg: 'blue',
            }
        },
        scrollable: true,
        mouse: true,
        alwaysScroll: true,
        content: '',
        focus: true
    });

    
    return fileTreeBox;
};
