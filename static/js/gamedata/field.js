import { BUILDING_INFO } from "./mapInfo.js"

export default class Field {

  constructor(terrain, building, buildingFaction, owner) {
    this.terrain = terrain
    this.building = building || null
    this.buildingFaction = buildingFaction || null
    this.owner = owner || null
  }

  get earnings () {
    if (!this.building) return 0
    return BUILDING_INFO[this.building].earnings
  }

  static fromText (text) {
    const decoded = text.split(',').map(str => parseInt(str))
    decoded[3] = decoded[3] ? decoded[2] : null
    return new Field(...decoded)
  }

}