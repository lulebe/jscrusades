import GameCanvas from './canvas.js'
import Game from './gamedata/game.js'
import makeAITurn from './gamedata/ai.js'
import { UNIT_DATA, UNIT_TYPES } from './gamedata/unitInfo.js'
import { BUILDING } from './gamedata/mapInfo.js'
import { playTurnMusic, playFightSound, toggleAudio } from './audio.js'

import { displayHoverInfo, buildingActions, turnInfo, winInfo } from './ui.js'
import { sendGame, sendFight } from './mp.js'

let game
let gameAssets
let mpName
let gameCanvas
let focusedUnit = null
let selectedLocation = null
let moveOptions = []
let fightOptions = []

export function UIController (g, ga, mp) {
  game = g
  console.log(g)
  gameAssets = ga
  mpName = mp
  const canvasEl = document.getElementById('game-canvas')
  gameCanvas = new GameCanvas(canvasEl, game, gameAssets)
  initUiHandlers()
  renderUi()
  makeAITurnIfNecessary()
}

export function updateGame(g) {
  if (game) game.onFight = null
  game = g
  console.log(g)
  game.onFight = onFight
  gameCanvas.moveOptionsDisplay = moveOptions = []
  gameCanvas.fightOptionsDisplay = fightOptions = []
  gameCanvas.selectedPos = null
  gameCanvas.loadGame(game, gameAssets)
  if (game.finished) gameOver()
  renderUi()
}

function initUiHandlers () {
  game.onFight = onFight
  const canvasEl = document.getElementById('game-canvas')
  document.getElementById('zoom-in').addEventListener('click', () => gameCanvas.zoomIn())
  document.getElementById('zoom-out').addEventListener('click', () => gameCanvas.zoomOut())
  document.getElementById('toggle-audio').addEventListener('click', () => toggleAudio())
  document.getElementById('end-turn').addEventListener('click', endTurn)
  gameCanvas.initCanvas()
  canvasEl.addEventListener('fieldClicked', e => fieldClick(e.detail))
  canvasEl.addEventListener('fieldHovered', e => displayHoverInfo(e.detail, game))
  document.getElementById('recruitment').addEventListener('click', e => {
    if (e.target.nodeName !== 'BUTTON') return
    if (game.recruit(parseInt(e.target.dataset.recruit), selectedLocation.x, selectedLocation.y)) {
      if (game.type === Game.GAME_TYPE.ONLINE_MP)
        sendGame()
      document.getElementById('recruitment').innerHTML = ''
      renderUi()
      gameCanvas.drawGame()
    }
  })
}

export function onFight (attacker, defender, attackerDamage, defenderDamage) {
  if (game.type === Game.GAME_TYPE.ONLINE_MP && game.myTurn) sendFight(attacker, defender, attackerDamage, defenderDamage)
  const bga = findUnitBackground(attacker.type, game.map.fields[attacker.posY][attacker.posX])
  const bgd = findUnitBackground(defender.type, game.map.fields[defender.posY][defender.posX])
  document.getElementById('fight-attacker-health').innerHTML = ('' + attacker.hp + attackerDamage).padStart(2, '0')
  document.getElementById('fight-defender-health').innerHTML = ('' + defender.hp + defenderDamage).padStart(2, '0')
  document.getElementById('fight-attacker-img').classList.remove('att-flipped')
  if (!UNIT_DATA[attacker.type].flipDefender[attacker.faction])
    document.getElementById('fight-attacker-img').classList.add('att-flipped')
  document.getElementById('fight-defender-img').classList.remove('def-flipped')
  if (UNIT_DATA[defender.type].flipDefender[defender.faction])
    document.getElementById('fight-defender-img').classList.add('def-flipped')
  document.getElementById('fight-defender-img').src = `/static/imgs/unitThumbs/${defender.type}_${defender.faction}.png`
  document.getElementById('fight-attacker-img').src = `/static/imgs/unitThumbs/${attacker.type}_${attacker.faction}.png`
  document.getElementById('fight-attacker-background').style.backgroundImage = `url("/static/imgs/fightBgs/${bga}.png"`
  document.getElementById('fight-defender-background').style.backgroundImage = `url("/static/imgs/fightBgs/${bgd}.png"`
  document.getElementById('fight').classList.add('visible')
  animateFight(attacker.hp + attackerDamage, attackerDamage, defender.hp + defenderDamage, defenderDamage, 8)
  playFightSound(attacker.type, defender.type)
}

function findUnitBackground (unitType, field) {
  if (unitType === UNIT_TYPES.AIR) return 'u13'
  if (field.building === BUILDING.HARBOUR) return 'b7'
  if (field.building) return 'b'
  return 't' + field.terrain
}

function animateFight (attackerHPnow, attackerDamage, defenderHPnow, defenderDamage, cyclesLeft) {
  document.getElementById('fight-attacker-health').innerHTML = ('' + attackerHPnow).padStart(2, '0')
  document.getElementById('fight-defender-health').innerHTML = ('' + defenderHPnow).padStart(2, '0')
  let nextAhp = attackerDamage > 0 ? attackerHPnow - 1 : attackerHPnow
  let nextDhp = defenderDamage > 0 ? defenderHPnow - 1 : defenderHPnow
  if (cyclesLeft) setTimeout(() => animateFight(nextAhp, attackerDamage-1, nextDhp, defenderDamage-1, cyclesLeft-1), 300)
  else {
    document.getElementById('fight').classList.remove('visible')
  }
}

async function makeAITurnIfNecessary () {
  if (game.type !== Game.GAME_TYPE.LOCAL_SP || game.myTurn) return
  await makeAITurn(game, gameCanvas)
  renderUi()
  gameCanvas.drawGame()
  if (game.finished) gameOver()
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
      //MP
      if (game.type === Game.GAME_TYPE.ONLINE_MP) {
        sendGame()
      }
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
  if (game.type === Game.GAME_TYPE.ONLINE_MP)
    sendGame()
  if (game.finished) return gameOver()
  makeAITurnIfNecessary()
  playTurnMusic()
}

function renderUi () {
  document.getElementById('turn-info').innerHTML = turnInfo(game)
  document.getElementById('mp-name').innerHTML = mpName ? ("Mutiplayer ID: " + mpName) : ''
}

function gameOver () {
  document.getElementById('game-over').innerHTML = winInfo(game)
  document.getElementById('game-over').style.display = 'flex'
}