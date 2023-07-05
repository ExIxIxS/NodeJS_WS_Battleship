import WebSocket from 'ws';
import { isPlayerObject, isValidPlayerObject, isValidRequestObject } from '../utils/checkers';

import { ClientObj, ClientRequest, RegResponseData, ResponseData } from '../interfaces';
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
    const response = getResponse(clientMessageObj as ClientRequest);
    ws.send(response);
    console.log(`Server response with message: ${response}`);
  }
}

function getResponse(clientMessage: ClientRequest): string {
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
  const player = (typeof(clientMessage.data) === 'string')
    ? JSON.parse(clientMessage.data)
    : clientMessage.data;

  if (!isPlayerObject(player)) {
    const failMessage = 'recived data isn`t a Player object';
    const failResponseData = getRegResponseData('not found', failMessage)

    return getResponseStr(clientMessage, failResponseData);
  }

  if (!isValidPlayerObject(player)) {
    const failMessage = 'Invalid format of login or password';
    const failResponseData = getRegResponseData(player.name, failMessage)

    return getResponseStr(clientMessage, failResponseData);
  }

  return getJsonString('Cool response!!!');
}

function getResponseStr(clientMessage: ClientObj, data: ResponseData): string {
  const response = {
    ...clientMessage,
    data: data
  }

  return getJsonString(response);
}

function getRegResponseData(name: string, errorText: string): RegResponseData {
  return {
    name: name,
    index: 0,
    error: !!errorText,
    errorText: errorText
  }
}

export default wsServer;


/*
{
    type: "reg",
    data:
        {
            name: <string>,
            index: <number>,
            error: <bool>,
            errorText: <string>,
        },
    id: 0,
}
*/