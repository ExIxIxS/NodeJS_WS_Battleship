import { BattleFieldArr, BattleFieldCell, BattleFieldShotResult, Position, Ship } from "../interfaces"

class BattleField {
  static getEmptyBattleField() {
    const emptyBattleFieldCell: BattleFieldCell = 'empty';
    const battleFieldLineTemplate = Array(10).fill(emptyBattleFieldCell);
    const emptyBattleField = Array(10).fill(null).map(() => {
      return [...battleFieldLineTemplate]
    })

    const battleField = emptyBattleField as BattleFieldArr;

    return battleField;
  }

  static parseShipPosition(ship: Ship): Position[] {
    const positions: Position[] = [];
    let currentPosition = {...ship.position};
    const isVerticalPosition = ship.direction;

    for (let i = 0; i < ship.length; i++) {
      positions.push(currentPosition);

      currentPosition = {...currentPosition};
      if (isVerticalPosition) {
        currentPosition.y++;
      } else {
        currentPosition.x++;
      }
    }

    return positions;
  }

  #battleField: BattleFieldArr = BattleField.getEmptyBattleField();
  #ships: Position[][] = [];

  constructor() {}

  getBattleField() {
    return this.#battleField;
  }

  #addShipToBattleField(ship: Ship) {
    const positions = BattleField.parseShipPosition(ship);
    this.#ships.push(positions);

    positions.forEach((position) => {
      this.#battleField[position.y][position.x] = 'ship';
    })
  }

  #deleteShipByCellPosition(cellPosition: Position): void {
    const shipIndex = this.#ships.findIndex((positions) => {
      return positions.some((position) => {
        return (position.x === cellPosition.x
          && position.y === cellPosition.y
        )
      })
    });

    if (shipIndex >= 0) {
      this.#ships.splice(shipIndex, 1);
    }
  }

  setShips(ships: Ship[]) {
    ships.forEach((ship) => {
      this.#addShipToBattleField(ship);
    })
  }

  #getShipByCellPosition(cellPosition: Position): Position[] | undefined {
    return this.#ships.find((positions) => {
      return positions.some((position) => {
        return (position.x === cellPosition.x
          && position.y === cellPosition.y
        )
      })
    })
  }

  #isShipKilled(ship: Position[]): boolean {
    return ship.every((position) => {
      return this.#battleField[position.y][position.x] === 'damaged';
    })
  }

  isAllShipsKilled(): boolean {
    return !this.#ships.length;
  }

  #getMissedAroundShip(ship: Position[]): Position[] {
    return this.#getCellsAroundShip(ship)
    .filter((position) => {
      const cell = this.#battleField[position.y][position.x];

      return cell === 'missed';
    })
  }

  #getEmptyAroundShip(ship: Position[]): Position[] {
    return this.#getCellsAroundShip(ship)
    .filter((position) => {
      const cell = this.#battleField[position.y][position.x];

      return cell === 'empty';
    })
  }

  #getCellsAroundShip(ship: Position[]): Position[] {
    function getPointsAround(obj: Position): Position[] {
      const points = [-1, 0, 1]
      .flatMap(dx => [-1, 0, 1].map(dy => ({ x: obj.x + dx, y: obj.y + dy })))
      .filter(point => point.x >= 0 && point.y >= 0 && point.x <= 9 && point.y <= 9 && !(point.x === obj.x && point.y === obj.y));

    return points;
    }


    const cellsAround = ship.map((position) => {
        return getPointsAround(position);
      })
      .flat()
      .filter((position) => {
        const cell = this.#battleField[position.y][position.x];

        return cell === 'missed' || cell === 'empty';
      })

    return  cellsAround;
  }

  #markCellsLikeMissed(cells: Position[]): void {
    cells.forEach((position) => {
      this.#battleField[position.y][position.x] = 'missed';
    })

  }

  #handleShipDamage(shot: Position): BattleFieldShotResult {
    const ship = this.#getShipByCellPosition(shot);
    if (!ship) {
      return {
        result: {
          type: 'miss',
          position: shot,
        },
        missed: []
      }
    }

    const isShipKilled = this.#isShipKilled(ship);
    let missedCells: Position[] = [];

    if (isShipKilled) {
      const emptyCellsAround = this.#getEmptyAroundShip(ship);
      this.#markCellsLikeMissed(emptyCellsAround);
      missedCells = this.#getMissedAroundShip(ship)
      this.#deleteShipByCellPosition(shot);
    }

    return {
      result: {
        type: (isShipKilled) ? 'killed' : 'shot',
        position: shot,
      },
      missed: missedCells,
    }

  }

  get isBattleFieldEmpty(): boolean {
    return this.#battleField
      .flat()
      .every((cell) => cell === 'empty');
  }

  shootAndGetResult(shot: Position): BattleFieldShotResult | void {
    const shotPosition = this.#battleField[shot.y][shot.x];

    switch(shotPosition) {
      case 'ship': {
        this.#battleField[shot.y][shot.x] = 'damaged';
        return this.#handleShipDamage(shot);
      }
      case 'empty': {
        this.#markCellsLikeMissed([shot]);

        return {
          result: {
            type: 'miss',
            position: shot,
          },
          missed: [],
        }
      }
      case 'damaged':
      case 'missed':
      default: {
        return;
      }
    }
  }

  getRandomShotPosition(): Position {
    function getRandomCoord(): number {
      const randomNumber = Math.round(Math.random() * 10);
      return (randomNumber === 10)
        ? randomNumber - 1
        : randomNumber;
    }

    const position: Position = {
      x: getRandomCoord(),
      y: getRandomCoord(),
    }

    let limit = 0;

    while (this.#battleField[position.y][position.x] !== 'empty'
      && this.#battleField[position.y][position.x] !== 'ship') {
        position.x = getRandomCoord();
        position.y = getRandomCoord();
        limit++;
    }

    return position;
  }

}

export {
  BattleField,
}
