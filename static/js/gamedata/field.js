import { BUILDING_INFO } from "./gameInfo.js"

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

  static fromData (data) {
    return new Field(data.terrain, data.building, data.buildingFaction, data.owner)
  }

}