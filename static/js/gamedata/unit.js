import { UNIT_DATA, UNIT_TYPES, BUILDING_INFO, BUILDING, FIELD } from "./gameInfo.js"
import GameMap from './map.js'
import { FACTION } from './gameConstants.js'

export default class Unit {

  constructor (type, faction, posX, posY, hp, food, ammo) {
    this.type = type
    this.faction = faction
    this.posX = posX
    this.posY = posY
    this.hp = hp
    this.food = food
    this.ammo = ammo
    this.animationMove = null
    this.animationEffect = null
    this.didMove = false
    this.didFight = false
    this.hasFightOptions = false
  }

  get isInfantry () {
    return this.type < 5 || this.type === 11
  }

  get canMove () {
    return !this.didMove && !this.didFight
  }

  get canFight () {
    return !this.didFight && (!this.didMove || UNIT_DATA[this.type].moveAndFight)
  }

  get movementPoints () {
    if (this.food !== 0) return UNIT_DATA[this.type].movementPoints
    return 1
  }

  heal () {
    if (this.hp == UNIT_DATA[this.type].hp) return
    this.hp++
    this.startEffectAnimation()
  }

  resupply () {
    this.ammo = UNIT_DATA[this.type].ammo
    this.food = UNIT_DATA[this.type].food
    this.startEffectAnimation()
  }

  startEffectAnimation () {
    this.animationEffect = {started: false, progress: 0}
  }

  pathfind (game, enemiesBlock=true) {
    if (this.didMove) return []
    const fieldsToCalculate = [Math.round(this.posX + this.posY*game.map.sizeX)]
    const pathFindMap = [...Array(game.map.sizeY)].map(x=>Array(game.map.sizeX))
    pathFindMap[this.posY][this.posX] = {left: this.movementPoints, path: [], canStop: false}
    while (fieldsToCalculate.length) {
      const intField = fieldsToCalculate.pop()
      const fieldY = Math.floor(intField / game.map.sizeX)
      const fieldX = intField % game.map.sizeX
      if (fieldX < game.map.sizeX-1) this.#pathfindToField(fieldX, fieldY, fieldX+1, fieldY, game, pathFindMap, fieldsToCalculate, enemiesBlock)
      if (fieldY < game.map.sizeY-1) this.#pathfindToField(fieldX, fieldY, fieldX, fieldY+1, game, pathFindMap, fieldsToCalculate, enemiesBlock)
      if (fieldX > 0) this.#pathfindToField(fieldX, fieldY, fieldX-1, fieldY, game, pathFindMap, fieldsToCalculate, enemiesBlock)
      if (fieldY > 0) this.#pathfindToField(fieldX, fieldY, fieldX, fieldY-1, game, pathFindMap, fieldsToCalculate, enemiesBlock)
    }
    const pathFindFields = []
    pathFindMap.forEach((row, y) => {
      row.forEach((field, x) => {
        if (!field || !field.canStop) return
        field.x = x
        field.y = y
        pathFindFields.push(field)
      })
    })
    return pathFindFields
  }

  #pathfindToField (fromX, fromY, toX, toY, game, pathFindMap, fieldsToCalculate, enemiesBlock=true) {
    let cost = UNIT_DATA[this.type].movementCosts[game.map.fields[toY][toX].terrain]
    if (game.map.fields[toY][toX].building === BUILDING.HARBOUR) cost = UNIT_DATA[this.type].movementCosts[FIELD.SOIL]
    if (cost === -1) return
    const pathFieldCurrent = pathFindMap[fromY][fromX]
    const movementPointsLeft = pathFieldCurrent.left - cost
    if (movementPointsLeft < 0) return
    const unitOnField = game.findUnitAt(toX, toY)
    if (unitOnField && unitOnField.faction !== this.faction && enemiesBlock) return
    const canStop = !unitOnField
    const pathFieldTo = pathFindMap[toY][toX] || {left: -1, path: [], canStop}
    if (movementPointsLeft <= pathFieldTo.left) return
    pathFindMap[toY][toX] = {left: movementPointsLeft, path: pathFieldCurrent.path.concat([{x: fromX, y: fromY}]), canStop}
    fieldsToCalculate.push(Math.round(toX + toY*game.map.sizeX))
  }

  fightfind (game) {
    if (this.didFight || (!UNIT_DATA[this.type].moveAndFight && this.didMove)) return []
    return game.otherPlayer(this.faction).units.filter(u => {
      const d = GameMap.getDistance(this.posX, this.posY, u.posX, u.posY)
      return d >= UNIT_DATA[this.type].minAttackDistance && d <= UNIT_DATA[this.type].maxAttackDistance
    })
  }

  move (x, y, path, game, isFastMode) {
    this.food > 0 && this.food--
    this.didMove = true
    if (!isFastMode) {
      this.animationMove = {started: false, curX: this.posX, curY: this.posY, fieldsToGoTo: path.concat([{x,y}])}
    } else {
      this.animationMove = null
    }
    this.posX = x
    this.posY = y
    if (this.fightfind(game).length) this.hasFightOptions = true
    game.actionCount++
  }

  changeHP (val, game) {
    this.hp = Math.min(this.hp + val, UNIT_DATA[this.type].hp)
    this.removeIfDead(game)
  }

  removeIfDead (game) {
    if (this.hp < 1) game.players[this.faction].units.splice(game.players[this.faction].units.indexOf(this), 1)
  }

  static create (type, faction, posX, posY, inactive, hp, food, ammo, didMove, didFight, hasFightOptions, animationMove, animationEffect) {
    const u = new Unit(type, faction, posX, posY, hp || UNIT_DATA[type].hp, food || UNIT_DATA[type].food, ammo || UNIT_DATA[type].ammo)
    if (inactive){
      u.didFight = true
      u.didMove = true
    }
    if (didMove) u.didMove = true
    if (didFight) u.didFight = true
    if (hasFightOptions) u.hasFightOptions = true
    if (animationMove) {
      u.animationMove = animationMove
      u.animationMove.started = false
    }
    if (animationEffect) {
      u.animationEffect = animationEffect
      u.animationEffect.started = false
    }
    return u
  }

  static createFromSave ({type, faction, posX, posY, hp, food, ammo, didMove, didFight, hasFightOptions, animationMove, animationEffect}) {
    return this.create(type, faction, posX, posY, false, hp, food, ammo, didMove, didFight, hasFightOptions, animationMove, animationEffect)
  }

}
