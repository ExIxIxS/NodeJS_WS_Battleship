import { BattleField } from './services/battleField'

type ClientObjTypes = 'reg'
  | 'update_winners'
  | 'create_room'
  | 'add_user_to_room'
  | 'create_game'
  | 'update_room'
  | 'add_ships'
  | 'attack'
  | 'randomAttack'
  | 'turn'
  | 'finish';

type ShipType = 'small'
  | 'medium'
  | 'large'
  | 'huge';

interface ClientRequest {
  type: ClientObjTypes,
  id: number,
  data: string,
};

type ServerResponseObj = ClientRequest;

interface IdWsMessages {
  wsId: number,
  messages: string[],
}

interface Player {
  name: string,
  password: string,
}

interface AppPlayer extends Player {
  index: number,
  battleField: BattleField,
}

type BattleFieldArr = [
  BattleFieldLine, BattleFieldLine, BattleFieldLine, BattleFieldLine, BattleFieldLine,
  BattleFieldLine, BattleFieldLine, BattleFieldLine, BattleFieldLine, BattleFieldLine
];


type BattleFieldLine = [
  BattleFieldCell, BattleFieldCell, BattleFieldCell, BattleFieldCell, BattleFieldCell,
  BattleFieldCell, BattleFieldCell, BattleFieldCell, BattleFieldCell, BattleFieldCell
]

type BattleFieldCell = 'empty'
  | 'ship'
  | 'damaged'
  | 'missed'


interface GameRoom {
  roomId: number,
  roomUsers: AppPlayer[],
}

type ResponseData = RegResponseData | GameRoom[] | void;

interface RegResponseData {
  name: string,
  index: number,
  error: boolean,
  errorText: string,
}

interface AddToRoomRequestData {
  indexRoom: number,
}

interface Game {
  roomId: number,
  currentPlayerId: number,
}

interface Position {
  x: number,
  y: number,
}

interface Ship {
  position: Position,
  direction: boolean,
  type: ShipType,
  length: number,
}

interface AddShipRequestData {
  gameId: number,
  ships: Ship[],
  indexPlayer: number,
}

type ShotResultType = 'miss' | 'killed' | 'shot';

interface BattleFieldShotResult {
  result: {
    type: ShotResultType,
    position: Position,
  },
  missed: Position[]
}

interface AttackRequestData {
  gameId: number,
  x: number,
  y: number,
  indexPlayer: number,
}

interface AttackResponseData {
  position: Position,
  currentPlayer: number,
  status: ShotResultType,
}

interface RandomAttackRequestData {
  gameId: number,
  indexPlayer: number,
}

export type {
  ClientObjTypes,
  ClientRequest,
  ServerResponseObj,
  IdWsMessages,
  ResponseData,
  RegResponseData,
  AddToRoomRequestData,
  Player,
  AppPlayer,
  GameRoom,
  Game,
  Ship,
  ShipType,
  Position,
  AddShipRequestData,
  BattleFieldArr,
  BattleFieldLine,
  BattleFieldCell,
  BattleFieldShotResult,
  AttackRequestData,
  AttackResponseData,
  ShotResultType,
  RandomAttackRequestData,
}
