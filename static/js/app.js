import { loadGame } from './gamedata/gameLoader.js'
import { UIController } from './controller.js'
import Game from './gamedata/game.js'
import { connectHost, connectRemote } from './mp.js'

export default function () {
  const gameToLoad = {}
  let gameData
  window.location.hash.substring(1).split(';').forEach(kv => {
    const split = kv.split('=')
    gameToLoad[split[0]] = split[0] != 'remote' ? parseInt(split[1]) : split[1]
  })
  if (gameToLoad.mode === Game.GAME_TYPE.ONLINE_MP && gameToLoad.remote) {
    connectRemote(gameToLoad.remote)
    return
  }
  if (gameToLoad.save === -1) { //new game
    gameData = {
      type: gameToLoad.mode,
      mapNum: gameToLoad.map,
      me: gameToLoad.me
    }
  } else { //load game
    gameData = JSON.parse(window.localStorage.saves)[gameToLoad.save]
    gameData.type = gameToLoad.mode
    gameData.saveNum = gameToLoad.save
  }
  if (gameToLoad.mode === Game.GAME_TYPE.ONLINE_MP) {
    fetch('/mpgame')
    .then(res => {
      if (res.ok) {
        return res.json()
      }
    })
    .then(mpData => {
      console.log(mpData)
      connectHost(mpData.gameName, gameData)
    })
    .catch(e => {
      alert(e.message)
    })
    return
  }
  loadGame(gameData)
  .then(({game, gameAssets}) => {
    UIController(game, gameAssets)
  })
}
