const WebSocket = require('ws');
const prettier = require('prettier');

const wsUrl = 'ws://localhost:3000';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log('Connected to WebSocket server');
    ws.send(JSON.stringify({ event: 'connection', data: 'Client connected and ready to format text' }));
});

ws.on('message', async (message) => {
    const parsedMessage = JSON.parse(message);
    console.log('Received:', parsedMessage);

    if (parsedMessage.event === 'save') {
        try {
            const formattedText = await prettier.format(parsedMessage.data, {
                parser: 'babel',
            });
            ws.send(JSON.stringify({ event: 'save', data: formattedText }));
            console.log('Formatted text sent:', formattedText);
        } catch (error) {
            console.error('Error formatting text:', error);
        }
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});
