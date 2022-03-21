import { FACTION } from './gameConstants.js'

export default class Game {

  static GAME_TYPE = {
    LOCAL_MP: 1,
    LOCAL_SP: 2,
    ONLINE_MP: 3
  }

  #currentTurn

  constructor(map, crusader, saracen, type) {
    this.map = map
    this.crusaderPlayer = crusader
    this.saracenPlayer = saracen
    this.#currentTurn = FACTION.CRUSADER
  }

  get currentTurn () {
    return this.#currentTurn
  }

  get currentPlayer () {
    return this.#currentTurn === FACTION.CRUSADER ? this.crusaderPlayer : this.saracenPlayer
  }

  findUnitAt (x, y) {
    const cu = this.crusaderPlayer.units.find(u => u.posX === x && u.posY === y)
    if (cu) return cu
    const su = this.saracenPlayer.units.find(u => u.posX === x && u.posY === y)
    if (su) return su
    return null
  }

  endTurn () {
    this.#endOfTurnCalculations()
    this.#currentTurn = this.#currentTurn === FACTION.CRUSADER ? FACTION.SARACEN : FACTION.CRUSADER
    this.#startOfTurnCalculations()
  }

  #endOfTurnCalculations () {
    //conquer buildings & heal/resupply units
    this.currentPlayer.units.forEach(unit => {
      const unitField = this.map.fields[unit.posY][unit.posX]
      if (!unitField.building) return
      if (unit.isInfantry && unitField.owner !== this.#currentTurn) { //conquer
        if (unitField.owner === null) unitField.owner = this.#currentTurn
        else unitField.owner = null
      } else if (unitField.owner === this.#currentTurn) { //heal & resupply
        unit.heal()
        unit.resupply()
      }
    })
  }

  #startOfTurnCalculations () {
    let earnings = this.map.fields.reduce((rowsSum, row) => {
      return rowsSum + row.reduce((sum, field) => {
        if (field.owner !== this.#currentTurn) return sum
        return sum + field.earnings
      }, 0)
    }, 0)
    this.currentPlayer.money += earnings
  }

}