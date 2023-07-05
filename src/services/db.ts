import { Player } from "../interfaces";

class FakeDB {
  #playersList: Player[] = [];

  getPlayers(): Player[] {
    return this.#playersList.map((player) => {
      return { ...player };
    });
  }

  getPlayer(name: unknown): Player | void {
    if (typeof name !== 'string') {
      return;
    }

    const player = this.#playersList.find((user) => user.name === name);

    if (player) {
      return { ...player };
    }
  }

  addPlayer(newUser: Player): void {
    this.#playersList.push(newUser);
  }
}

const fakeDB = new FakeDB();

export default fakeDB;
