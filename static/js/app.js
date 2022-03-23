import { loadGame } from './gamedata/gameLoader.js'
import { UIController } from './controller.js'

export default function () {
  const gameToLoad = {}
  let gameData
  window.location.hash.substring(1).split(';').forEach(kv => {
    const split = kv.split('=')
    gameToLoad[split[0]] = parseInt(split[1])
  })
  if (gameToLoad.save === -1) { //new game
    gameData = {
      type: gameToLoad.mode,
      mapNum: gameToLoad.map,
      me: gameToLoad.me
    }
  } else { //load game
    gameData = JSON.parse(window.localStorage.saves)[gameToLoad.save]
    gameData.type = 2
    gameData.saveNum = gameToLoad.save
  }
  loadGame(gameData)
  .then(({game, gameAssets}) => {
    UIController(game, gameAssets)
  })
}
