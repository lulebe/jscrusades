import Field from './field.js'

export default class GameMap {

  constructor (fields, mapNum, sizeX, sizeY) {
    this.fields = fields
    this.mapNum = mapNum
    this.sizeX = sizeX
    this.sizeY = sizeY
  }

  static fromText (text, mapNum, sizeX, sizeY) {
    const fields = []
    const decoded = text.split(';').map(textField => Field.fromText(textField))
    while(decoded.length) fields.push(decoded.splice(0,sizeX))
    return new GameMap(fields, mapNum, sizeX, sizeY)
  }

}