import {
  getClientRoomsFromGameRooms,
  getJsonString,
  getParsed,
} from "./convertors";
import {
  isPlayerObject,
  isValidAddShipsRequestData,
  isValidAttackRequestData,
  isValidPlayerObject,
  isValidRandomAttackRequestData,
  isValidRoomRequestData,
} from "./checkers";

import fakeDB from "../services/db";
import { BattleField } from "../services/battleField";

import {
  AddShipRequestData,
  AddToRoomRequestData,
  AppPlayer,
  AttackRequestData,
  AttackResponseData,
  BattleFieldShotResult,
  ClientGameRoom,
  ClientRequest,
  GameRoom,
  IdWsMessages,
  Player,
  Position,
  RandomAttackRequestData,
  RegResponseData,
  ResponseData,
  ServerResponseObj,
  ShotResultType,
} from "../interfaces";

function getFinishResponseMessage(winPlayerId: number): string {
  const finishData = {
    winPlayer: winPlayerId,
  };

  const finishResponse: ServerResponseObj = {
    type: "finish",
    data: getJsonString(finishData),
    id: 0,
  };

  return getJsonString(finishResponse);
}

function getWinnersResponseMessage(): string {
  const data = fakeDB.getWinners();
  const responseMessage = {
    type: "update_winners",
    data: getJsonString(data),
    id: 0,
  };

  return getJsonString(responseMessage);
}

function getRandomAttackResponseMessage(
  clientMessage: ClientRequest
): IdWsMessages[] | void {
  const randomAttackData = getParsed(clientMessage.data);

  if (!isValidRandomAttackRequestData(randomAttackData)) {
    return;
  }

  const validRandomAttackRequestData =
    randomAttackData as RandomAttackRequestData;
  const attackingPlayerId = validRandomAttackRequestData.indexPlayer;
  const gameId = validRandomAttackRequestData.gameId;
  const attackedPlayer = fakeDB.getAttackedPlayer(gameId, attackingPlayerId);

  if (!attackedPlayer) {
    return;
  }

  const randomShotPosition = attackedPlayer.battleField.getRandomShotPosition();
  const fakeClientAttackData: AttackRequestData = {
    ...validRandomAttackRequestData,
    x: randomShotPosition.x,
    y: randomShotPosition.y,
  };

  const fakeClientAttackRequest: ClientRequest = {
    ...clientMessage,
    type: "attack",
    data: getJsonString(fakeClientAttackData),
  };

  const attackResponseMessage = getAttackResponseMessage(
    fakeClientAttackRequest
  );

  return attackResponseMessage;
}

function getAttackResponseMessage(
  clientMessage: ClientRequest
): IdWsMessages[] | void {
  const attackData = getParsed(clientMessage.data);

  if (!isValidAttackRequestData(attackData)) {
    return;
  }

  const validAttackData = attackData as AttackRequestData;
  const attackingPlayerId = validAttackData.indexPlayer;
  const gameId = validAttackData.gameId;
  const attackedPlayer = fakeDB.getAttackedPlayer(gameId, attackingPlayerId);
  const gameRoom = fakeDB.getRoomById(gameId);
  let currentPlayerId = fakeDB.getGameCurrentPlayerId(gameId);

  if (
    !attackedPlayer ||
    !gameRoom ||
    typeof currentPlayerId !== "number" ||
    currentPlayerId !== attackingPlayerId
  ) {
    return;
  }

  const shot = {
    x: validAttackData.x,
    y: validAttackData.y,
  };

  const attackResult = attackedPlayer.battleField.shootAndGetResult(shot);

  if (!attackResult) {
    return;
  }

  const responseDataArr = getAttackResponseDataArr(
    attackingPlayerId,
    attackResult
  );

  const attackResponseMessages: string[] = responseDataArr.map(
    (responseData) => {
      const responseDataStr = getJsonString(responseData);
      const responseMessage: ServerResponseObj = {
        type: "attack",
        data: responseDataStr,
        id: clientMessage.id,
      };

      return getJsonString(responseMessage);
    }
  );

  const isGameEnded = attackedPlayer.battleField.isAllShipsKilled;

  if (attackResult.result.type === "miss" && !isGameEnded) {
    fakeDB.toggleGameCurrentPlayer(gameId);
    const newCurrentPlayerId = fakeDB.getGameCurrentPlayerId(gameId);
    currentPlayerId =
      typeof newCurrentPlayerId === "number"
        ? newCurrentPlayerId
        : currentPlayerId;
  }

  if (isGameEnded) {
    fakeDB.addWin(currentPlayerId);
    fakeDB.finishGame(gameId);

    const finishResponseMessage = getFinishResponseMessage(currentPlayerId);
    const winnersResponseMessage = getWinnersResponseMessage();

    attackResponseMessages.push(finishResponseMessage, winnersResponseMessage);
  } else {
    const nextTurnResponseMessage = getTurnResponseMessage(currentPlayerId);
    attackResponseMessages.push(nextTurnResponseMessage);
  }

  const idMessages = getRoomWsIdMessages(gameRoom, attackResponseMessages);

  return idMessages;
}

function getRoomWsIdMessages(
  gameRoom: GameRoom,
  messages: string[]
): IdWsMessages[] {
  return gameRoom.roomUsers.map((player) => {
    return {
      wsId: player.index,
      messages: [...messages],
    };
  });
}

function getAttackResponseDataArr(
  attackingPlayerId: number,
  shotResult: BattleFieldShotResult
): AttackResponseData[] {
  const responseData: AttackResponseData[] = [];
  const mainResponseData = getAttackResponseData(
    shotResult.result.position,
    attackingPlayerId,
    shotResult.result.type
  );

  responseData.push(mainResponseData);
  shotResult.missed.forEach((missedPosition) => {
    const additionalMissedResponseData = getAttackResponseData(
      missedPosition,
      attackingPlayerId,
      "miss"
    );
    responseData.push(additionalMissedResponseData);
  });

  return responseData;
}

function getAttackResponseData(
  position: Position,
  currentPlayerId: number,
  shotResult: ShotResultType
): AttackResponseData {
  return {
    position: position,
    currentPlayer: currentPlayerId,
    status: shotResult,
  };
}

function getAddShipsResponseMessage(
  clientMessage: ClientRequest
): IdWsMessages[] | void {
  const addShipsData = getParsed(clientMessage.data);

  if (!isValidAddShipsRequestData(addShipsData)) {
    return;
  }

  const validAddShipsData = addShipsData as AddShipRequestData;

  fakeDB.setPlayerShips(validAddShipsData);

  const gameId = validAddShipsData.gameId;
  const gameRoom = fakeDB.getRoomById(gameId);
  const isGameStarted = fakeDB.isGameStarted(gameId);
  const currentPlayerId = fakeDB.getGameCurrentPlayerId(gameId);

  if (isGameStarted && gameRoom && typeof currentPlayerId === "number") {
    const turnGameResponseMessage = getTurnResponseMessage(currentPlayerId);

    const idMessages = gameRoom.roomUsers.map((player) => {
      const startGameResponseMessage = getStartGameResponseMessage(
        clientMessage,
        player,
        currentPlayerId
      );

      return {
        wsId: player.index,
        messages: [startGameResponseMessage, turnGameResponseMessage],
      };
    });

    return idMessages;
  }
}

function getStartGameResponseMessage(
  clientMessage: ClientRequest,
  player: AppPlayer,
  currentPlayerId: number
): string {
  const startGameResponseData = {
    ships: player.shipsData?.ships ?? [],
    currentPlayerIndex: currentPlayerId,
  };

  const startGameResponse = {
    ...clientMessage,
    type: "start_game",
    data: JSON.stringify(startGameResponseData),
  };

  return JSON.stringify(startGameResponse);
}

function getTurnResponseMessage(currentPlayerId: number): string {
  const data = {
    currentPlayer: currentPlayerId,
  };

  const response = {
    type: "turn",
    data: JSON.stringify(data),
    id: 0,
  };

  return JSON.stringify(response);
}

function getAddToRoomResponseMessage(
  clientMessage: ClientRequest,
  wsId: number
): IdWsMessages[] | void {
  const roomData = getParsed(clientMessage.data);

  if (!isValidRoomRequestData(roomData)) {
    return;
  }

  const roomId = (roomData as AddToRoomRequestData)["indexRoom"];
  const storageRoom = fakeDB.getRoomById(roomId);
  const player = fakeDB.getPlayerById(wsId);

  if (!storageRoom || !player) {
    return;
  }

  if (fakeDB.isPlayerInRoom(roomId, wsId)) {
    return;
  }

  fakeDB.addPlayerToRoom(roomId, player);

  if (storageRoom.roomUsers.length === 2) {
    fakeDB.createNewGame(roomId, wsId);

    const idMessages = storageRoom.roomUsers.map((player) => {
      const message = getCreateGameResponseMessage(
        clientMessage,
        roomId,
        player.index
      );

      return {
        wsId: player.index,
        messages: [message],
      };
    });

    return idMessages;
  }
}

function getCreateGameResponseMessage(
  originalMessage: ClientRequest,
  gameId: number,
  playerId: number
): string {
  const data = {
    idGame: gameId,
    idPlayer: playerId,
  };

  const message = {
    ...originalMessage,
    type: "create_game",
    data: JSON.stringify(data),
  };

  return JSON.stringify(message);
}

function getCreateRoomResponseMessage(
  clientMessage: ClientRequest,
  playerId: number
): string {
  const newRoomData = getCreateRoomData(playerId);
  const mutatedRequest: ClientRequest = {
    ...clientMessage,
    type: "update_room",
  };
  const responseMessageStr = getResponseStr(mutatedRequest, newRoomData);

  return responseMessageStr;
}

function getCreateRoomData(playerId: number): ClientGameRoom[] {
  fakeDB.createNewRoom(playerId);
  const freeGameRooms = fakeDB.getFreeRooms();

  return getClientRoomsFromGameRooms(freeGameRooms);
}

function getUpdateRoomResponseMessage(clientMessage: ClientRequest): string {
  const updatedRooms = fakeDB.getFreeRooms();
  const mutatedRequest: ClientRequest = {
    ...clientMessage,
    type: "update_room",
  };
  const responseMessageStr = getResponseStr(mutatedRequest, updatedRooms);

  return responseMessageStr;
}

function getRegResponseMessage(
  clientMessage: ClientRequest,
  playerId: number
): string {
  const player = getParsed(clientMessage.data);

  if (!isPlayerObject(player)) {
    const failMessage = "recived data isn`t a Player object";
    const failResponseData = getRegResponseData("not found", failMessage);

    return getResponseStr(clientMessage, failResponseData);
  }

  if (!isValidPlayerObject(player as Player)) {
    const failMessage = "Invalid format of login or password";
    const failResponseData = getRegResponseData(
      (player as Player).name,
      failMessage
    );

    return getResponseStr(clientMessage, failResponseData);
  }

  const appPlayer: AppPlayer = {
    ...(player as Player),
    index: playerId,
    battleField: new BattleField(),
    wins: 0,
  };

  fakeDB.activatePlayer(appPlayer);
  const successResponseData = getRegResponseData(appPlayer.name);

  return getResponseStr(clientMessage, successResponseData);
}

function getResponseStr(
  clientMessage: ClientRequest,
  data: ResponseData
): string {
  const response = {
    ...clientMessage,
    data: JSON.stringify(data),
  };

  return getJsonString(response);
}

function getRegResponseData(name: string, errorText?: string): RegResponseData {
  return {
    name: name,
    index: 0,
    error: !!errorText,
    errorText: errorText ?? "",
  };
}

export {
  getRegResponseMessage,
  getCreateRoomResponseMessage,
  getAddToRoomResponseMessage,
  getUpdateRoomResponseMessage,
  getAddShipsResponseMessage,
  getAttackResponseMessage,
  getRandomAttackResponseMessage,
};
