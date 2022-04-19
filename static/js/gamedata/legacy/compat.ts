export class World {
  unitList: Unit[] = []
  cityList: City[] = []

  rows: number // map size along Y
  cols: number // map size along X

  map: AiMap

  game: Game

  // Possibly the red fields which can be attacked.
  // Triples of (row: number, col: number, unit: Unit)
  BattleDescription: Array<Array<any>>[] = []

  CitiesCanProduceUnit(player: Player, unitCategory: string): boolean {
    // unitCategory is "Human"...
    throw new Error();
  }

  CitiesCanSupplyUnit(city: City, unit: Unit): boolean {
    throw new Error();
  }

  CitiesCountNeutral(player: Player, cityName: string): number {
    // player arg not used, counts neutral cities of type cityName
    throw new Error();
  }

  CitiesCountOccupied(player: Player, cityName: string): number {
    // counts cities of type cityName by player
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
    // creates BattleDescription array
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

  DataUnitsGetAttackStrengthAgainstCategory(profile: Profile, unitCategory: string): number {
    throw new Error();
  }

  DataUnitsGetBehaviour(profile: Profile): string {
    // All possible return values: "FightOrMove", "FightAndMove".
    throw new Error();
  }

  DataUnitsGetCategory(profile: Profile): string {
    return profile.type;
  }

  DataUnitsGetPrice(profile: Profile): number {
    throw new Error();
  }

  DataUnitsGetProduction(profile: Profile): number {
    // Was originally used as `_loc2_.name`;
    // we simplified to returning the typeNum of the building that produces the unit directly.
    // needs to be same as City.type for comparison
    throw new Error();
  }

  DataUnitsGetQuality(profile: Profile): number {
    throw new Error(); // just returns profile.quality
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

  UnitsCountCounterHitpoints(player: Player, unitCategory: string | undefined): number {
    // TODO figure out
    throw new Error(); 
  }

  UnitsCountEnemyHitpoints(player: Player, unitCategory: string | undefined): number {
    throw new Error(); // total HP of all enemy units in unitCategory
  }

  UnitsCountFriendlyHitpoints(player: Player): number {
    throw new Error(); // total HP of all own units
  }

  UnitsGetProfile(unit: Unit): Profile {
    throw new Error();
  }

  UnitsGetNumberOfFights(enemy: Unit, unit: Unit, fightCategory: number): number {
    // fightCategory is 0 as attacker, 1 as defender
    throw new Error();
  }
}


export class AiMap { // not called Map because of conflicting JS standard class

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

  isMoving: boolean

  getBehaviour(): string {
    throw new Error(); // "FightOrMove" ...
  }

  GetAmmoInPercent(): number {
    throw new Error();
  }

  GetFuelInPercent(): number {
    throw new Error();
  }

  GetHitpointsInPercent(): number {
    throw new Error();
  }

  getMovement(): number {
    // returns how many movementPoints the unit actually has determined by food
    throw new Error();
  }

  getMovementCost(terrainType: number): number { // terrainName = Terrain.name, replaced by terrainType to fit to base game data
    throw new Error();
  }
  
  getPlayer(): Player {
    return this.player
  }

  getRange(): number {
    throw new Error(); // return .range of unit profile
  }

  getState(): number {
    return this.state
  }

  getTypeCat(): number {
    // TODO return type ("Human", "Hard", "Soft", "Water", "Air")
    throw new Error(); 
  }

  move(row: number, col: number): void {
    throw new Error();
  }

  computeDistance(unit: Unit): number {
    // distance in fields for fights
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

  buyUnit(profileType: number, row: number, col: number): void {
    // profileType used to be profileName (profile.name string)
    throw new Error();
  }
}

export class Profile { // represents UNIT_DATA item in LuLeBe Version
  type: string = "" // "Air", "Human", "Soft", "Hard", "Water"...
  name: number = 0 // replaced with type, used to be string like "Spearman" for Player.buyUnit (also replaced with type)
  behaviour // unknown type
  minRange: number = 0
  range: number = 0
}

export class City {
  row: number
  col: number
  type: number // needs to be same as return of World.DataUnitsGetProduction for comparison
  
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
  //name: string // "ground", "street", "wood", "hill", "river", "sea", "hedgerows", "swamp"
  name: number// instead of name, only used in Unit.getMovementCost
  
  getDefence(): number {
    throw new Error();
  }
}

export class Game {
  Marker: Marker
  Round: number
}

export class Marker {
  // Related to unit movement.
  // (Hypothesis of Leander) Possibly for rendering what the AI is selecting.
  setPos(row: number, col:number): void {
    throw new Error();
  }
}
