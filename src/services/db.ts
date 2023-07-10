import { CustomWebSocket } from "../api_server/customWebSocket";
import { AddShipRequestData, AppPlayer, Game, GameRoom } from "../interfaces";
import { BattleField } from "./battleField";

class FakeDB {
  #playersList: AppPlayer[] = [];
  #wsIds: number[] = [];
  #wsStorage:CustomWebSocket[] = [];
  #gameRooms: GameRoom[] = [];
  #activeGames: Game[] = [];

  /*
    {  "gameId\":0,
      "ships\":[
          {\"position\":{\"x\":0,\"y\":1},\"direction\":false,\"type\":\"huge\",\"length\":4},
          {\"position\":{\"x\":6,\"y\":3},\"direction\":false,\"type\":\"large\",\"length\":3},
        ],
      "indexPlayer\":0
    }
  */
  setPlayerShips(requesData: AddShipRequestData): void {
    const player = this.getPlayerById(requesData.indexPlayer);

    if (!player) {
      return;
    }

    player.battleField.setShips(requesData.ships);
    this.setGameCurrentPlayerId(requesData.gameId, player.index);
  }

  setGameCurrentPlayerId(gameId: number, playerId: number): void {
    const game = this.#activeGames.find((game) => game.roomId === gameId);

    if (game) {
      game.currentPlayerId = playerId;
      console.log('--> setGameCurrentPlayerId - toogled! --> ', playerId);
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

    if (!room || typeof(currentPlayerId) !== 'number') {
      return;
    }

    const newCurrentPlayer = room.roomUsers.find((player) => player.index !== currentPlayerId);

    if (!newCurrentPlayer) {
      return;
    }

    this.setGameCurrentPlayerId(gameId, newCurrentPlayer.index);
    console.log(currentPlayerId, '--> toggleGameCurrentPlayer - toogled! --> ', newCurrentPlayer.index);
  }

  isGameStarted(gameId: number): boolean {
    const gameRoom = this.#gameRooms.find((gameRoom) => gameRoom.roomId === gameId);

    if (gameRoom) {
      return gameRoom.roomUsers.every((player) => {
        return !player.battleField.isBattleFieldEmpty;
      })
    }

    return false;
  }

  addWsToStorage(ws: CustomWebSocket) {
    ws.id = this.getNextWsId();
    this.#wsStorage.push(ws);
  }

  getActiveWs(): CustomWebSocket[] {
    return this.#wsStorage;
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

  #getNewRoom(): GameRoom {
    const newRoom: GameRoom = {
      roomId: this.#gameRooms.length,
      roomUsers: [],
    }

    this.#gameRooms.push(newRoom);

    return newRoom;
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
    const freeRooms = this.#gameRooms.filter((room) => room.roomUsers.length < 2);

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

    storageRoom.roomUsers.push(gamePlayer)
  }

  isPlayerInRoom(roomId: number, playerId: number): boolean {
    const storageRoom = this.getRoomById(roomId);

    if (!storageRoom) {
      return false;
    }

    const player = storageRoom.roomUsers.find((player) => player.index === playerId)
    return (!!player);
  }

  getPlayers(): AppPlayer[] {
    return this.#playersList.map((player) => {
      return { ...player };
    });
  }

  getPlayerByName(name: unknown): AppPlayer | void {
    if (typeof name !== 'string') {
      return;
    }

    const player = this.#playersList.find((player) => player.name === name);

    if (player) {
      return { ...player };
    }
  }

  getPlayerById(id: unknown): AppPlayer | void {
    if (typeof id !== 'number') {
      return;
    }

    const player = this.#playersList.find((player) => player.index === id);

    if (player) {
      return { ...player };
    }
  }

  getAttackedPlayer(gameId: number, attackingPlayerId: number): AppPlayer | void {
    const room = this.getRoomById(gameId);

    if (!room) {
      return;
    }

    return room.roomUsers.find((player) => player.index !== attackingPlayerId);
  }

  addPlayer(newPlayer: AppPlayer): void {
    this.#playersList.push(newPlayer);
  }

  activatePlayer(player: AppPlayer): void {
    const existedPlayer = this.getPlayerById(player.name);

    if (!existedPlayer) {
      this.addPlayer(player);
    }
  }
}

const fakeDB = new FakeDB();

export default fakeDB;