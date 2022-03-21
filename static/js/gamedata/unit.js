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
    this.animation = null
  }

  static create (type, faction, posX, posY, hp, food, ammo, animation) {
    const u = new Unit(type, faction, posX, posY, hp || UNIT_DATA[type].hp, food || UNIT_DATA[type].food, ammo || UNIT_DATA[type].ammo)
    if (animation) {
      u.animation = animation
      u.animation.started = false
    }
    return u
  }

  static createFromSave ({type, faction, posX, posY, hp, food, ammo, animation}) {
    return this.create(type, faction, posX, posY, hp, food, ammo, animation)
  }

}