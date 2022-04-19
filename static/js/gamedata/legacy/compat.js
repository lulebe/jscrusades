import { AI_DEFENCE, BUILDING_INFO, HBONUSES, UNIT_DATA, UNIT_TYPES } from "../gameInfo.js"
import GameMap from '../map.js'

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

const attackStrengthIndices = {
  Human: 1,
  Soft: 5,
  Hard: 8,
  Water: 12,
  Air: 13
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
    return UNIT_DATA[profile.typeNum].attackNumberOfFights[attackStrengthIndices[unitCategory]]
  }

  DataUnitsGetBehaviour(profile) {
    // All possible return values: "FightOrMove", "FightAndMove".
    return UNIT_DATA[profile.typeNum].moveAndFight ? "FightAndMove" : "FightOrMove"
  }

  DataUnitsGetCategory(profile) {
    return profile.type;
  }

  DataUnitsGetPrice(profile) {
    return UNIT_DATA[profile.typeNum].price
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
    return UNIT_DATA[this.base.type].moveAndFight ? "FightAndMove" : "FightOrMove"
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

  getMovementCost(terrainType) { // used to be terrainName = Terrain.name, but changed to typeNum for easier usage
    return UNIT_DATA[this.base.type].movementCosts[terrainType]
  }
  
  getPlayer() {
    return this.player
  }

  getRange() {
    return UNIT_DATA[this.base.type].maxAttackDistance
  }

  getState() {
    return this.state
  }

  getTypeCat() {
    // TODO return type ("Human", "Hard", "Soft", "Water", "Air")
    return UNIT_DATA[this.base.type].legacy.type
  }

  move(row, col) {
    throw new Error();
  }

  computeDistance(unit) {
    // distance in fields for fights
    return GameMap.getDistance(this.base.posX, this.base.posY, unit.base.posX, unit.base.posY)
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

  buyUnit(profileType, row, col) {
    baseGame.recruit(profileType, col, row)
  }
}

export class Profile { // represents UNIT_DATA item in LuLeBe Version

  get name () {
    return this.typeNum // potential issue because original getter would return profile name as string like "Spearman"
  }

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

  constructor(x, y, ownerFaction, type) {
    this.row = y
    this.col = x
    this.ownerFaction = ownerFaction
    this.type = type
  }
  
  getPlayer() {
    return baseGame.players[this.ownerFaction]
  }
}

export class CityProfile {
  get name () {
    throw new Error() //should never be accessed afaik, so throw to check that
  }

  get aiScore () {
    return BUILDING_INFO[this.typeNum].aiScore
  }

  constructor (typeNum) {
    this.typeNum = typeNum
  }
}

export class Coord {
  constructor (row, col) {
    this.row = row
    this.col = col
  }
}

export class Terrain {

  get name () {
    return this.type // used to be name but changed to type (only used in Unit.getMovementCost) for easier usage
  }

  get hb_bonus () {
    return HBONUSES[this.type]
  }
  
  getDefence() {
    return AI_DEFENCE[this.type]
  }

  constructor (typeNum) {
    this.type = typeNum
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

  constructor() {}
}