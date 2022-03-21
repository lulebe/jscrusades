import { UNIT_DATA } from "./unitInfo.js"

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
    this.animationRefill = null
    this.didMove = false
    this.didFight = false
  }

  get isInfantry () {
    return this.type < 5
  }

  heal () {
    if (this.hp == UNIT_DATA[this.type].hp) return
    this.hp++
    this.animationRefill = {started: false, progress: 0}
  }

  resupply () {
    //TODO
    this.animationRefill = {started: false, progress: 0}
  }

  pathfind (game) {
    if (this.didMove) return null
    const fieldsToCalculate = [Math.round(this.posX + this.posY*game.map.sizeX)]
    const pathFindMap = [...Array(game.map.sizeY)].map(x=>Array(game.map.sizeX))
    pathFindMap[this.posY][this.posX] = {left: UNIT_DATA[this.type].movementPoints, path: [], canStop: false}
    let firstCheck = true
    while (fieldsToCalculate.length && (firstCheck || this.food)) {
      firstCheck = false
      const intField = fieldsToCalculate.pop()
      const fieldY = Math.floor(intField / game.map.sizeX)
      const fieldX = intField % game.map.sizeX
      if (fieldX < game.map.sizeX-1) this.#pathfindToField(fieldX, fieldY, fieldX+1, fieldY, game, pathFindMap, fieldsToCalculate)
      if (fieldY < game.map.sizeY-1) this.#pathfindToField(fieldX, fieldY, fieldX, fieldY+1, game, pathFindMap, fieldsToCalculate)
      if (fieldX > 0) this.#pathfindToField(fieldX, fieldY, fieldX-1, fieldY, game, pathFindMap, fieldsToCalculate)
      if (fieldY > 0) this.#pathfindToField(fieldX, fieldY, fieldX, fieldY-1, game, pathFindMap, fieldsToCalculate)
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

  #pathfindToField (fromX, fromY, toX, toY, game, pathFindMap, fieldsToCalculate) {
    const cost = UNIT_DATA[this.type].movementCosts[game.map.fields[toY][toX].terrain]
    if (cost === -1) return
    const pathFieldCurrent = pathFindMap[fromY][fromX]
    const movementPointsLeft = pathFieldCurrent.left - cost
    if (movementPointsLeft < 0) return
    const unitOnField = game.findUnitAt(toX, toY)
    if (unitOnField && unitOnField.faction !== this.faction) return
    const canStop = !unitOnField
    const pathFieldTo = pathFindMap[toY][toX] || {left: -1, path: [], canStop}
    if (movementPointsLeft <= pathFieldTo.left) return
    pathFindMap[toY][toX] = {left: movementPointsLeft, path: pathFieldCurrent.path.concat([{x: fromX, y: fromY}]), canStop}
    fieldsToCalculate.push(Math.round(toX + toY*game.map.sizeX))
  }

  move (x, y, path) {
    this.food && this.food--
    this.didMove = true
    this.animationMove = {started: false, curX: this.posX, curY: this.posY, fieldsToGoTo: path.concat([{x,y}])}
    this.posX = x
    this.posY = y
  }

  static create (type, faction, posX, posY, hp, food, ammo, animationMove) {
    const u = new Unit(type, faction, posX, posY, hp || UNIT_DATA[type].hp, food || UNIT_DATA[type].food, ammo || UNIT_DATA[type].ammo)
    if (animationMove) {
      u.animationMove = animationMove
      u.animationMove.started = false
    }
    return u
  }

  static createFromSave ({type, faction, posX, posY, hp, food, ammo, animationMove}) {
    return this.create(type, faction, posX, posY, hp, food, ammo, animationMove)
  }

}