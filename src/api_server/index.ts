import WebSocket from 'ws';

import { CustomWebSocket } from './customWebSocket';
import { handleClientRequest } from '../utils/clientRequestHandling';
import fakeDB from '../services/db';

const DEFAULT_WS_PORT = 3000;

const wsServerOptions = {
  host: 'localhost',
  port: DEFAULT_WS_PORT
};

const wsServer = new WebSocket.Server(wsServerOptions);

// Event: 'connection' - Triggered when a new client connects
wsServer.on('connection', (ws: CustomWebSocket) => {
  fakeDB.addWsToStorage(ws);
  console.log(`New client connected (wsId: ${ws.id})`);

  // Event: 'message' - Triggered when a message is received from the client
  ws.on('message', (message) => {
    handleClientRequest(message, ws)
  });

  // Event: 'close' - Triggered when the client closes the connection
  ws.on('close', () => {
    console.log(`Client disconnected (wsId: ${ws.id})`);
  });
});

export default wsServer;
