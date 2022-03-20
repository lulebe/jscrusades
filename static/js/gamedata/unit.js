import { UNIT_DATA } from "./unitInfo.js"

export default class Unit {

  constructor (type, posX, posY, hp, food, ammo) {
    this.type = type
    this.posX = posX
    this.posY = posY
    this.hp = hp
    this.food = food
    this.ammo = ammo
  }

  static create (type, posX, posY, hp, food, ammo) {
    return new Unit(type, posX, posY, hp || UNIT_DATA[type].hp, food || UNIT_DATA[type].food, ammo || UNIT_DATA[type].ammo)
  }

  static createFromSave ({type, posX, posY, hp, food, ammo}) {
    return this.create(type, posX, posY, hp, food, ammo)
  }

}