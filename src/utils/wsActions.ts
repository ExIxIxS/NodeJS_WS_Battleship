import { CustomWebSocket } from "../api_server/customWebSocket";
import { IdWsMessages } from "../interfaces";
import fakeDB from "../services/db";

function sentToAllWs(message: string, callBack?: (socket: CustomWebSocket, message: string) => void) {
  const activeWs: CustomWebSocket[] = fakeDB.getActiveWs();

  activeWs.forEach((ws) => {
    ws.send(message);

    if (callBack) {
      callBack(ws, message);
    }
  })
}

function sentToWsById(idMessages: IdWsMessages[], callBack?: (socket: CustomWebSocket, message: string) => void) {
  const activeWs: CustomWebSocket[] = fakeDB.getActiveWs();

  idMessages.forEach((idMessage) => {
    const ws = activeWs.find((ws) => ws.id === idMessage.wsId);

    if (ws) {
      idMessage.messages.forEach((message) => {
        ws.send(message);

        if (callBack) {
          callBack(ws, message);
        }

      })
    }
  })
}



export {
  sentToAllWs,
  sentToWsById,
}