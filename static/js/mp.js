import { loadGame, updateGame } from "./gamedata/gameLoader.js"
import { updateGame as controllerUpdate, onFight, UIController } from "./controller.js"
import Game from './gamedata/game.js'

export const ACTION = {
  ENDTURN: 1,
  RECRUIT: 2,
  MOVE: 3,
  ATTACK: 4,
  WIN: 5
}

let game
let socket

function receivePackage (data) {
  data.gameData.me = !(data.gameData.me - 1) + 1 // switch who is "me"
  data.gameData.type = Game.GAME_TYPE.ONLINE_MP
  const newGame = data.gameData
  if (!game) return firstLoadGame(newGame)
  switch (data.action) {
    case ACTION.ATTACK:
      executeAttack(data.actionData.attacker, data.actionData.defender, data.actionData.attackerDamage, data.actionData.defenderDamage, newGame)
    break;
    default:
      executeAction(newGame)
  }
}

function executeAttack (attacker, defender, attackerDamage, defenderDamage, newGame) {
  executeAction(newGame)
  onFight(attacker, defender, attackerDamage, defenderDamage)
}

function executeAction (newGame) {
  game = updateGame(game, newGame)
  controllerUpdate(game)
}

function firstLoadGame (newGame) {
  loadGame(newGame)
  .then(loadData => {
    game = loadData.game
    UIController(loadData.game, loadData.gameAssets)
  })
}

export function sendGame () {
  socket && socket.emit('game-data', {gameData: game.serialize()})
}

export function sendFight (attacker, defender, attackerDamage, defenderDamage) {
  socket && socket.emit('game-data', {gameData: game.serialize(), action: ACTION.ATTACK, actionData: {attacker, defender, attackerDamage, defenderDamage}})
}

export function connectHost (gameName, gameData) {
  loadGame(gameData)
  .then(loadData => {
    game = loadData.game
    UIController(game, loadData.gameAssets, gameName)
    socket = io(window.location.origin)
    socket.on('connect', () => {
      socket.emit('host-name', gameName)
    })
    socket.on('remote-request', sendGame)
    socket.on('game-data', receivePackage)
  })
  
}

export function connectRemote (gameName) {
  socket = io(window.location.origin)
  socket.on('connect', () => {
    socket.emit('remote-name', gameName)
  })
  socket.on('game-data', receivePackage)
}