import { BUILDING, BUILDING_INFO } from "./mapInfo.js"
import { UNIT_DATA, UNIT_TYPES } from "./unitInfo.js"

export default async function (game, gameCanvas) {
  //buy unit!
  buyUnit(game)
  gameCanvas.drawGame()
  //if attack possible, attack
  await attackEnemies (game, gameCanvas)
  //if non-own building reachable, capture!
  await captureBuildings(game, gameCanvas)
  //if enemy reachable, move there & attack
  await moveAround (game, gameCanvas)
  await attackEnemies (game, gameCanvas)
  await timeout(1000)
  game.endTurn()
}

function buyUnit (game) {
  const options = []
  game.map.fields.forEach((row, y) => {
    row.forEach((field, x) => {
      if (field.owner !== game.currentTurn) return
      if (game.findUnitAt(x, y)) return
      BUILDING_INFO[field.building].recruitable.forEach(unitType => {
        if (UNIT_DATA[unitType].price <= game.currentPlayer.money)
          options.push({unitType, x, y})
      })
    })
  })
  const pick = shuffle(options).pop()
  if (!pick) return
  game.recruit(pick.unitType, pick.x, pick.y)
}

async function captureBuildings (game, gameCanvas) {
  if (game.myTurn) return
  let option, unit
  game.currentPlayer.units.filter(u => u.isInfantry && u.canMove).find(u => {
    option = u.pathfind(game).find(f => {
      const field = game.map.fields[f.y][f.x]
      if ((field.owner === game.currentTurn && field.building === BUILDING.HQ) || (field.owner !== game.currentTurn && field.building))
        return true
      return false
    })
    if (option) {
      unit = u
      return true
    }
    return false
  })
  if (!option) return
  unit.move(option.x, option.y, option.path, game)
  gameCanvas.drawGame()
  await timeout(1500)
  captureBuildings(game, gameCanvas)
}

async function attackEnemies (game, gameCanvas) {
  if (game.myTurn) return
  let fights = []
  game.currentPlayer.units.filter(u => u.canFight).forEach(u => {
    const f = shuffle(u.fightfind(game))
    if (f.length) fights.push({unit: u, enemy: f.pop()})
  })
  fights = shuffle(fights).filter(f => Math.random() > 0.25)
  for (let i = 0; i < fights.length; i++) {
    game.attack(fights[i].unit, fights[i].enemy)
    await timeout(2500)
  }
  gameCanvas.drawGame()
}

async function moveAround (game, gameCanvas) {
  if (game.myTurn) return
  let option, unit
  game.currentPlayer.units.filter(u => u.canMove).find(u => {
    const allOptions = u.pathfind(game)
    if (!allOptions.length) return false
    option = shuffle(allOptions.sort((a, b) => b.path.length - a.path.length).slice(-3)).pop()
    unit = u
    return true
  })
  if (!option) return
  unit.move(option.x, option.y, option.path, game)
  gameCanvas.drawGame()
  await timeout(1500)
  captureBuildings(game, gameCanvas)
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}