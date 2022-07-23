import { stringToMap, mapToString } from '../gamedata/mapLoader.js'
import config from '../config.js'

export const mapData = {
  sizeX: 10,
  sizeY: 10,
  fields: new Array(10).fill(null).map(_ => makeFieldArray(10))
}

let storageId = null

export async function getShareLink () {
  return config.BASE_URL + '/importmap#' + (await mapToString(mapData.fields.flat(), mapData.sizeX, mapData.sizeY))
}

export async function loadMap (sid) {
  storageId = sid
  const storedMap = JSON.parse(window.localStorage.getItem('customMaps'))[storageId].map
  if (!storedMap) return
  const map = await stringToMap(storedMap)
  mapData.sizeX = map.sizeX
  mapData.sizeY = map.sizeY
  mapData.fields = []
  while(map.data.length) mapData.fields.push(map.data.splice(0, map.sizeX))
}

export async function saveMap () {
  if (!window.localStorage.getItem('customMaps')) window.localStorage.setItem('customMaps', '[]')
  const savedMaps = JSON.parse(window.localStorage.getItem('customMaps'))
  if (storageId === null) storageId = savedMaps.length
  const storedMap = await mapToString(mapData.fields.flat(), mapData.sizeX, mapData.sizeY)
  const thumb = await (await fetch(
    `/rendermapbg?thumbnail=true`,
    {method: 'POST', body: JSON.stringify({sizeX: mapData.sizeX, sizeY: mapData.sizeY, data: mapData.fields.flat()}), headers: {'Content-Type': 'application/json'}}
    )).text()
  savedMaps[storageId] = {map: storedMap, thumb}
  window.localStorage.setItem('customMaps', JSON.stringify(savedMaps))
}

export function deleteMap () {
  if (storageId) {
    const savedMaps = JSON.parse(window.localStorage.getItem('customMaps'))
    savedMaps.splice(storageId, 1)
    window.localStorage.setItem('customMaps', JSON.stringify(savedMaps))
  }
  window.location.pathname = '/'
}

export function resize (x, y) {
  if (mapData.sizeX < x) {
    mapData.fields.forEach((row, i) => {
      mapData.fields[i] = row.concat(makeFieldArray(x - mapData.sizeX))
    })
  }
  if (mapData.sizeX > x) {
    mapData.fields.forEach(row => {
      row.splice(x, mapData.sizeX)
    })
  }
  mapData.sizeX = x
  if (mapData.sizeY < y) {
    mapData.fields = mapData.fields.concat(new Array(y - mapData.sizeY).fill(null).map(_ => makeFieldArray(mapData.sizeX)))
  }
  if (mapData.sizeY > y) {
    mapData.fields.splice(y, mapData.sizeY)
  }
  mapData.sizeY = y
}

function makeFieldArray (length) {
  return new Array(length).fill(null).map(_ => ({
    terrain: 1,
    building: 0,
    buildingFaction: 0,
    owner: 0,
    unitType: 0,
    unitFaction: 0,
    unitHP: 0
  }))
}