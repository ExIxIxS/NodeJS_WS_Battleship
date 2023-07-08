import { getJsonString, getParsed } from "./convertors";
import { isPlayerObject, isValidAddShipsRequestData, isValidPlayerObject, isValidRoomRequestData } from "./checkers";
import fakeDB from '../services/db'

import { AddShipRequestData, AddToRoomRequestData, AppPlayer, ClientObj, ClientRequest, GameRoom, IdWsMessages, Player, RegResponseData, ResponseData } from "../interfaces";
import { BattleField } from "../services/battleField";

function getAddShipsResponseMessage(clientMessage: ClientRequest, wsId: number): IdWsMessages[] | void {
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

  if (isGameStarted && gameRoom && typeof(currentPlayerId) === 'number') {
    const startGameResponseData = {
      ships: validAddShipsData.ships,
      currentPlayerIndex: currentPlayerId,
    }

    const startGameResponse = {
      ...clientMessage,
      type: 'start_game',
      data: JSON.stringify(startGameResponseData)
    }

    const startGameResponseMessage = JSON.stringify(startGameResponse);
    const turnGameResponseMessage = getTurnResponseMessage(currentPlayerId);

    const idMessages = gameRoom.roomUsers.map((player) => {
      return {
        wsId: player.index,
        messages: [startGameResponseMessage, turnGameResponseMessage],
      }
    })

    return idMessages;
  }

}

function getTurnResponseMessage(currentPlayerId: number): string {
  /*
    {
      type: "turn",
      data:
          {
              currentPlayer: <number>,
          },
      id: 0,
    }
  */

  const data = {
    currentPlayer: currentPlayerId,
  }

  const response = {
    type: 'turn',
    data: JSON.stringify(data),
    id: 0
  }

  return JSON.stringify(response);
}

function getAddToRoomResponseMessage(clientMessage: ClientRequest, wsId: number): IdWsMessages[] | void {
  const roomData = getParsed(clientMessage.data);

  if (!isValidRoomRequestData(roomData)) {
    return;
  }

  const roomId = (roomData as AddToRoomRequestData)['indexRoom'];
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
      const message = getCreateGameResponseMessage(clientMessage, roomId, player.index);

      return {
        wsId: player.index,
        messages: [message],
      }
    })

    return idMessages;
  }

}

function getCreateGameResponseMessage(originalMessage: ClientRequest, gameId: number, playerId: number): string {
  const data = {
    idGame: gameId,
    idPlayer: playerId
  }

  const message = {
    ...originalMessage,
    type: 'create_game',
    data: JSON.stringify(data),
  }

  return JSON.stringify(message);
}

function getCreateRoomResponseMessage(clientMessage: ClientRequest, playerId: number): string {
  const newRoomData = getCreateRoomData(playerId)
  const mutatedRequest: ClientRequest = {
    ...clientMessage,
    type: 'update_room',
  }
  const responseMessageStr = getResponseStr(mutatedRequest, newRoomData);

  return responseMessageStr;
}

function getCreateRoomData(playerId: number): GameRoom[] {
  fakeDB.createNewRoom(playerId);
  const freeRooms = fakeDB.getFreeRooms();

  return freeRooms;
}

function getUpdateRoomResponseMessage(clientMessage: ClientRequest): string {
  const updatedRooms = fakeDB.getFreeRooms();
  const mutatedRequest: ClientRequest = {
    ...clientMessage,
    type: 'update_room',
  }
  const responseMessageStr = getResponseStr(mutatedRequest, updatedRooms);

  return responseMessageStr;
}

function getRegResponseMessage(clientMessage: ClientRequest, playerId: number): string {
  const player = getParsed(clientMessage.data);

  if (!isPlayerObject(player)) {
    const failMessage = 'recived data isn`t a Player object';
    const failResponseData = getRegResponseData('not found', failMessage)

    return getResponseStr(clientMessage, failResponseData);
  }

  if (!isValidPlayerObject(player as Player)) {
    const failMessage = 'Invalid format of login or password';
    const failResponseData = getRegResponseData((player  as Player).name, failMessage)

    return getResponseStr(clientMessage, failResponseData);
  }

  const appPlayer: AppPlayer = {
    ...(player as Player),
    index: playerId,
    battleField: new BattleField(),
  }

  fakeDB.activatePlayer(appPlayer);
  const successResponseData = getRegResponseData(appPlayer.name)

  return getResponseStr(clientMessage, successResponseData);
}

function getResponseStr(clientMessage: ClientObj, data: ResponseData): string {
  const response = {
    ...clientMessage,
    data: JSON.stringify(data),
  }

  return getJsonString(response);
}

function getRegResponseData(name: string, errorText?: string): RegResponseData {
  return {
    name: name,
    index: 0,
    error: !!errorText,
    errorText: errorText ?? '',
  }
}

export {
  getRegResponseMessage,
  getCreateRoomResponseMessage,
  getAddToRoomResponseMessage,
  getUpdateRoomResponseMessage,
  getAddShipsResponseMessage,
}
