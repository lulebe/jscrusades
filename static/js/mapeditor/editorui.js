import EditorCanvas from './editorcanvas.js'
import GameAssets from '/static/js/gamedata/gameAssets.js'
import { FIELD, BUILDING, UNIT_TYPES, UNIT_DATA } from '/static/js/gamedata/gameInfo.js'
import { mapData, resize, saveMap, getShareLink } from './editordata.js'

const drawTool = {
  terrain: null,
  building: null,
  unit: null
}

let canvas = null

export default function initUI () {
  document.getElementById('btn-resize').addEventListener('click', e => {
    resize(parseInt(document.getElementById('input-cols').value), parseInt(document.getElementById('input-rows').value))
    canvas?.drawGame()
  })
  document.getElementById('save').addEventListener('click', e => saveMap())
  document.getElementById('save').addEventListener('click', e => deleteMap())
  document.getElementById('btn-share').addEventListener('click', e => {
    getShareLink().then(link => {
      document.getElementById('share-link').innerHTML = `<a href="${link}">${link}</a>`
    })
  })
  { // init UI dropdowns
    const terrainOptions = Object.keys(FIELD).reduce((s, k) => s+`<option value="${FIELD[k]}">${k}</option>`, '<option value="0">---</option>')
    const buildingOptions= Object.keys(BUILDING).reduce(
      (s, k) => s+`<option value="${BUILDING[k]}-1">${k} Crusader</option><option value="${BUILDING[k]}-2">${k} Saracen</option>`,
      '<option value="0">---</option>'
    )
    const unitOptions = Object.keys(UNIT_TYPES).reduce(
      (s, k) => s+`<option value="${UNIT_TYPES[k]}-1">${k} Crusader</option><option value="${UNIT_TYPES[k]}-2">${k} Saracen</option>`,
      '<option value="0">---</option>'
    )
    document.getElementById('editor-dropdowns').innerHTML = `
      <label for="select-terrain">Terrain</label>
      <select id="select-terrain">
        ${terrainOptions}
      </select><br>
      <label for="select-building">Building</label>
      <select id="select-building">
        ${buildingOptions}
      </select>
      owner: 
      <input type="radio" name="owner" id="rad-owner-0" value="0" checked />/
      <input type="radio" name="owner" id="rad-owner-1" value="1" />C
      <input type="radio" name="owner" id="rad-owner-2" value="2" />S
      <br>
      <label for="select-unit">Unit</label>
      <select id="select-unit">
        ${unitOptions}
      </select><br>
    `
    document.getElementById('select-terrain').addEventListener('change', e => {
      drawTool.building = null
      drawTool.unit = null
      drawTool.terrain = parseInt(e.target.value)
      document.getElementById('select-building').value = 0
      document.getElementById('select-unit').value = 0
    })
    document.getElementById('select-building').addEventListener('change', e => {
      const [building, buildingFaction] = e.target.value.split('-').map(i => parseInt(i))
      const owner = parseInt(document.querySelector('input[name=owner]:checked').value)
      drawTool.terrain = null
      drawTool.unit = null
      drawTool.building = {building, buildingFaction, owner}
      document.getElementById('select-terrain').value = 0
      document.getElementById('select-unit').value = 0
    })
    document.getElementById('select-unit').addEventListener('change', e => {
      const [unitType, unitFaction] = e.target.value.split('-').map(i => parseInt(i))
      drawTool.building = null
      drawTool.terrain = null
      drawTool.unit = {unitType, unitFaction, unitHP: unitType != 0 ? UNIT_DATA[unitType].hp : 0}
      document.getElementById('select-terrain').value = 0
      document.getElementById('select-building').value = 0
    });
    [0, 1, 2].forEach(i => {
      document.getElementById('rad-owner-'+i).addEventListener('click', e => {
        if (drawTool.building) drawTool.building.owner = parseInt(e.target.value)
      })
    })
  }
  
  const assets = new GameAssets()
  assets.loadGraphics(false)
  .then(() => {
    const canvasEl = document.getElementById('game-canvas')
    canvas = new EditorCanvas(canvasEl, mapData, assets)
    canvas.initCanvas()
    document.getElementById('zoom-in').addEventListener('click', () => canvas.zoomIn())
    document.getElementById('zoom-out').addEventListener('click', () => canvas.zoomOut())
    canvasEl.addEventListener('fieldClicked', e => fieldClick(e.detail))
    canvasEl.addEventListener('fieldHovered', e => displayHoverInfo(e.detail))
  })
}

function displayHoverInfo ({x, y}) {
  // TODO
}

function fieldClick ({x, y}) {
  if (x < 0 || y < 0 || x >= mapData.sizeX || y >= mapData.sizeY) return
  const clickedField = mapData.fields[y][x]
  if (drawTool.terrain) {
    clickedField.terrain = drawTool.terrain
  }
  if (drawTool.building) {
    clickedField.building = drawTool.building.building
    clickedField.buildingFaction = drawTool.building.buildingFaction
    clickedField.owner = drawTool.building.owner
  }
  if (drawTool.unit) {
    clickedField.unitType = drawTool.unit.unitType
    clickedField.unitFaction = drawTool.unit.unitFaction
    clickedField.unitHP = drawTool.unit.unitHP
  }
  canvas?.drawGame()
}