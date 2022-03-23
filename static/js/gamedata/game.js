import { FACTION } from './gameConstants.js'
import { BUILDING, BUILDING_INFO, HBONUSES } from './mapInfo.js'
import { UNIT_DATA } from './unitInfo.js'
import Unit from './unit.js'
import GameMap from './map.js'

export default class Game {

  static GAME_TYPE = {
    LOCAL_MP: 1,
    LOCAL_SP: 2,
    ONLINE_MP: 3
  }

  #currentTurn
  #me
  #fightListener

  constructor(map, crusader, saracen, type, myFaction, currentTurn, saveNum, actionCount=0) {
    this.map = map
    this.type = type
    this.#me = type === Game.GAME_TYPE.LOCAL_MP ? null : (myFaction || FACTION.CRUSADER)
    this.players = [null, crusader, saracen]
    this.crusaderPlayer = crusader
    this.saracenPlayer = saracen
    this.saveNum = saveNum
    this.finished = false
    this.#fightListener = null
    this.actionCount = actionCount
    this.#currentTurn = typeof currentTurn === 'number' ? currentTurn : FACTION.CRUSADER
  }

  get myTurn () {
    return this.type === Game.GAME_TYPE.LOCAL_MP ? true : this.#currentTurn === this.#me
  }

  get currentTurn () {
    return this.#currentTurn
  }

  get currentPlayer () {
    return this.players[this.#currentTurn]
  }

  get winner () {
    let winner = null
    this.map.fields.find(row => {
      return row.find(field => {
        if (field.building !== BUILDING.HQ || field.owner === field.buildingFaction) return false
        winner = this.otherPlayer(field.buildingFaction)
        return true
      })
    })
    return winner
  }

  set onFight (listener) {
    this.#fightListener = listener
  }

  otherPlayer (p) {
    if (!p) return this.otherPlayer(this.currentPlayer)
    if (typeof p === "number") return this.otherPlayer(this.players[p])
    return p === this.crusaderPlayer ? this.saracenPlayer : this.crusaderPlayer
  }

  findUnitAt (x, y) {
    const cu = this.crusaderPlayer.units.find(u => u.posX === x && u.posY === y)
    if (cu) return cu
    const su = this.saracenPlayer.units.find(u => u.posX === x && u.posY === y)
    if (su) return su
    return null
  }

  recruit (unitType, x, y) {
    if (UNIT_DATA[unitType].price > this.currentPlayer.money) return false
    this.currentPlayer.money -= UNIT_DATA[unitType].price
    this.currentPlayer.units.push(Unit.create(unitType, this.currentTurn, x, y, true))
    this.actionCount++
    return true
  }

  attack (attacker, defender) {
    this.actionCount++
    let defenderDamage = 0
    let attackerDamage = 0
    let attackerInitiative = UNIT_DATA[attacker.type].initiative
    let defenderInitiative = UNIT_DATA[defender.type].initiative
    if(GameMap.getDistance(attacker.posX, attacker.posY, defender.posX, defender.posY) > 1) { //Distance attack, attacker will not get hurt
      defenderDamage = this.#computeDamage(attacker,defender)
      if (attacker.ammo > 0)
          attacker.ammo--
      defender.changeHP(-defenderDamage, this)
    } else { // close combat, both may get hurt
      if(HBONUSES[this.map.fields[defender.posY][defender.posX].terrain] > 0)
          defenderInitiative--
      attackerInitiative--
      //depending on initiative, one starts the fight first or both at the same time
      //lower initiative starts the fight (what?!)
      if(attackerInitiative === defenderInitiative) {
        defenderDamage = this.#computeDamage(attacker,defender)
        attackerDamage = this.#computeDamage(defender,attacker)
        if (attacker.ammo > 0)
          attacker.ammo--
        if (defender.ammo > 0)
          defender.ammo--
        defender.changeHP(-defenderDamage, this)
        attacker.changeHP(-attackerDamage, this)
      } else if(attackerInitiative < defenderInitiative) {
        defenderDamage = this.#computeDamage(attacker,defender)
        if (attacker.ammo > 0)
          attacker.ammo--
        defender.changeHP(-defenderDamage, this)
        if(defender.hp > 0) {
          attackerDamage = this.#computeDamage(defender,attacker)
          if (defender.ammo > 0)
            defender.ammo--
          attacker.changeHP(-attackerDamage, this)
        }
      } else if(attackerInitiative > defenderInitiative) {
        attackerDamage = this.#computeDamage(defender,attacker)
        if (defender.ammo > 0)
          defender.ammo--
        attacker.changeHP(-attackerDamage, this)
        if(attacker.hp > 0) {
          defenderDamage = this.#computeDamage(attacker,defender)
          if (attacker.ammo > 0)
            attacker.ammo--
          defender.changeHP(-defenderDamage, this)
        }
      }
    }
    attacker.didFight = true
    attacker.didMove = true
    attacker.hasFightOptions = false
    if (this.#fightListener)
      this.#fightListener(attacker, defender, attackerDamage, defenderDamage)
  }

  #computeDamage (attacker, defender) {
    let damage = 0
    const distance = GameMap.getDistance(attacker.posX, attacker.posY, defender.posX, defender.posY)
    for (let i = 0; i < 6; i++) {
        let attackerNumberOfFights = UNIT_DATA[attacker.type].attackNumberOfFights[defender.type]
        let defenderNumberOfFights = UNIT_DATA[defender.type].defenseNumberOfFights[attacker.type]
        if(distance < UNIT_DATA[attacker.type].minAttackDistance) {
            attackerNumberOfFights = 0
        }
        if(distance < UNIT_DATA[defender.type].minAttackDistance) {
            defenderNumberOfFights = 0
        }
        const defenderCity = this.map.fields[defender.posY][defender.posX].building
        if(defenderCity) {
            defenderNumberOfFights += BUILDING_INFO[defenderCity].battleBonus
            defenderNumberOfFights += HBONUSES[this.map.fields[defender.posY][defender.posX].terrain]
        }
        const attackerCity = this.map.fields[attacker.posY][attacker.posX].building
        if(attackerCity) {
            attackerNumberOfFights += Math.ceil(BUILDING_INFO[attackerCity].battleBonus / 2)
            attackerNumberOfFights += Math.ceil(HBONUSES[this.map.fields[defender.posY][defender.posX].terrain] / 2)
        }
        const attackerHitpoints = attacker.hp
        let diceResult = 0 //1-6
        let damageAdd = 0
        for (let j = 0; j < attackerHitpoints-1; j++) {
            var highestAttackerDiceResult = 0
            var highestDefenderDiceResult = 0
            for (let k = 0; k < attackerNumberOfFights; k++) {

                diceResult = Math.floor(Math.random() * 6) + 1
                if(diceResult > highestAttackerDiceResult) {
                    highestAttackerDiceResult = diceResult
                }
            }
            for (let l = 0; l < defenderNumberOfFights; l++) {
                diceResult = Math.floor(Math.random() * 6) + 1
                if(diceResult > highestDefenderDiceResult) {
                    highestDefenderDiceResult = diceResult
                }
            }
            if(highestDefenderDiceResult < highestAttackerDiceResult) {
                damageAdd += 1
            }
        }
        damage += damageAdd
    }
    damage = Math.floor(damage / 6) // TODO check if Math.floor correct
    if(damage > defender.hp) {
        damage = defender.hp
    }
    if(damage > 8) {
        damage = 8
    }
    return damage
  }

  endTurn () {
    this.#currentTurn = this.#currentTurn === FACTION.CRUSADER ? FACTION.SARACEN : FACTION.CRUSADER
    this.#startOfTurnCalculations()
    this.actionCount++
    this.#saveGame()
  }

  #startOfTurnCalculations () {
    //conquer buildings & heal/resupply units
    this.currentPlayer.units.forEach(unit => {
      unit.didMove = false
      unit.didFight = false
      const unitField = this.map.fields[unit.posY][unit.posX]
      if (!unitField.building) return
      if (unit.isInfantry && unitField.owner !== this.#currentTurn) { //conquer
        if (unitField.owner === null) unitField.owner = this.#currentTurn
        else {
          unitField.owner = null
          unit.changeHP(-1, this)
          if (unitField.building === BUILDING.HQ) {
            this.finished = true
          }
        }
      } else if (unitField.owner === this.#currentTurn && BUILDING_INFO[unitField.building].supports.includes(unit.type)) { //heal & resupply
        unit.heal()
        unit.resupply()
      }
    })
    //earn money
    let earnings = this.map.fields.reduce((rowsSum, row) => {
      return rowsSum + row.reduce((sum, field) => {
        if (field.owner !== this.#currentTurn) return sum
        return sum + field.earnings
      }, 0)
    }, 0)
    this.currentPlayer.money += earnings
  }

  serialize () {
    const buildingOwners = []
    this.map.fields.forEach((row, y) => {
      row.forEach((field, x) => {
        if (!field.building) return
        buildingOwners.push({x, y, owner: field.owner})
      })
    })
    const data = {
      version: 2,
      actionCount: this.actionCount,
      time: (new Date()).toJSON(),
      mapNum: this.map.mapNum,
      currentTurn: this.#currentTurn,
      me: this.#me,
      buildingOwners,
      crusaderPlayer: {
        money: this.crusaderPlayer.money,
        units: this.crusaderPlayer.units.map(u => ({
          type: u.type,
          faction: u.faction,
          hp: u.hp,
          food: u.food,
          ammo: u.ammo,
          posX: u.posX,
          posY: u.posY,
          didMove: u.didMove,
          didFight: u.didFight,
          hasFightOptions: u.hasFightOptions,
          animationMove: u.animationMove
        }))
      },
      saracenPlayer: {
        money: this.saracenPlayer.money,
        units: this.saracenPlayer.units.map(u => ({
          type: u.type,
          faction: u.faction,
          hp: u.hp,
          food: u.food,
          ammo: u.ammo,
          posX: u.posX,
          posY: u.posY,
          didMove: u.didMove,
          didFight: u.didFight,
          hasFightOptions: u.hasFightOptions,
          animationMove: u.animationMove
        }))
      }
    }
    return data
  }

  #saveGame () {
    const data = this.serialize()
    if (window.localStorage.saves) {
      const saves = JSON.parse(window.localStorage.saves)
      if (this.finished) {
        saves.splice(this.saveNum, 1)
        window.localStorage.saves = JSON.stringify(saves)
        return
      }
      if (typeof this.saveNum === 'number')
        saves[this.saveNum] = data
      else {
        this.saveNum = saves.length
        saves.push(data)
      }
      window.localStorage.saves = JSON.stringify(saves)
    } else {
      this.saveNum = 0
      window.localStorage.saves = JSON.stringify([data])
    }
  }

}