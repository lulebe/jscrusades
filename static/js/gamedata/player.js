import Unit from './unit.js'

export default class Player {

  constructor (faction, money=20) {
    this.faction = faction
    this.money = money
    this.units = []
  }

  static createFromSave (playerObject, faction) {
    const p = new Player(faction, playerObject ? playerObject.money : 20)
    if (playerObject)
      playerObject.units.forEach(u => p.units.push(Unit.createFromSave(u)))
    return p
  }

}