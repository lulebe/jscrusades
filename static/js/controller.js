import GameCanvas from './canvas.js'
import { FACTION } from './gamedata/gameConstants.js'

import { displayHoverInfo, buildingActions } from './ui.js'

let game
let gameAssets
let gameCanvas
let focusedUnit = null
let selectedLocation = null
let moveOptions = null
let fightOptions = []

export default function (g, ga) {
  game = g
  gameAssets = ga
  console.log(game)
  const canvasEl = document.getElementById('game-canvas')
  gameCanvas = new GameCanvas(canvasEl, game, gameAssets)
  initUiHandlers()
  renderUi()
}

function initUiHandlers () {
  const canvasEl = document.getElementById('game-canvas')
  document.getElementById('zoom-in').addEventListener('click', () => gameCanvas.zoomIn())
  document.getElementById('zoom-out').addEventListener('click', () => gameCanvas.zoomOut())
  document.getElementById('end-turn').addEventListener('click', endTurn)
  gameCanvas.initCanvas()
  canvasEl.addEventListener('fieldClicked', e => fieldClick(e.detail))
  canvasEl.addEventListener('fieldHovered', e => displayHoverInfo(e.detail, game))
  document.getElementById('recruitment').addEventListener('click', e => {
    if (e.target.nodeName !== 'BUTTON') return
    if (game.recruit(parseInt(e.target.dataset.recruit), selectedLocation.x, selectedLocation.y)) {
      document.getElementById('recruitment').innerHTML = ''
      renderUi()
      gameCanvas.drawGame()
    }
  })
}

function fieldClick (location) {
  selectedLocation = gameCanvas.selectedPos = location
  //is fight option
  if (fightOptions.length) {
    const fightOption = fightOptions.find(fight => fight.posX === location.x && fight.posY === location.y)
    if (fightOption) {
      game.attack(focusedUnit, fightOption)
      fightOptions = []
    }
  }
  //is move option
  if (moveOptions) {
    const moveOption = moveOptions.find(move => move.x === location.x && move.y === location.y)
    if (moveOption) {
      focusedUnit.move(moveOption.x, moveOption.y, moveOption.path, game)
    }
  }
  focusedUnit = null
  moveOptions = null
  fightOptions = []
  gameCanvas.moveOptionsDisplay = null
  gameCanvas.fightOptionsDisplay = []
  //has unit
  const unit = game.findUnitAt(location.x, location.y)
  if (unit) {
    focusedUnit = unit
    const isPlaying = unit.faction === game.currentTurn
    if (isPlaying) {
      moveOptions = gameCanvas.moveOptionsDisplay = unit.pathfind(game)
      fightOptions = gameCanvas.fightOptionsDisplay = unit.fightfind(game)
    }
  }
  //display building info
  document.getElementById('recruitment').innerHTML = buildingActions(location, game)
  renderUi()
  gameCanvas.drawGame()
}

function endTurn () {
  gameCanvas.selectedPos = null
  game.endTurn()
  gameCanvas.drawGame()
  renderUi()
}

function renderUi() {
  const currentPlayer = game.currentTurn == FACTION.CRUSADER ? game.crusaderPlayer : game.saracenPlayer
  document.getElementById('turn-info').innerHTML = `${game.currentTurn == FACTION.CRUSADER ? "Kreuzritter" : "Sarazenen"}: ${currentPlayer.money}`
}