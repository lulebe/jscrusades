import config from '../config.js'
import GameMap from './map.js'
import Game from './game.js'
import MapInfo from './mapInfo.js'
import GameAssets from './gameAssets.js'
import Player from './player.js'

export default async function (gameData) {
  const mapNum = gameData.mapNum
  const res = await fetch(config.STATIC_URL + `/mapData/map${mapNum}.txt`)
  if (!res.ok) throw Error(response.status)
  const map = GameMap.fromText(await res.text(), mapNum, MapInfo[mapNum].sizeX, MapInfo[mapNum].sizeY)
  const crusaderPlayer = Player.createFromSave(gameData.crusaderPlayer, 1)
  const saracenPlayer = Player.createFromSave(gameData.saracenPlayer, 2)
  const game = new Game(map, crusaderPlayer, saracenPlayer, Game.GAME_TYPE.LOCAL_MP)
  const gameAssets = new GameAssets(game)
  await gameAssets.load()
  return {game, gameAssets}
}