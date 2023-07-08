import WebSocket from 'ws';
import { getAddShipsResponseMessage, getAddToRoomResponseMessage, getCreateRoomResponseMessage, getRegResponseMessage, getUpdateRoomResponseMessage } from './serverResponse';
import { getJsonString } from './convertors';
import { isValidRequestObject } from './checkers';

import { ClientRequest } from '../interfaces';
import { CustomWebSocket } from '../api_server/customWebSocket';
import { sentToAllWs, sentToWsById } from './wsActions';
import { getServerMessageDatedTitle } from './messages';

function handleClientRequest(message: WebSocket.RawData, ws: CustomWebSocket): void {
  let clientMessageObj: unknown;
  const messageStr = message.toString()

  console.log(`${getServerMessageDatedTitle()} [wsId: ${ws.id}] Received message: ${messageStr}`);

  try {
    clientMessageObj = JSON.parse(messageStr);
  } catch {
    const failMessage = `Invalid request to Server`;
    ws.send(getJsonString(failMessage));
    console.log(`${getServerMessageDatedTitle()} [wsId: ${ws.id}] Response with message: ${failMessage}`);

    return;
  }

  if (isValidRequestObject(clientMessageObj)) {
    handleRequest(clientMessageObj as ClientRequest, ws)
  }
}

function handleRequest(clientMessage: ClientRequest, ws: CustomWebSocket): void {
  switch(clientMessage.type) {
    case 'reg': {
      const responseStr = getRegResponseMessage(clientMessage, ws.id);
      ws.send(responseStr);
      console.log(`${getServerMessageDatedTitle()} [wsId: ${ws.id}] Response with message: ${responseStr}`);

      return;
    }
    case 'create_room': {
      const responseStr = getCreateRoomResponseMessage(clientMessage, ws.id);
      sentToAllWs(responseStr, (socket, socketMessage) => {
        console.log(`${getServerMessageDatedTitle()} [wsId: ${socket.id}] Response with message: ${socketMessage}`);
      });

      return;
    }
    case 'add_user_to_room': {
      const addToRoomResponse = getAddToRoomResponseMessage(clientMessage, ws.id);
      const updateRoomResponse = getUpdateRoomResponseMessage(clientMessage);

      if (addToRoomResponse) {
        sentToWsById(addToRoomResponse, (socket, socketMessage) => {
          console.log(`${getServerMessageDatedTitle()} [wsId: ${socket.id}] Response with message: ${socketMessage}`);
        });
      }

      sentToAllWs(updateRoomResponse, (socket, socketMessage) => {
        console.log(`${getServerMessageDatedTitle()} [wsId: ${socket.id}] Response with message: ${socketMessage}`);
      });

      return;
    }
    case 'add_ships': {
      const addShipsResponse = getAddShipsResponseMessage(clientMessage, ws.id);

      if (addShipsResponse) {
        sentToWsById(addShipsResponse, (socket, socketMessage) => {
          console.log(`${getServerMessageDatedTitle()} [wsId: ${socket.id}] Response with message: ${socketMessage}`);
        });
      }

      return;
    }
    default: {
      const failMessage = `Invalid type of Client request`;
      const response = getJsonString(failMessage);
      ws.send(response);

      console.log(`${getServerMessageDatedTitle()} [wsId: ${ws.id}] Response with message: ${failMessage}`);
      return;
    }
  }

}

export {
  handleClientRequest,
}
