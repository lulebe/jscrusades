import { UNIT_NAMES_DE, BUILDING_NAMES_DE, PHRASES_DE } from './gamedata/language.js'
import { BUILDING_INFO } from './gamedata/mapInfo.js'

export function displayHoverInfo (location, game) {
  if (location.x < 0 || location.y < 0 || location.x >= game.map.sizeX || location.y >= game.map.sizeY) {
    document.getElementById('field-info').innerHTML = ''
    return
  }
  const field = game.map.fields[location.y][location.x]

  document.getElementById('field-info').innerHTML =
    fieldInfo(field) +
    "<br><br>" +
    unitInfo(game.findUnitAt(location.x, location.y))
}

function unitInfo (unit) {
  if (!unit) return 
  return JSON.stringify(unit).replaceAll(',',',<br>')
}

function fieldInfo (field) {
  return JSON.stringify(field).replaceAll(',',',<br>')
}

export function buildingActions (location, game) {
  console.log(location)
  if (location.x < 0 || location.y < 0 || location.x >= game.map.sizeX || location.y >= game.map.sizeY)
    return ''
  if (game.findUnitAt(location.x, location.y)) return ''
  const field = game.map.fields[location.y][location.x]
  if (!field.building || field.owner !== game.currentTurn) return ''
  const html = PHRASES_DE.RECRUITABLE + '<br>' +
  BUILDING_INFO[field.building].recruitable.map(unitType => 
    `<button data-recruit="${unitType}">${UNIT_NAMES_DE[unitType]}</button>`
  ).reduce((str, cur) => str + cur + '<br>', '')
  return html
}