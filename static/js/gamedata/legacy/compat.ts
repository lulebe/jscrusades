export class World {
  unitList: Unit[] = []

  rows: number // map size along Y
  cols: number // map size along X

  map: Map

  game: Game

  // Possibly the red fields which can be attacked.
  // Triples of (row: number, col: number, unit: Unit)
  BattleDescription: Array<Array<any>>[] = []

  CitiesCanSupplyUnit(city: City, unit: Unit): boolean {
    throw new Error();
  }

  CitiesGetProfile(city: City): CityProfile {
    throw new Error();
  }

  CitiesIsProductionFacility(city: City): boolean {
    throw new Error();
  }

  clearMovementMap(): void {
    throw new Error();
  }

  computeDamage(attacker: Unit, defender: Unit): number {
    // No side-effects; return val is float.
    throw new Error();
  }

  createBattle(unit: Unit): void {
    throw new Error();
  }

  createMovement(unit: Unit, enemyUnitsAreBlocking: boolean): void {
    throw new Error();
  }

  DataCitiesGetScore(cityProfile: CityProfile): number {
    // Return value is aiScore for city
    throw new Error();
  }

  DataUnitsCanCaptureCity(profile: Profile): boolean {
    return profile.type == "Human"
  }

  DataUnitsGetBehaviour(profile: Profile): string {
    // All possible return values: "FightOrMove", "FightAndMove".
    throw new Error();
  }

  DataUnitsGetPrice(profile: Profile): number {
    throw new Error();
  }

  DataUnitsGetCategory(profile: Profile): string {
    return profile.type;
  }

  DataUnitsGetMinRange(profile: Profile): number {
    throw new Error();
  }

  DataUnitsGetRange(profile: Profile): number {
    throw new Error();
  }

  DataUnitsIsFlying(profile: Profile): boolean {
    throw new Error();
  }

  destroyBattle(): void {
    throw new Error();
  }

  executeBattle(attacker: Unit, defender: Unit): void {
    throw new Error();
  }

  getCity(y: number, x: number): City | null {
    throw new Error();
  }

  IsPositionBlocked(row: number, col: number, profile: Profile): boolean {
    throw new Error();
  }

  NeighboursSelect(neighbour: number, row: number, col: number): Coord | null {
    // neighbour range is {0, 1, 2, 3} corresponds to above, right, below, left
    throw new Error();
  }

  PlayerAreEnemies(p1: Player, p2: Player): boolean {
    throw new Error();
  }

  PlayerAreFriends(p1: Player, p2: Player): boolean {
    throw new Error();
  }

  UnitsCount(player: Player, unitCategory: string): number {
    throw new Error(); // return number of units of given Category ("Human"...) owned by player
  }

  UnitsCountEnemyHitpoints(player: Player): number {
    throw new Error(); // total HP of all enemy units
  }

  UnitsCountFriendlyHitpoints(player: Player): number {
    throw new Error(); // total HP of all own units
  }

  UnitsGetProfile(unit: Unit): Profile {
    throw new Error();
  }

  UnitsGetNumberOfFights(enemy: Unit, unit: Unit, fightCategory: number): number {
    throw new Error();
  }
}


export class Map {

  movement: Number[][] = [] // rows,cols size
  units: Unit[][] = [] // rows,cols size, nullable 2d array of Units
  terrain: Terrain[][] = [] // rows,cols size

}

/**
 * Must be exactly one instance per unit in the game.
 */
export class Unit {
  player: Player

  // One of 0, 1, 2 (see const values in ai.js).
  state: number

  type: string // TODO dtype ?

  getMovementCost(terrainName: string): number { // terrainName = Terrain.name
    throw new Error();
  }
  
  getPlayer(): Player {
    return this.player
  }

  getState(): number {
    return this.state
  }

  getTypeCat(): number {
    throw new Error(); // TODO return type ("Human", "Hard", "Soft", "Water", "Air")
  }

  move(row: number, col: number): void {
    throw new Error();
  }

  computeDistance(unit: Unit): number { // distance in fields for fights
    throw new Error();
  }
}


/**
 * Must be exactly one instance per unit in the game.
 */
export class Player {

  areEnemy(unit: Unit): boolean {
    throw new Error();
  }
  
  getGold(): number {
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
  row: number
  col: number
  
  getPlayer(): Player | null {
    throw new Error();
    return null // if no player
  }
}

export class CityProfile {
  name: string
  aiScore: number
}

export class Coord {
  row: number
  col: number
}

export class Terrain {
  hb_bonus: number
  name: string // "ground", "street", "wood", "hill", "river", "sea", "hedgerows", "swamp"
  
  getDefence(): number {
    throw new Error();
  }
}

export class Game {
  Marker: Marker
}

export class Marker {
  // Related to unit movement.
  // (Hypothesis of Leander) Possibly for rendering what the AI is selecting.
  setPos(row: number, col:number): void {
    throw new Error();
  }
}