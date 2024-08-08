class Popup {
    constructor(parent) {
        this.parent = parent;
        this.show = this.show.bind(this);
    }

    show(type, content, timeout = 2000) {
        const bgColor = type === 'success' ? 'green' :
                        (type === 'error' ? 'red' :
                        (type === 'info' ? 'yellow' : 'green'));
        const borderColor = type === 'success' || type === 'error' ? 'white' :
                            (type === 'info' ? 'black' : 'white');

        const lines = content.split('\n');
        const width = Math.max(...lines.map(line => line.length)) + 4; 
        const height = lines.length + 2; 

        this.popup = blessed.box({
            parent: this.parent,
            top: 'center',
            left: 'center',
            width: Math.min(width, this.parent.width), 
            height: Math.min(height, this.parent.height), 
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

        this.parent.append(this.popup);
        this.parent.screen.render();

        setTimeout(() => {
            this.hide();
        }, timeout);
    }

    hide() {
        if (this.popup) {
            this.popup.destroy();
            this.parent.screen.render();
        }
    }
}

module.exports = Popup;