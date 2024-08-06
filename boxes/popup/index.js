const blessed = require('blessed');

function createPopup(type, parent, content, timeout = 2000) {
    const bgColor = type === 'success' ? 'green' : (type === 'error' ? 'red' : 'green');
    const borderColor = type === 'success' || type === 'error' ? 'white' : 'white';
    const lines = content.split('\n');
    const width = Math.max(...lines.map(line => line.length)) + 4; 
    const height = lines.length + 2; 

    const popup = blessed.box({
        parent,
        top: 'center',
        left: 'center',
        width: Math.min(width, parent.width), 
        height: Math.min(height, parent.height), 
        border: {
            type: 'line'
        },
        style: {
            border: {
                fg: borderColor
            },
            bg: bgColor
        },
        content,
        tags: true,
        shadow: true
    });

    parent.append(popup);
    parent.screen.render();

    setTimeout(() => {
        popup.destroy();
        parent.screen.render();
    }, timeout);
}

module.exports = createPopup;
