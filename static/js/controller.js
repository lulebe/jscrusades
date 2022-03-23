import GameCanvas from './canvas.js'
import Game from './gamedata/game.js'
import { FACTION } from './gamedata/gameConstants.js'
import makeAITurn from './gamedata/ai.js'

import { displayHoverInfo, buildingActions, turnInfo, winInfo } from './ui.js'

let game
let gameAssets
let gameCanvas
let focusedUnit = null
let selectedLocation = null
let moveOptions = []
let fightOptions = []

export function UIController (g, ga) {
  game = g
  gameAssets = ga
  console.log(game)
  const canvasEl = document.getElementById('game-canvas')
  gameCanvas = new GameCanvas(canvasEl, game, gameAssets)
  initUiHandlers()
  renderUi()
  makeAITurnIfNecessary()
}

export function updateGame(g) {
  game = g
  console.log(game)
  gameCanvas.moveOptionsDisplay = moveOptions = []
  gameCanvas.fightOptionsDisplay = fightOptions = []
  gameCanvas.selectedPos = null
  gameCanvas.loadGame(game, gameAssets)
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

async function makeAITurnIfNecessary () {
  if (game.type !== Game.GAME_TYPE.LOCAL_SP || game.myTurn) return
  await makeAITurn(game, gameCanvas)
  renderUi()
  gameCanvas.drawGame()
}

function fieldClick (location) {
  if (!game.myTurn) return
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
  if (moveOptions.length) {
    const moveOption = moveOptions.find(move => move.x === location.x && move.y === location.y)
    if (moveOption) {
      focusedUnit.move(moveOption.x, moveOption.y, moveOption.path, game)
    }
  }
  focusedUnit = null
  moveOptions = []
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
  if (!game.myTurn) return
  gameCanvas.moveOptionsDisplay = moveOptions = []
  gameCanvas.fightOptionsDisplay = fightOptions = []
  gameCanvas.selectedPos = null
  game.endTurn()
  gameCanvas.drawGame()
  renderUi()
  if (game.finished) return gameOver()
  makeAITurnIfNecessary()
}

function renderUi () {
  document.getElementById('turn-info').innerHTML = turnInfo(game)
}

function gameOver () {
  document.getElementById('game-over').innerHTML = winInfo(game)
  document.getElementById('game-over').style.display = 'flex'
}