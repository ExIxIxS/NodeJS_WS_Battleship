import { CustomWebSocket } from "../api_server/customWebSocket";

import {
  AddShipRequestData,
  AppPlayer,
  Game,
  GameRoom,
  Winner,
} from "../interfaces";

class FakeDB {
  #playersList: AppPlayer[] = [];
  #wsIds: number[] = [];
  #activeWsIds: number[] = [];
  #wsStorage: CustomWebSocket[] = [];
  #gameRooms: GameRoom[] = [];
  #activeGames: Game[] = [];

  addWin(winnerId: number): void {
    const winner = this.getPlayerById(winnerId);

    if (winner) {
      winner.wins = winner.wins + 1;
    }
  }

  getWinners(): Winner[] {
    const winners = this.#playersList.map((player) => {
      return {
        name: player.name,
        wins: player.wins,
      };
    });

    return winners;
  }

  setPlayerShips(requesData: AddShipRequestData): void {
    const player = this.getPlayerById(requesData.indexPlayer);

    if (!player) {
      return;
    }

    player.shipsData = requesData;
    player.battleField.setShips(requesData.ships);
    this.setGameCurrentPlayerId(requesData.gameId, player.index);
  }

  setGameCurrentPlayerId(gameId: number, playerId: number): void {
    const game = this.#activeGames.find((game) => game.roomId === gameId);

    if (game) {
      game.currentPlayerId = playerId;
    }
  }

  getGameCurrentPlayerId(gameId: number): number | void {
    const game = this.#activeGames.find((game) => game.roomId === gameId);

    if (game) {
      return game.currentPlayerId;
    }
  }

  toggleGameCurrentPlayer(gameId: number): void {
    const room = this.#gameRooms.find((room) => room.roomId === gameId);
    const currentPlayerId = this.getGameCurrentPlayerId(gameId);

    if (!room || typeof currentPlayerId !== "number") {
      return;
    }

    const newCurrentPlayer = room.roomUsers.find(
      (player) => player.index !== currentPlayerId
    );

    if (!newCurrentPlayer) {
      return;
    }

    this.setGameCurrentPlayerId(gameId, newCurrentPlayer.index);
  }

  isGameStarted(gameId: number): boolean {
    const gameRoom = this.#gameRooms.find(
      (gameRoom) => gameRoom.roomId === gameId
    );

    if (gameRoom) {
      return gameRoom.roomUsers.every((player) => {
        return !player.battleField.isBattleFieldEmpty;
      });
    }

    return false;
  }

  addWsToStorage(ws: CustomWebSocket): void {
    ws.id = this.getNextWsId();
    this.#wsStorage.push(ws);
    this.#activeWsIds.push(ws.id);
  }

  getActiveWs(): CustomWebSocket[] {
    return this.#wsStorage;
  }

  removeWsFromStorage(wsId: number): void {
    const wsIndex = this.#wsStorage.findIndex((ws) => ws.id === wsId);
    if (wsIndex >= 0) {
      this.#wsStorage.splice(wsIndex, 1);
      this.#deActivateWsId(wsId);
    }
  }

  isPlayerOnServer(playerId: number): boolean {
    return this.#activeWsIds.includes(playerId);
  }

  getNextWsId(): number {
    const idsLength = this.#wsIds.length;
    this.#wsIds.push(idsLength);

    return idsLength;
  }

  createNewGame(roomId: number, currentPlayerId: number): void {
    this.#activeGames.push({
      roomId: roomId,
      currentPlayerId: currentPlayerId,
    });
  }

  finishGame(roomId: number): void {
    this.#deleteGame(roomId);

    const room = this.getRoomById(roomId);
    if (room) {
      room.roomUsers.forEach((player) => {
        player.battleField.reset();
      });
    }
  }

  createNewRoom(playerId: number): GameRoom | void {
    const roomCreator = this.getPlayerById(playerId);

    if (!roomCreator) {
      return;
    }

    const newRoom: GameRoom = this.#getNewRoom();
    newRoom.roomUsers.push(roomCreator);
  }

  getFreeRooms(): GameRoom[] {
    const freeRooms = this.#gameRooms.filter(
      (room) => room.roomUsers.length < 2
    );

    return freeRooms;
  }

  getRoomById(roomId: number): GameRoom | void {
    const room = this.#gameRooms.find((room) => room.roomId === roomId);

    if (room) {
      return { ...room };
    }
  }

  addPlayerToRoom(roomId: number, gamePlayer: AppPlayer): void {
    const storageRoom = this.getRoomById(roomId);

    if (!storageRoom) {
      return;
    }

    gamePlayer.battleField.reset();
    storageRoom.roomUsers.push(gamePlayer);
  }

  isPlayerInRoom(roomId: number, playerId: number): boolean {
    const storageRoom = this.getRoomById(roomId);

    if (!storageRoom) {
      return false;
    }

    const player = storageRoom.roomUsers.find(
      (player) => player.index === playerId
    );
    return !!player;
  }

  getPlayers(): AppPlayer[] {
    return this.#playersList.map((player) => {
      return { ...player };
    });
  }

  getPlayerByName(name: unknown): AppPlayer | void {
    if (typeof name !== "string") {
      return;
    }

    const player = this.#playersList.find((player) => player.name === name);

    if (player) {
      return player;
    }
  }

  getPlayerById(id: unknown): AppPlayer | void {
    if (typeof id !== "number") {
      return;
    }

    const player = this.#playersList.find((player) => player.index === id);

    if (player) {
      return player;
    }
  }

  getAttackedPlayer(
    gameId: number,
    attackingPlayerId: number
  ): AppPlayer | void {
    const room = this.getRoomById(gameId);

    if (!room) {
      return;
    }

    return room.roomUsers.find((player) => player.index !== attackingPlayerId);
  }

  activatePlayer(player: AppPlayer): void {
    const existedPlayer = this.getPlayerById(player.index);

    if (!existedPlayer) {
      this.#addPlayer(player);
    }
  }

  #deActivateWsId(wsId: number) {
    const wsIdIndex = this.#activeWsIds.findIndex((activeWsId) => activeWsId === wsId);
    if (wsIdIndex  >= 0) {
      this.#activeWsIds.splice(wsIdIndex, 1);
    }
  }

  #addPlayer(newPlayer: AppPlayer): void {
    this.#playersList.push(newPlayer);
  }

  #getNewRoom(): GameRoom {
    const newRoom: GameRoom = {
      roomId: this.#gameRooms.length,
      roomUsers: [],
    };

    this.#gameRooms.push(newRoom);

    return newRoom;
  }

  #deleteGame(roomId: number): void {
    const gameIndex = this.#activeGames.findIndex(
      (game) => game.roomId === roomId
    );

    if (gameIndex >= 0) {
      this.#activeGames.splice(gameIndex, 1);
    }
  }
}

const fakeDB = new FakeDB();

export default fakeDB;
