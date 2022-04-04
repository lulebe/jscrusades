import Field from './field.js'

export default class GameMap {

  constructor (fields, mapNum, sizeX, sizeY) {
    this.fields = fields
    this.mapNum = mapNum
    this.sizeX = sizeX
    this.sizeY = sizeY
  }

  static getDistance (x1, y1, x2, y2) {
    const distx = Math.abs(x1 - x2)
    const disty = Math.abs(y1 - y2)
    return distx + disty
  }

  static fromData (fieldData, mapNum, sizeX, sizeY) {
    const fields = []
    let column = 0
    for (let i = 0; i < fieldData.length; i++) {
      if (column === 0) fields.push([])
      fields[fields.length-1].push(Field.fromData(fieldData[i]))
      column++
      if (column === sizeX) column = 0
    }
    return new GameMap(fields, mapNum, sizeX, sizeY)
  }

}