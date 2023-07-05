import { MAX_PLAYER_NAME_LENGTH, MIN_PLAYER_NAME_LENGTH, MIN_PLAYER_PASS_LENGTH } from "../constants/validation";
import { Player } from "../interfaces";

function isValidRequestObject(reqObj: unknown) {
  if (!isObj(reqObj)) {
    return false;
  }

  return (reqObj instanceof Object
    && 'type' in reqObj
    && 'id' in reqObj
    && 'data' in reqObj)
}

function isObj(obj: unknown) {
  return (obj && typeof(obj));
}

function isPlayerObject(obj: unknown) {
  if (!isObj(obj)) {
    return false;
  }

  return (obj instanceof Object
    && 'name' in obj
    && typeof(obj.name) === 'string'
    && 'password' in obj)
    && typeof(obj.password) === 'string'
}

function isValidPlayerObject(player: Player) {
  return (player.name.length >= MIN_PLAYER_NAME_LENGTH
    && player.name.length <= MAX_PLAYER_NAME_LENGTH
    && player.password.length >= MIN_PLAYER_PASS_LENGTH
    && player.password.length <= MIN_PLAYER_PASS_LENGTH)
}

export {
  isValidRequestObject,
  isObj,
  isPlayerObject,
  isValidPlayerObject,
};
