export default class Field {

  constructor(terrain, building, buildingFaction, owner) {
    this.terrain = terrain
    this.building = building || null
    this.buildingFaction = buildingFaction || null
    this.owner = owner || null
  }

  static fromText (text) {
    const decoded = text.split(',').map(str => parseInt(str))
    decoded[3] = decoded[3] ? decoded[2] : null
    return new Field(...decoded)
  }

}