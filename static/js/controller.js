import GameCanvas from './canvas.js'
import { FACTION } from './gamedata/gameConstants.js'

import { displayHoverInfo } from './ui.js'

let game
let gameAssets
let gameCanvas
let focusedUnit = null
let moveOptions = null
let fightOptions = null

export default function (g, ga) {
  game = g
  gameAssets = ga
  console.log(game)
  const canvasEl = document.getElementById('game-canvas')
  gameCanvas = new GameCanvas(canvasEl, game, gameAssets)
  initUiHandlers()
}

function initUiHandlers () {
  const canvasEl = document.getElementById('game-canvas')
  document.getElementById('zoom-in').addEventListener('click', () => gameCanvas.zoomIn())
  document.getElementById('zoom-out').addEventListener('click', () => gameCanvas.zoomOut())
  document.getElementById('end-turn').addEventListener('click', endTurn)
  gameCanvas.initCanvas()
  canvasEl.addEventListener('fieldClicked', e => fieldClick(e.detail))
  canvasEl.addEventListener('fieldHovered', e => displayHoverInfo(e.detail, game))
}

function fieldClick (location) {
  //is fight option
  if (fightOptions) {
    const fightOption = fightOptions.find(fight => fight.x === location.x && fight.y === location.y)
    if (fightOption) {
      // TODO fight them
    }
  }
  //is move option
  if (moveOptions) {
    const moveOption = moveOptions.find(move => move.x === location.x && move.y === location.y)
    if (moveOption) {
      focusedUnit.move(moveOption.x, moveOption.y, moveOption.path)
    }
  }
  focusedUnit = null
  moveOptions = null
  fightOptions = null
  gameCanvas.moveOptionsDisplay = null
  gameCanvas.fightOptionsDisplay = null
  //has unit
  const unit = game.findUnitAt(location.x, location.y)
  if (unit) {
    focusedUnit = unit
    const isPlaying = unit.faction === game.currentTurn
    if (isPlaying) {
      moveOptions = gameCanvas.moveOptionsDisplay = unit.pathfind(game)
      //TODO fight options
    }
  }
  //display building info
  //TODO
  renderUi()
  gameCanvas.drawGame()
}

function endTurn () {
  game.endTurn()
  gameCanvas.drawGame()
  renderUi()
}

function renderUi() {
  const currentPlayer = game.currentTurn == FACTION.CRUSADER ? game.crusaderPlayer : game.saracenPlayer
  document.getElementById('turn-info').innerHTML = `${game.currentTurn == FACTION.CRUSADER ? "Kreuzritter" : "Sarazenen"}: ${currentPlayer.money}`
}