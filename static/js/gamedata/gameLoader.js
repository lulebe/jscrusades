import GameMap from './map.js'
import Game from './game.js'
import GameAssets from './gameAssets.js'
import Player from './player.js'
import { stringToMap } from './mapLoader.js'
import DEFAULT_MAPS from './defaultMapData.js'
import Unit from './unit.js'

export async function loadGame (gameData) {
  const mapNum = gameData.mapNum
  const mapData = await stringToMap(DEFAULT_MAPS[mapNum].data)
  const map = GameMap.fromData(mapData.data, mapNum, mapData.sizeX, mapData.sizeY)
  const crusaderPlayer = Player.createFromSave(gameData.crusaderPlayer, 1)
  if (!gameData.crusaderPlayer) loadDefaultUnits(mapData, crusaderPlayer)
  const saracenPlayer = Player.createFromSave(gameData.saracenPlayer, 2)
  if (!gameData.saracenPlayer) loadDefaultUnits(mapData, saracenPlayer)
  const game = new Game(map, crusaderPlayer, saracenPlayer, gameData.type, gameData.me, gameData.currentTurn, gameData.saveNum, gameData.actionCount)
  if (gameData.buildingOwners)
    gameData.buildingOwners.forEach(b => {
      game.map.fields[b.y][b.x].owner = b.owner
    })
  const gameAssets = new GameAssets(game)
  await gameAssets.load()
  return {game, gameAssets}
}

export function updateGame (oldGame, gameData) {
  if (oldGame.map.mapNum !== gameData.mapNum) throw new Error('can only update on same Map!')
  if (oldGame.actionCount >= gameData.actionCount) return oldGame //don't overwrite with older game
  const crusaderPlayer = Player.createFromSave(gameData.crusaderPlayer, 1)
  const saracenPlayer = Player.createFromSave(gameData.saracenPlayer, 2)
  const game = new Game(oldGame.map, crusaderPlayer, saracenPlayer, gameData.type, gameData.me, gameData.currentTurn, oldGame.saveNum, gameData.actionCount)
  gameData.buildingOwners.forEach(b => {
    game.map.fields[b.y][b.x].owner = b.owner
  })
  return game
}

function loadDefaultUnits (mapData, player) {
  mapData.data.forEach((field, i) => {
    if (field.unitType && field.unitFaction === player.faction) {
      player.units.push(Unit.createFromSave({
        type: field.unitType,
        faction: field.unitFaction,
        posX: i % mapData.sizeX,
        posY: Math.floor(i / mapData.sizeX),
        hp: field.unitHP
      }))
    }
  })
}