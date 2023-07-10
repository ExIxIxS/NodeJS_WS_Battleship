import {
  MAX_PLAYER_NAME_LENGTH,
  MAX_PLAYER_PASS_LENGTH,
  MIN_PLAYER_NAME_LENGTH,
  MIN_PLAYER_PASS_LENGTH
} from "../constants/validation";

import { Player } from "../interfaces";

function isValidRequestObject(reqObj: unknown): boolean {
  if (!isObj(reqObj)) {
    return false;
  }

  return (reqObj instanceof Object
    && 'type' in reqObj
    && 'id' in reqObj
    && 'data' in reqObj)
}

function isObj(obj: unknown): boolean {
  return !!(obj && typeof(obj));
}

function isPlayerObject(obj: unknown): boolean {
  if (!isObj(obj)) {
    return false;
  }

  return (obj instanceof Object
    && 'name' in obj
    && typeof(obj.name) === 'string'
    && 'password' in obj)
    && typeof(obj.password) === 'string'
}

function isValidPlayerObject(player: Player): boolean {
  return (player.name.length >= MIN_PLAYER_NAME_LENGTH
    && player.name.length <= MAX_PLAYER_NAME_LENGTH
    && player.password.length >= MIN_PLAYER_PASS_LENGTH
    && player.password.length <= MAX_PLAYER_PASS_LENGTH)
}

function isValidRoomRequestData(roomData: unknown): boolean {
  return !!(roomData
    && typeof(roomData) === 'object'
    && 'indexRoom' in roomData
    && typeof(roomData['indexRoom'] === 'number')
  )
}

function isValidAddShipsRequestData(addShipsData: unknown): boolean {
  return !!(addShipsData
    && typeof(addShipsData) === 'object'
    && 'gameId' in addShipsData
    && 'ships' in addShipsData
    && 'indexPlayer' in addShipsData
    && typeof(addShipsData['gameId'] === 'number')
    && Array.isArray(addShipsData['ships'])
    && typeof(addShipsData['indexPlayer'] === 'number')
  )
}

function isValidAttackRequestData(attackData: unknown): boolean {
  return !!(attackData
    && typeof(attackData) === 'object'
    && 'gameId' in attackData
    && 'x' in attackData
    && 'y' in attackData
    && typeof(attackData['gameId'] === 'number')
    && typeof(attackData['x'] === 'number')
    && typeof(attackData['y'] === 'number')
    && typeof(attackData['indexPlayer'] === 'number')
  )
}

function isValidRandomAttackRequestData(attackData: unknown): boolean {
  return !!(attackData
    && typeof(attackData) === 'object'
    && 'gameId' in attackData
    && typeof(attackData['gameId'] === 'number')
    && typeof(attackData['indexPlayer'] === 'number')
  )
}


export {
  isValidRequestObject,
  isObj,
  isPlayerObject,
  isValidPlayerObject,
  isValidRoomRequestData,
  isValidAddShipsRequestData,
  isValidAttackRequestData,
  isValidRandomAttackRequestData,
};
