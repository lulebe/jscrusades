import { UNIT_DATA, UNIT_TYPES } from "../gameInfo.js"

const profileNames = {
  Guard: UNIT_TYPES.GUARD,
  Archer: UNIT_TYPES.ARCHER,
  Swordsman: UNIT_TYPES.SWORD,
  Spearman: UNIT_TYPES.SPEAR,
  Catapult: UNIT_TYPES.CATAPULT,
  Trebuchet: UNIT_TYPES.TREBUCHET,
  Ballista: UNIT_TYPES.BALLISTA,
  SiegeTower: UNIT_TYPES.TOWER,
  BowCavalry: UNIT_TYPES.ARCHER_KAV,
  LightCavalry: UNIT_TYPES.LIGHT_KAV,
  HeavyCavalry: UNIT_TYPES.HEAVY_KAV,
  Ship: UNIT_TYPES.SHIP,
  FlyingUnit: UNIT_TYPES.AIR
}

let baseGame = null

export function initWithGame(g) {
  baseGame = g
}

export class World {
  unitList = []
  cityList = []

  rows // map size along Y
  cols // map size along X

  map

  game

  // Possibly the red fields which can be attacked.
  // Triples of (row: number, col: number, unit: Unit)
  BattleDescription = []

  constructor(map, game) {
    this.map = map
    this.game = game
  }

  CitiesCanProduceUnit(player, unitCategory) {
    // unitCategory is "Human"...
    throw new Error();
  }

  CitiesCanSupplyUnit(city, unit) {
    throw new Error();
  }

  CitiesCountNeutral(player, category) {
    // player arg not used, counts neutral cities of type category
    throw new Error();
  }

  CitiesCountOccupied(player, category) {
    // counts cities of type category by player
    throw new Error();
  }
  CitiesGetProfile(city) {
    throw new Error();
  }

  CitiesIsProductionFacility(city) {
    throw new Error();
  }

  clearMovementMap() {
    throw new Error();
  }

  computeDamage(attacker, defender) {
    // No side-effects; return val is float.
    throw new Error();
  }

  createBattle(unit) {
    // creates BattleDescription array
    throw new Error();
  }

  createMovement(unit, enemyUnitsAreBlocking) {
    throw new Error();
  }

  DataCitiesGetScore(cityProfile) {
    // Return value is aiScore for city
    throw new Error();
  }

  DataUnitsCanCaptureCity(profile) {
    return profile.type == "Human"
  }

  DataUnitsGetAttackStrengthAgainstCategory(profile, unitCategory) {
    throw new Error();
  }

  DataUnitsGetBehaviour(profile) {
    // All possible return values: "FightOrMove", "FightAndMove".
    throw new Error();
  }

  DataUnitsGetCategory(profile) {
    return profile.type;
  }

  DataUnitsGetPrice(profile) {
    throw new Error();
  }

  DataUnitsGetProduction(profile) {
    // Was originally used as `_loc2_.name`;
    // we simplified to returning the name of the building that produces the unit directly.
    throw new Error();
  }

  DataUnitsGetQuality(profile) {
    throw new Error(); // just returns profile.quality
  }

  DataUnitsGetMinRange(profile) {
    throw new Error();
  }

  DataUnitsGetRange(profile) {
    throw new Error();
  }

  DataUnitsIsFlying(profile) {
    throw new Error();
  }

  destroyBattle() {
    throw new Error();
  }

  executeBattle(attacker, defender) {
    throw new Error();
  }

  getCity(y, x) {
    throw new Error();
  }

  IsPositionBlocked(row, col, profile) {
    throw new Error();
  }

  NeighboursSelect(neighbour, row, col) {
    // neighbour range is {0, 1, 2, 3} corresponds to above, right, below, left
    throw new Error();
  }

  PlayerAreEnemies(p1, p2) {
    throw new Error();
  }

  PlayerAreFriends(p1, p2) {
    throw new Error();
  }

  UnitsCount(player, unitCategory) {
    throw new Error(); // return number of units of given Category ("Human"...) owned by player
  }

  UnitsCountCounterHitpoints(player, unitCategory) {
    // TODO figure out
    throw new Error(); 
  }

  UnitsCountEnemyHitpoints(player, unitCategory) {
    throw new Error(); // total HP of all enemy units in unitCategory
  }

  UnitsCountFriendlyHitpoints(player) {
    throw new Error(); // total HP of all own units
  }

  UnitsGetProfile(unit) {
    throw new Error();
  }

  UnitsGetNumberOfFights(enemy, unit, fightCategory) {
    throw new Error();
  }
}


export class Map {

  movement = [] // rows,cols size
  units = [] // rows,cols size, nullable 2d array of Units

  get terrain () {
    return this.base.fields.map(row => row.map(f => new Terrain(/* TODO */)))
  }

  constructor(baseMap) {
    this.base = baseMap
  }
}

/**
 * Must be exactly one instance per unit in the game.
 */
export class Unit {

  get player () {
    return new Player(baseGame.players[this.base.faction])
  }

  // One of 0, 1, 2 (see const values in ai.js).
  get state () {
    if (this.base.canMove()) return 0
    if (this.base.canFight()) return 1
    return 2
  }

  get type () { // unit name
    return this.base.type // potential issue because original getter would return unit type as string like "Spearman"
  }

  get isMoving () {
    return this.base.animationMove !== null
  }

  constructor(baseUnit) {
    this.base = baseUnit
  }

  equals(unit) {
    return this.base === unit.base
  }

  getBehaviour() {
    throw new Error(); // "FightOrMove" ...
  }

  GetAmmoInPercent() {
    throw new Error();
  }

  GetFuelInPercent() {
    throw new Error();
  }

  GetHitpointsInPercent() {
    throw new Error();
  }

  getMovement() {
    // returns how many movementPoints the unit actually has determined by food
    throw new Error();
  }

  getMovementCost(terrainName) { // terrainName = Terrain.name
    throw new Error();
  }
  
  getPlayer() {
    return this.player
  }

  getRange() {
    throw new Error(); // return .range of unit profile
  }

  getState() {
    return this.state
  }

  getTypeCat() {
    // TODO return type ("Human", "Hard", "Soft", "Water", "Air")
    throw new Error(); 
  }

  move(row, col) {
    throw new Error();
  }

  computeDistance(unit) {
    // distance in fields for fights
    throw new Error();
  }
}


/**
 * Must be exactly one instance per player in the game.
 */
export class Player {

  constructor(basePlayer) {
    this.base = basePlayer
  }

  equals(player) {
    return this.base === player.base
  }

  areEnemy(unit) {
    return !this.equals(unit.player)
  }
  
  getGold() {
    return this.#base.money
  }

  buyUnit(profileName, row, col) {
    // profileName is profile.name string
    baseGame.recruit(profileNames[profileName], col, row)
  }
}

export class Profile { // represents UNIT_DATA item in LuLeBe Version

  get type () {
    return UNIT_DATA[this.typeNum].legacy.type
  }

  get behaviour () {
    return UNIT_DATA[this.typeNum].moveAndFight ? "FightAndMove" : "FightOrMove"
  }

  get range () {
    return UNIT_DATA[this.typeNum].maxAttackDistance
  }

  get minRange () {
    return UNIT_DATA[this.typeNum].minAttackDistance
  }

  constructor(typeNum) {
    this.typeNum = typeNum
  }
}

export class City {

  constructor(x, y, ownerFaction) {
    this.row = y
    this.col = x
    this.ownerFaction = ownerFaction
  }
  
  getPlayer() {
    return baseGame.players[this.ownerFaction]
  }
}

export class CityProfile {
  name
  aiScore
}

export class Coord {
  row
  col
}

export class Terrain {
  hb_bonus
  name // "ground", "street", "wood", "hill", "river", "sea", "hedgerows", "swamp"
  
  getDefence() {
    throw new Error();
  }
}

export class Game {

  get Round () {
    this.base.round
  }

  constructor(baseGame) {
    this.base = baseGame
    this.Marker = new Marker()
  }
}

export class Marker {
  // Related to unit movement.
  // (Hypothesis of Leander) Possibly for rendering what the AI is selecting.
  setPos(row, col) {
    console.log(`Marker Pos (y/x): ${row}/${col}`)
  }
}