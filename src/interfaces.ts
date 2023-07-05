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
  data: LoginRequestData,
};

interface LoginRequestData {
  name: string,
  password: string,
}

export type {
  ClientObj,
  ClientRequest
}
