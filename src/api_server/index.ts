import WebSocket from "ws";

import { CustomWebSocket } from "./customWebSocket";
import { handleClientRequest } from "../utils/clientRequestHandling";
import fakeDB from "../services/db";
import {
  getServerMessageDatedTitle,
  getServerMessageDatedTitleWithWsId,
} from "../utils/messages";
import { DEFAULT_WS_PORT, HOST } from "../constants/ports";

const wsServerOptions = {
  host: HOST,
  port: DEFAULT_WS_PORT,
};

const wsServer = new WebSocket.Server(wsServerOptions);

wsServer.on("connection", (ws: CustomWebSocket) => {
  fakeDB.addWsToStorage(ws);
  console.log(
    `${getServerMessageDatedTitleWithWsId(ws.id)} New client connected`
  );

  ws.on("message", (message) => {
    handleClientRequest(message, ws);
  });

  ws.on("close", () => {
    console.log(
      `${getServerMessageDatedTitleWithWsId(ws.id)} Client disconnected`
    );
  });
});

function closeWebSocketServer() {
  wsServer.close((error) => {
    if (error) {
      console.error(
        `${getServerMessageDatedTitle()} Error closing WS Server: ${error}`
      );
    } else {
      console.log(`${getServerMessageDatedTitle()} WS server closed`);
    }

    process.exit(0);
  });
}

process.on("SIGINT", closeWebSocketServer);
process.on("SIGTERM", closeWebSocketServer);

export default wsServer;
