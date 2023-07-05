interface ClientObj {
  type: ClientObjTypes,
  id: number,
  data: any,
}

type ClientObjTypes = 'reg'
  | 'update_winners'
  | 'create_room'
  | 'add_player_to_room'
  | 'create_game'
  | 'update_room'
  | 'add_ships'
  | 'attack'
  | 'randomAttack'
  | 'turn'
  | 'finish';

interface ClientRequest extends ClientObj {
  data: Player | string,
};

interface Player {
  name: string,
  password: string,
}

type ResponseData = RegResponseData;

interface RegResponseData {
  name: string,
  index: number,
  error: boolean,
  errorText: string,
}

export type {
  ClientObj,
  ClientObjTypes,
  ClientRequest,
  ResponseData,
  RegResponseData,
  Player,
}
