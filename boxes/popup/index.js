

function createPopup(parent, content, timeout = 2000){
    const popup = blessed.box({
        parent,
        top: 'center',
        left: 'center',
        width: '20%',
        height: '20%',
        border: {
            type: "line"
        },
        style: {
            border: {
              fg: 'white'
            },
            bg: 'green'
        },
        content,
        tags: true,
        shadow: true
    });
    parent.render()
    setTimeout(() => {
        popup.detach();
        parent.render();
    }, timeout)
}

module.exports = createPopup;