const WebSocket = require('ws');
const createPopup = require('./boxes/popup');

class Api {
    constructor(port, observer) {
        this.wss = new WebSocket.Server({ port });
        this.clients = [];
        this.observer = observer;
        this.setupWebSocketServer();
    }

    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            this.clients.push(ws);
            ws.on('message', (message) => this.handleMessage(ws, message));
            ws.on('close', () => this.removeClient(ws));
        });
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
            const currentTab = this.observer.getCurrentTab();

            switch (event) {
                case 'textChange':
                    currentTab.queueChange(() => currentTab.setContent(data));
                    break;
                case 'cursorMove':
                    currentTab.queueChange(() => currentTab.updateCursorPosition(data.x, data.y));
                    break;
                case 'save':
                    currentTab.queueChange(() => currentTab.saveFile(data));
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
