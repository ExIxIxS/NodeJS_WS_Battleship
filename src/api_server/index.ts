import WebSocket from 'ws';
import { isValidRequestObject } from '../utils/checkers';

import { ClientRequest } from '../interfaces';
import { getJsonString } from '../utils/convertors';

const DEFAULT_WS_PORT = 3000;

const wsServerOptions = {
  host: 'localhost',
  port: DEFAULT_WS_PORT
};

const wsServer = new WebSocket.Server(wsServerOptions);

// Event: 'connection' - Triggered when a new client connects
wsServer.on('connection', (ws) => {
  console.log('New client connected');

  // Event: 'message' - Triggered when a message is received from the client
  ws.on('message', (message) => {
    handleClientRequest(message, ws)
  });

  // Event: 'close' - Triggered when the client closes the connection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function handleClientRequest(message: WebSocket.RawData, ws: WebSocket): void {
  let clientMessageObj: unknown;
  const messageStr = message.toString()

  console.log(`Received message: ${messageStr}`);

  try {
    clientMessageObj = JSON.parse(messageStr);
  } catch {
    const failMessage = `Invalid request to Server`;
    ws.send(getJsonString(failMessage));
    console.log(failMessage);
    return;
  }

  if (isValidRequestObject(clientMessageObj)) {
    const response = getResponseMessage(clientMessageObj as ClientRequest);
    ws.send(response);
    console.log(`Server response with message: ${response}`);
  }
}

function getResponseMessage(clientMessage: ClientRequest): string {
  switch(clientMessage.type) {
    case 'reg': {
      return getRegResponseMessage(clientMessage);
    }
    default: {
      const failMessage = `Invalid type of Client request`;
      return getJsonString(failMessage);
    }
  }
}

function getRegResponseMessage(clientMessage: ClientRequest): string {
  return getJsonString('Cool response!!!');
}

export default wsServer;
