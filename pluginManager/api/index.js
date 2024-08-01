const WebSocket = require('ws');
const createPopup = require('../../boxes/popup');
const Observer = require('../observer')

class Api {
    constructor(port, editor) {
        this.editor = editor;
        this.wss = new WebSocket.Server({ port }, () => {
            createPopup('success', editor.box, `Plugin manager started on port ${port}`);
        });
        this.clients = [];

        this.setupWebSocketServer();
        this.setupObserver();
    }

    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            this.clients.push(ws);
            ws.on('message', (message) => this.handleMessage(ws, message));
            ws.on('close', () => this.removeClient(ws));
        });
    }

    setupObserver() {
        Observer.on('text-change', (content) => this.broadcast('text-change', content));
        Observer.on('cursor-move', (position) => this.broadcast('cursor-move', position));
        Observer.on('save', (fileMetadata) => this.broadcast('save', fileMetadata));
        Observer.on('key-pressed', (pressedMetadata) => this.broadcast('key-pressed', pressedMetadata));
    }

    removeClient(ws) {
        this.clients = this.clients.filter(client => client !== ws);
    }

    sendError(ws, errorMessage) {
        const errorResponse = JSON.stringify({ event: 'error', message: errorMessage });
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(errorResponse);
        }
    }

    broadcast(event, data) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ event, data }));
            }
        });
    }

    handleMessage(ws, message) {
        try {
            const { event, data } = JSON.parse(message);
            switch (event) {
                case 'connection': 
                    createPopup('success', this.editor, message )
                case 'textChange':
                    this.editor.queueChange(() => this.editor.setContent(data));
                    break;
                case 'cursorMove':
                    this.editor.queueChange(() => this.editor.updateCursorPosition(data.x, data.y));
                    break;
                case 'save':
                    this.editor.queueChange(() => this.editor.saveFile(data));
                    break;
                default:
                    this.sendError(ws, `Unknown event: ${event}`);
            }
        } catch (err) {
            this.sendError(ws, 'Failed to handle message');
        }
    }
}

module.exports = Api;
