import config from '../config.js'
import GameMap from './map.js'
import Game from './game.js'
import { MAP_INFO } from './mapInfo.js'
import GameAssets from './gameAssets.js'
import Player from './player.js'

export async function loadGame (gameData) {
  const mapNum = gameData.mapNum
  const res = await fetch(config.STATIC_URL + `/mapData/map${mapNum}.txt`)
  if (!res.ok) throw Error(response.status)
  const map = GameMap.fromText(await res.text(), mapNum, MAP_INFO[mapNum].sizeX, MAP_INFO[mapNum].sizeY)
  const crusaderPlayer = Player.createFromSave(gameData.crusaderPlayer, 1)
  const saracenPlayer = Player.createFromSave(gameData.saracenPlayer, 2)
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