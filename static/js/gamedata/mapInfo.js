import { UNIT_TYPES as U } from "./unitInfo.js"

export const MAP_INFO = {
  1: {mapNum: 1, sizeX: 10, sizeY: 10},
  2: {mapNum: 2, sizeX: 10, sizeY: 10},
  3: {mapNum: 3, sizeX: 20, sizeY: 10},
  4: {mapNum: 4, sizeX: 20, sizeY: 20},
  5: {mapNum: 5, sizeX: 20, sizeY: 10},
  6: {mapNum: 6, sizeX: 10, sizeY: 20},
  7: {mapNum: 7, sizeX: 10, sizeY: 20},
  8: {mapNum: 8, sizeX: 15, sizeY: 15},
  9: {mapNum: 9, sizeX: 15, sizeY: 15},
  10: {mapNum: 10, sizeX: 20, sizeY: 20}
}

export const BUILDING = {
  VILLAGE: 1,
  CITY: 2,
  HQ: 3,
  BARRACKS: 4,
  STABLE: 5,
  FACTORY: 6,
  HARBOUR: 7,
  AIRPORT: 8
}

export const FIELD = {
  SEA: 1,
  SOIL: 2,
  HEDGES: 3,
  FOREST: 4,
  HILLS: 5,
  ROAD: 6,
  RIVER: 7,
  SWAMP: 8
}

export const HBONUSES = [
  0,
  0,
  1,
  2,
  2,
  3,
  0,
  0,
  0
]

export const BUILDING_INFO = {
  1: {
    recruitable: [],
    supports: [],
    earnings: 1,
    battleBonus: 1
  },
  2: {
    recruitable: [],
    supports: [U.GUARD, U.SPEAR, U.SWORD, U.ARCHER, U.LIGHT_KAV, U.ARCHER_KAV, U.HEAVY_KAV, U.CATAPULT, U.BALLISTA, U.TREBUCHET, U.TOWER],
    earnings: 4,
    battleBonus: 3
  },
  3: {
    recruitable: [],
    supports: [U.GUARD, U.SPEAR, U.SWORD, U.ARCHER, U.LIGHT_KAV, U.ARCHER_KAV, U.HEAVY_KAV, U.CATAPULT, U.BALLISTA, U.TREBUCHET, U.TOWER, U.AIR],
    earnings: 2,
    battleBonus: 1
  },
  4: {
    recruitable: [U.GUARD, U.SPEAR, U.SWORD, U.ARCHER],
    supports: [],
    earnings: 0,
    battleBonus: 2
  },
  5: {
    recruitable: [U.LIGHT_KAV, U.ARCHER_KAV, U.HEAVY_KAV],
    supports: [],
    earnings: 0,
    battleBonus: 2
  },
  6: {
    recruitable: [U.CATAPULT, U.BALLISTA, U.TREBUCHET, U.TOWER],
    supports: [],
    earnings: 0,
    battleBonus: 2
  },
  7: {
    recruitable: [U.SHIP],
    supports: [U.SHIP],
    earnings: 0,
    battleBonus: 2
  },
  8: {
    recruitable: [U.AIR],
    supports: [U.AIR],
    earnings: 0,
    battleBonus: 2
  }
}