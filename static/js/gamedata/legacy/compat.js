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

const cityNames = {
  Town: 2,
  Headquarter: 3,
  Airport: 8,
  Factory: 6,
  Village: 1,
  LightFactory: 5,
  Harbour: 7,
  Barracks: 4
}

const unitCategoryExamples = {
  Human: 1,
  Soft: 5,
  Hard: 8,
  Water: 12,
  Air: 13
}

let baseGame = null
let endTurnHandler = null

export function initWithGame(g, endTurnCb) {
  baseGame = g
  endTurnHandler = endTurnCb
}

export const AI_STEP_TYPE = {
   END_TURN: 0,
   NOTHING: 1,
   RECRUIT: 2,
   MOVE: 3,
   ATTACK: 4
 }

export class World {

  get unitList () {
    const units = []
    this.game.base.players.filter(p => !!p).forEach(p => {
      p.units.forEach(u => {
        units.push(new Unit(u))
      })
    })
    return units
  }

  get cityList () {
    const cities = []
    this.map.base.fields.forEach((row, y) => row.forEach((field, x) => {
      if (field.building) cities.push(new City(x, y, field.owner, field.building))
    }))
    return cities
  }

  // Possibly the red fields which can be attacked.
  // Triples of (row: number, col: number, unit: Unit)
  BattleDescription = []

  constructor(baseGame) {
    this.game = new Game(baseGame)
    this.map = new AiMap(baseGame.map)
    this.rows = baseGame.map.sizeY
    this.cols = baseGame.map.sizeX
  }

  CitiesCanProduceUnit(player, unitCategory) {
    // unitCategory is "Human"...
    return this.cityList.some(c => {
      if (c.ownerFaction === player.base.faction && BUILDING_INFO[c.type].recruitable.includes(unitCategoryExamples[unitCategory])) return true
      return false
    })
  }

  CitiesCanSupplyUnit(city, unit) {
    return BUILDING_INFO[city.type].supports.includes(unit.type)
  }

  CitiesCountNeutral(player, cityName) {
    // player arg not used, counts neutral cities of type cityName
    let counter = 0
    this.map.base.fields.forEach(row => row.forEach(f => {
      if (f.building === cityNames[cityName] && !f.owner)
        counter++
      }))
    return counter
  }

  CitiesCountOccupied(player, cityName) {
    // counts cities of type category by player
    let counter = 0
    this.map.base.fields.forEach(row => row.forEach(f => {
      if (f.building === cityNames[cityName] && f.owner === player.base.faction)
        counter++
      }))
    return counter
  }
  CitiesGetProfile(city) {
    return city.profile
  }

  CitiesIsProductionFacility(city) {
    return !!BUILDING_INFO[city.type].recruitable.length
  }

  clearMovementMap() {
    for (let i = 0; i < this.map.movement.length; i++) {
      const row = this.map.movement[i];
      for (let j = 0; j < row.length; j++) {
        row[j] = 0
      }
    }
  }

  computeDamage(attacker, defender) {
    // No side-effects; return val is float.
    return this.game.base.computeDamage(attacker.base, defender.base)
  }

  createBattle(unit) {
    // creates BattleDescription array
    this.destroyBattle()
    this.BattleDescription = unit.base.fightfind(this.game.base).map(u => ([u.posY, u.posX, new Unit(u)]))
  }

  createMovement(unit, enemyUnitsAreBlocking) {
    // fill map.movement 2D array (same size as map) with movementPoints left as value, but if (val > 0) val += 1, for whatever reason
    this.clearMovementMap()
    const pathfindResult = unit.base.pathfind(this.game.base, enemyUnitsAreBlocking)
    pathfindResult.forEach(res => {
      this.map.movement[res.y][res.x] = res.left > 0 ? res.left + 1 : 0
    })
  }

  DataCitiesGetScore(cityProfile) {
    // Return value is aiScore for city
    return cityProfile.aiScore
  }

  DataUnitsCanCaptureCity(profile) {
    return profile.type == "Human"
  }

  DataUnitsGetAttackStrengthAgainstCategory(profile, unitCategory) {
    return UNIT_DATA[profile.typeNum].attackNumberOfFights[unitCategoryExamples[unitCategory]]
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
    // we simplified to returning the typeNum of the building that produces the unit directly.
    // needs to be same as City.type for comparison
    return Object.keys(BUILDING_INFO).find(k => BUILDING_INFO[k].recruitable.includes(profile.typeNum))
  }

  DataUnitsGetQuality(profile) {
    return UNIT_DATA[profile.typeNum].legacy.quality
  }

  DataUnitsGetMinRange(profile) {
    return UNIT_DATA[profile.typeNum].minAttackDistance
  }

  DataUnitsGetRange(profile) {
    return UNIT_DATA[profile.typeNum].maxAttackDistance
  }

  DataUnitsIsFlying(profile) {
    return profile.typeNum === UNIT_TYPES.AIR
  }

  destroyBattle() {
    this.BattleDescription = []
  }

  executeBattle(attacker, defender) {
    this.game.base.attack(attacker.base, defender.base)
  }

  getCity(y, x) {
    const field = this.map.base.fields[y][x]
    if (!field.building) return null
    return new City(x, y, field.owner, field.building)
  }

  IsPositionBlocked(row, col, profile) {
    return UNIT_DATA[profile.typeNum].movementCosts[this.map.base.fields[row][col].terrain] === -1
  }

  NeighboursSelect(neighbour, row, col) {
    // neighbour range is {0, 1, 2, 3} corresponds to above, right, below, left
    switch(neighbour) {
      case 0: // above
        if (row <= 0) return null
        return new Coord(row - 1, col)
      case 1: // right
        if (col >= (this.map.base.sizeX - 1)) return null
        return new Coord(row, col + 1)
      case 2: // below
        if (row >= (this.map.base.sizeY - 1)) return null
        return new Coord(row + 1, col)
      case 3: // left
        if (col <= 0) return null
        return new Coord(row, col - 1)
    }
  }

  PlayerAreEnemies(p1, p2) {
    return !(p1.equals(p2))
  }

  PlayerAreFriends(p1, p2) {
    return p1.equals(p2)
  }

  UnitsCount(player, unitCategory) {
    // return number of units of given Category ("Human"...) owned by player
    return player.base.units.filter(u => UNIT_DATA[u.type].legacy.type === unitCategory).length
  }

  UnitsCountCounterHitpoints(player, unitCategory) {
    // unitCategory can be undefined
    // like UnitsCountFriendlyHitpoints but with unitCategory filter
    return player.base.units.reduce((sum, u) => {
      if (unitCategory && UNIT_DATA[u.type].legacy.type !== unitCategory) return sum
      return sum+u.hp
    }, 0)
  }

  UnitsCountEnemyHitpoints(player, unitCategory) {
    // unitCategory can be undefined
    // total HP of all enemy units in unitCategory
    return this.game.base.otherPlayer(player.base).units.reduce((sum, u) => {
      if (unitCategory && UNIT_DATA[u.type].legacy.type !== unitCategory) return sum
      return sum+u.hp
    }, 0)
  }

  UnitsCountFriendlyHitpoints(player) {
    // total HP of all own units
    return player.base.units.reduce((sum, u) => sum+u.hp, 0)
  }

  UnitsGetProfile(unit) {
    return new Profile(unit.type)
  }

  UnitsGetNumberOfFights(enemy, unit, fightCategory) {
    if (fightCategory === 0) // as attacker
      return UNIT_DATA[enemy.type].attackNumberOfFights[unit.type]
    // as defender
    return UNIT_DATA[enemy.type].defenseNumberOfFights[unit.type]
  }
}


export class AiMap {
  get units () { // rows,cols size, nullable 2d array of Units
    const unitMap = []
    for (let i = 0; i < this.base.sizeY; i++) {
      unitMap.push(new Array(this.base.sizeX).fill(null))
    }
    baseGame.players.filter(p => !!p).forEach(p => {
      p.units.forEach(u => {
        unitMap[u.posY][u.posX] = new Unit(u)
      })
    })
    return unitMap
  }

  get terrain () {
    return this.base.fields.map(row => row.map(f => new Terrain(f.terrain)))
  }

  constructor(baseMap) {
    this.base = baseMap
    this.movement = [] // rows,cols size
    for (let i = 0; i < this.base.sizeY; i++) {
      this.movement.push(new Array(this.base.sizeX).fill(0))
    }
  }
}

/**
 * Must be exactly one instance per unit in the game.
 */
export class Unit {

  get row () {
    return this.base.posY
  }

  get col () {
    return this.base.posX
  }

  get player () {
    return new Player(baseGame.players[this.base.faction])
  }

  // One of 0, 1, 2 (see const values in ai.js).
  get state () {
    if (this.base.canMove) return 0
    if (this.base.canFight) return 1
    return 2
  }

  set state (val) {
    switch (val) {
      case 0:
        this.base.didFight = false
        this.base.didMove = false
        break
      case 1:
        this.base.didFight = false
        this.base.didMove = true
        break;
      case 2:
        this.base.didFight = true
        this.base.didMove = true
    }
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

  getBehavior() {
    return UNIT_DATA[this.base.type].moveAndFight ? "FightAndMove" : "FightOrMove"
  }

  GetAmmoInPercent() {
    if (UNIT_DATA[this.base.type].ammo < 0) return 100
    return (this.base.ammo / UNIT_DATA[this.base.type].ammo) * 100
  }

  GetFuelInPercent() {
    if (UNIT_DATA[this.base.type].food < 0) return 100
    return (this.base.food / UNIT_DATA[this.base.type].food) * 100
  }

  GetHitpointsInPercent() {
    return (this.base.hp / UNIT_DATA[this.base.type].hp) * 100
  }

  getMovement() {
    // returns how many movementPoints the unit actually has determined by food
    return this.base.movementPoints
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
    return UNIT_DATA[this.base.type].legacy.type
  }

  move(row, col) {
    const option = this.base.pathfind(baseGame).find(p => p.x === col && p.y === row)
    console.log("try move", this, row, col)
    if (!option) throw new Error("Unit can't move to requested field");
    this.base.move(col, row, option.path, baseGame)
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
    return this.base.money
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

  get profile () {
    return new CityProfile(this.type)
  }

  constructor(x, y, ownerFaction, type) {
    this.row = y
    this.col = x
    this.ownerFaction = ownerFaction
    this.type = type
  }
  
  getPlayer() {
    return new Player(baseGame.players[this.ownerFaction])
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

  nextTurn () {
    endTurnHandler()
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