import { deflateSync, inflateSync, strToU8, strFromU8 } from '../lib/compression.mjs'

//efficient map data saving including units (type, faction, hp)
//takes base64-like string to return field array or field array to return b64-like str
//field array spec:
/*
[{
  terrain: 1-8 (terrain type),
  building: 0-8 (building type or 0 for none),
  buildingFaction: 0-2 (building faction, ignored when building=0),
  owner: 0-2 (building occupier faction, ignored when building=0),
  unitType: 0-13 (unit type on field or 0),
  unitFaction: 0-2 (unit faction, ignored when unitType=0),
  unitHP: 0-12 (unit health points, ignored when unitType=0)
}]
*/

const base64styleMap = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_")


function intToBase64style (num) {
  return base64styleMap[Math.floor(num / (64*64))] + base64styleMap[Math.floor(num / 64) % 64] + base64styleMap[(num) % 64]
}

function base64StyleToInt (str) {
  return base64styleMap.indexOf(str[0]) * 64 * 64 + base64styleMap.indexOf(str[1]) * 64 + base64styleMap.indexOf(str[2])
}

function fieldToNum (field) {
  return (field.terrain-1) * 9 * 2 * 3 * 14 * 2 * 13 + (field.building || 0) * 2 * 3 * 14 * 2 * 13 + ((field.buildingFaction || 1) - 1) * 3 * 14 * 2 * 13 + (field.owner || 0) * 14 * 2 * 13 + (field.unitType || 0) * 2 * 13 + ((field.unitFaction || 1) - 1) * 13 + (field.unitHP || 0)
}

function numToField (num) {
  return {
    terrain: 1 + (Math.floor(num / (9 * 2 * 3 * 14 * 2 * 13))),
    building: Math.floor(num / (2 * 3 * 14 * 2 * 13)) % 9,
    buildingFaction: 1 + (Math.floor(num / (3 * 14 * 2 * 13)) % 2),
    owner: Math.floor(num / (14 * 2 * 13)) % 3,
    unitType: Math.floor(num / (2 * 13)) % 14,
    unitFaction: 1 + (Math.floor(num / 13) % 2),
    unitHP: num % 13
  }
}


//to verify conversions in this file

function generateRandomField () {
  return {
    terrain: 1 + Math.floor(Math.random() * 8),
    building: Math.floor(Math.random() * 9),
    buildingFaction: 1 + Math.floor(Math.random() * 2),
    owner: Math.floor(Math.random() * 3),
    unitType: Math.floor(Math.random() * 14),
    unitFaction: 1 + Math.floor(Math.random() * 2),
    unitHP: Math.floor(Math.random() * 13)
  }
}
function fieldsAreSame (a, b) {
  return !(Object.keys(a).some(key => a[key] !== b[key]))
}

export function test (cycles) {
  for (let i = 0; i < cycles; i++) {
    const randomField = generateRandomField()
    if (!fieldsAreSame(randomField, numToField(base64StyleToInt(intToBase64style(fieldToNum(randomField)))))) return false
  }
  return true
}

export function randomMap (sizeX, sizeY) {
  return Array.from(Array(sizeX * sizeY)).map(() => intToBase64style(fieldToNum(generateRandomField()))).join('')
}

export function stringToMap (strCompressed) {
  // Inverse to mapToString.
  const s = decompress(strCompressed)
  return {sizeX: parseInt(s.substr(0, 2)), sizeY: parseInt(s.substr(2, 2)), data: (s.substr(4).match(/.{1,3}/g) || []).map(field => numToField(base64StyleToInt(field)))}
}

export function mapToString (m, sizeX, sizeY) {
  // Converts a map into a compressed string. Inverse to compressedStringToMap.
  const s = (''+sizeX).padStart(2, '0') + (''+sizeY).padStart(2, '0') + m.map(field => intToBase64style(fieldToNum(field))).join('')
  return compress(s)
}

// Compression algorithm to shorten the map info in the URL
// Functions are copied together from a bunch of SO answers


// Character replacement to make the URL look nicer.
// Direction is forward, i.e., after compression keys will be mapped to values.
const CHAR_REPLACEMENT_MAP = {
  '/': '_',
  '=': '-',
}

async function compress (s) {
  return replaceChars(Uint8ToBase64(deflateSync(strToU8(s))), true)
}

function decompress (s) {
  const compressed = base64ToUint8(replaceChars(s, false))
  return strFromU8(inflateSync(compressed))
}

function replaceChars (s, isForward) {
  for (const [c1, c2] of Object.entries(CHAR_REPLACEMENT_MAP)) {
    if (isForward) {
      s = s.replaceAll(c1, c2)
    } else {
      s = s.replaceAll(c2, c1)
    }
  }
  return s
}

function Uint8ToBase64 (bytes) {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  // Do not use buf.toString('base64').
  return btoa(binary)
}

function base64ToUint8 (base64) {
  // Do not use Buffer.from(data, 'base64').
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}
