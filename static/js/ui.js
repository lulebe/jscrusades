import LOC from './gamedata/language.js'
import { BUILDING_INFO, HBONUSES } from './gamedata/mapInfo.js'
import { UNIT_DATA } from './gamedata/unitInfo.js'
import { FACTION } from './gamedata/gameConstants.js'

export function displayHoverInfo (location, game) {
  if (location.x < 0 || location.y < 0 || location.x >= game.map.sizeX || location.y >= game.map.sizeY) {
    document.getElementById('field-info').innerHTML = ''
    return
  }
  const field = game.map.fields[location.y][location.x]

  document.getElementById('field-info').innerHTML =
    fieldInfo(field) + unitInfo(game.findUnitAt(location.x, location.y) || null)
}

function unitInfo (unit) {
  if (!unit) return ''
  let attackDistance = UNIT_DATA[unit.type].minAttackDistance
  if (UNIT_DATA[unit.type].maxAttackDistance > attackDistance)
    attackDistance += ' - ' + UNIT_DATA[unit.type].maxAttackDistance
  return `
  <div class="center-inside">
    <img src="/static/imgs/unitThumbs/${unit.type}_${unit.faction}.png" class="unit-preview"><br>
    ${LOC.UNIT_NAMES[unit.type || 0]}
  </div>
  <br>
  <div class="info-table">
    <div>${LOC.WORDS.FOOD}</div>
    <div><span class="iconify-inline" data-icon="mdi:fruit-watermelon" style="color: white;"></span></div>
    <div>${unit.food}</div>
  </div>
  <div class="info-table">
    <div>${LOC.WORDS.AMMO}</div>
    <div><span class="iconify-inline" data-icon="mdi:ammunition" style="color: white"></span></div>
    <div>${unit.ammo < 0 ? '∞' : unit.ammo}</div>
  </div>
  <div class="info-table">
    <div>${LOC.WORDS.MOVEMENT_POINTS}</div>
    <div><span class="iconify-inline" data-icon="line-md:navigation-right-up" style="color: white;"></span></div>
    <div>${unit.food > 0 ? UNIT_DATA[unit.type].movementPoints : 1}</div>
  </div>
  <div class="info-table">
    <div>${LOC.WORDS.ATTACK_DISTANCE}</div>
    <div><span class="iconify-inline" data-icon="eos-icons:troubleshooting" style="color: white;"></span></div>
    <div>
      ${attackDistance}
    </div>
  </div>
  `
}

function fieldInfo (field) {
  const icon = [
    '',
    'bi:water',
    'ic:round-grass',
    'teenyicons:plant-outline',
    'carbon:tree',
    'ic:round-terrain',
    'healthicons:paved-road-alt-outline',
    'iconoir:sea-waves',
    'maki:wetland'
  ]
  return `
  <div class="info-table">
    <div>${LOC.WORDS.GROUND}</div>
    <div><span class="iconify-inline" data-icon="${icon[field.terrain]}" style="color: white;"></span></div>
    <div>${LOC.FIELD_NAMES[field.terrain]}</div>
  </div>
  <div class="info-table">
    <div>${LOC.WORDS.HBONUS}</div>
    <div><span class="iconify-inline" data-icon="charm:swords" style="color: white;"></span></div>
    <div>${HBONUSES[field.terrain]}</div>
  </div>
  ` + (field.building ? `
  <br>
  <div class="info-table">
    <div>${LOC.WORDS.BUILDING}</div>
    <div><span class="iconify-inline" data-icon="fluent:building-government-20-filled" style="color: white;"></span></div>
    <div>${LOC.BUILDING_NAMES[field.building || 0]}</div>
  </div>
  <div class="info-table">
    <div>${LOC.WORDS.EARNINGS}</div>
    <div><span class="iconify-inline" data-icon="fa-solid:coins" style="color: #fb0;"></span></div>
    <div>${BUILDING_INFO[field.building || 0].earnings}</div>
  </div>
  <div class="info-table">
    <div>${LOC.WORDS.BUILDING_BONUS}</div>
    <div><span class="iconify-inline" data-icon="charm:swords" style="color: white;"></span></div>
    <div>${BUILDING_INFO[field.building || 0].battleBonus}</div>
  </div>
  ` : '')
}

export function turnInfo (game) {
  return `
  <div class="info-table">
    <div>${LOC.FACTION_NAMES[game.currentTurn]}</div>
    <div>
      <span class="iconify-inline" data-icon="fa-solid:coins" style="color: #fb0;"></span>
    </div><div>
      ${game.currentPlayer.money}
    </div>
  </div>
  `
}

export function buildingActions (location, game) {
  console.log(location)
  if (location.x < 0 || location.y < 0 || location.x >= game.map.sizeX || location.y >= game.map.sizeY)
    return ''
  if (game.findUnitAt(location.x, location.y)) return ''
  const field = game.map.fields[location.y][location.x]
  if (!field.building || field.owner !== game.currentTurn) return ''
  const html = LOC.WORDS.RECRUITABLE + '<br>' +
  BUILDING_INFO[field.building].recruitable.map(unitType => 
    `
    <button data-recruit="${unitType}" class="recruit-btn" ${UNIT_DATA[unitType].price > game.currentPlayer.money ? 'disabled' : ''}>
      ${LOC.UNIT_NAMES[unitType]}
      <span class="pricetag">
        ${UNIT_DATA[unitType].price}
        <span class="iconify-inline" data-icon="fa-solid:coins" style="color: #d90;"></span>
      </span>
    </button>
    `
  ).reduce((str, cur) => str + cur + '<br>', '')
  return html
}

export function winInfo (game) {
  return LOC.FACTION_NAMES[game.winner.faction] + LOC.WORDS.WINS
}