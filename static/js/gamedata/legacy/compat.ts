export class World {
  unitList: Unit[] = []

  rows: number // map size along Y
  cols: number // map size along X

  map: Map

  UnitsGetProfile(unit: Unit): Profile {
    throw new Error();
  }

  DataUnitsGetCategory(profile: Profile): string {
    return profile.type;
  }

  createMovement(unit: Unit, enemyUnitsAreBlocking: boolean): void {
    throw new Error();
  }

  clearMovementMap(): void {
    throw new Error();
  }

  getCity(y: number, x: number): City | null {
    throw new Error();
  }

  DataUnitsCanCaptureCity(profile: Profile): boolean {
    return profile.type == "Human"
  }

  CitiesCanSupplyUnit(city: City, unit: Unit): boolean {
    throw new Error();
  }

  NeighboursSelect(neighbour: number, row: number, col: number): Coord | null {
    // neighbour range is {0, 1, 2, 3} corresponds to above, right, below, left
    throw new Error();
  }

  IsPositionBlocked(row: number, col: number, profile: Profile): boolean {
    throw new Error();
  }

  PlayerAreEnemies(p1: Player, p2: Player): boolean {
    throw new Error();
  }
}


export class Map {

  movement: Number[][] = [] // rows,cols size
  units: Unit[][] = [] // rows,cols size, nullable 2d array of Units
  terrain: Terrain[][] = [] // rows,cols size

}

export class Unit {
  getMovementCost(terrainName: string): number { // terrainName = Terrain.name
    throw new Error();
  }
}

export class Player {
  areEnemy(unit: Unit): boolean {
    throw new Error();
  }
}

export class Profile { // represents UNIT_DATA item in LuLeBe Version
  type: string = "" // "Air", "Human", "Soft", "Hard", "Water"...
  behaviour // unknown type
  minRange: number = 0
  range: number = 0
}

export class City {
  getPlayer(): Player | null {
    throw new Error();
    return null // if no player
  }
}

export class Coord {
  row: number
  col: number
}

export class Terrain {
  hb_bonus: number
  name: string // "ground", "street", "wood", "hill", "river", "sea", "hedgerows", "swamp"
}