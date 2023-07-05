import WebSocket from 'ws';

const DEFAULT_WS_PORT = 3000;

const wsServer = new WebSocket.Server({
  host: 'localhost',
  port: DEFAULT_WS_PORT
});

// Event: 'connection' - Triggered when a new client connects
wsServer.on('connection', (ws) => {
  console.log('New client connected');

  // Event: 'message' - Triggered when a message is received from the client
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Send a response back to the client
    ws.send(`Server received: ${message}`);
  });

  // Event: 'close' - Triggered when the client closes the connection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server started');

export default wsServer;
