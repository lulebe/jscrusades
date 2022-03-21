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

  static fromText (text, mapNum, sizeX, sizeY) {
    const fields = []
    const decoded = text.split(';').map(textField => Field.fromText(textField))
    while(decoded.length) fields.push(decoded.splice(0,sizeX))
    return new GameMap(fields, mapNum, sizeX, sizeY)
  }

}