import config from '../config.js'
import GameMap from './map.js'
import Game from './game.js'
import { MAP_INFO } from './mapInfo.js'
import GameAssets from './gameAssets.js'
import Player from './player.js'
import { FACTION } from './gameConstants.js'

export default async function (gameData) {
  const mapNum = gameData.mapNum
  const res = await fetch(config.STATIC_URL + `/mapData/map${mapNum}.txt`)
  if (!res.ok) throw Error(response.status)
  const map = GameMap.fromText(await res.text(), mapNum, MAP_INFO[mapNum].sizeX, MAP_INFO[mapNum].sizeY)
  const crusaderPlayer = Player.createFromSave(gameData.crusaderPlayer, 1)
  const saracenPlayer = Player.createFromSave(gameData.saracenPlayer, 2)
  const game = new Game(map, crusaderPlayer, saracenPlayer, gameData.type, gameData.me, gameData.currentTurn, gameData.saveNum)
  gameData.buildingOwners.forEach(b => {
    game.map.fields[b.y][b.x].owner = b.owner
  })
  const gameAssets = new GameAssets(game)
  await gameAssets.load()
  return {game, gameAssets}
}