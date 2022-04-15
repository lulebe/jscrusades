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
  10: {mapNum: 10, sizeX: 20, sizeY: 20},
  11: {mapNum: 11, sizeX: 10, sizeY: 30},
  12: {mapNum: 12, sizeX: 20, sizeY: 15},
  13: {mapNum: 13, sizeX: 30, sizeY: 10},
  14: {mapNum: 14, sizeX: 15, sizeY: 20},
  15: {mapNum: 15, sizeX: 15, sizeY: 15},
  16: {mapNum: 16, sizeX: 10, sizeY: 10},
  17: {mapNum: 17, sizeX: 15, sizeY: 20},
  18: {mapNum: 18, sizeX: 20, sizeY: 15},
  19: {mapNum: 19, sizeX: 20, sizeY: 20},
  20: {mapNum: 20, sizeX: 30, sizeY: 10}
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

export const UNIT_TYPES = {
  GUARD: 1,
  SPEAR: 2,
  SWORD: 3,
  ARCHER: 4,
  LIGHT_KAV: 5,
  ARCHER_KAV: 6,
  HEAVY_KAV: 7,
  CATAPULT: 8,
  BALLISTA: 9,
  TREBUCHET: 10,
  TOWER: 11,
  SHIP: 12,
  AIR: 13
}

const U = UNIT_TYPES

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

export const UNIT_DATA = {
  1: {
    price: 7,
    hp: 5,
    ammo: -1,
    food: -1,
    initiative: 3,
    minAttackDistance: 1,
    maxAttackDistance: 1,
    attackNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 0, 0],
    defenseNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 1, 1],
    moveAndFight: true,
    movementPoints: 4,
    movementCosts: [0,-1, 2, -1, 4, -1, 1, -1, -1],
    flipDefender: [false, false, false],
    legacy: {
      quality: 1,
      prodBuilding: BUILDING.BARRACKS,
      type: "Human"
    }
  },
  2: {
    price: 10,
    hp: 10,
    ammo: -1,
    food: 10,
    initiative: 3,
    minAttackDistance: 1,
    maxAttackDistance: 1,
    attackNumberOfFights: [0, 3, 3, 3, 3, 5, 5, 5, 1, 1, 1, 3, 0, 0],
    defenseNumberOfFights: [0, 3, 3, 3, 3, 5, 5, 5, 1, 1, 1, 3, 1, 2],
    moveAndFight: true,
    movementPoints: 5,
    movementCosts: [0,-1, 2, 2, 3, 3, 1, -1, 3],
    flipDefender: [false, true, true],
    legacy: {
      quality: 2,
      prodBuilding: BUILDING.BARRACKS,
      type: "Human"
    }
  },
  3: {
    price: 15,
    hp: 10,
    ammo: -1,
    food: 10,
    initiative: 3,
    minAttackDistance: 1,
    maxAttackDistance: 1,
    attackNumberOfFights: [0, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 4, 0, 0],
    defenseNumberOfFights: [0, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 4, 1, 1],
    moveAndFight: true,
    movementPoints: 5,
    movementCosts: [0,-1, 2, 2, 3, 3, 1, -1, 3],
    flipDefender: [false, false, false],
    legacy: {
      quality: 3,
      prodBuilding: BUILDING.BARRACKS,
      type: "Human"
    }
  },
  4: {
    price: 20,
    hp: 10,
    ammo: 10,
    food: 10,
    initiative: 1,
    minAttackDistance: 1,
    maxAttackDistance: 2,
    attackNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 2, 3],
    defenseNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 2, 3],
    moveAndFight: true,
    movementPoints: 6,
    movementCosts: [0, -1, 2, 2, 3, 3, 1, -1, 3],
    flipDefender: [false, true, true],
    legacy: {
      quality: 3,
      prodBuilding: BUILDING.BARRACKS,
      type: "Human"
    }
  },
  5: {
    price: 25,
    hp: 10,
    ammo: -1,
    food: 8,
    initiative: 3,
    minAttackDistance: 1,
    maxAttackDistance: 1,
    attackNumberOfFights: [0, 4, 4, 4, 4, 3, 3, 3, 2, 2, 2, 4, 0, 0],
    defenseNumberOfFights: [0, 4, 4, 4, 4, 3, 3, 3, 2, 2, 2, 4, 1, 2],
    moveAndFight: true,
    movementPoints: 8,
    movementCosts: [0, -1, 2, 2, 3, 3, 1, -1, 3],
    flipDefender: [false, false, false],
    legacy: {
      quality: 4,
      prodBuilding: BUILDING.STABLE,
      type: "Soft"
    }
  },
  6: {
    price: 30,
    hp: 10,
    ammo: 8,
    food: 8,
    initiative: 1,
    minAttackDistance: 1,
    maxAttackDistance: 2,
    attackNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 2, 4],
    defenseNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 2, 4],
    moveAndFight: true,
    movementPoints: 8,
    movementCosts: [0, -1, 2, 2, 3, 3, 1, -1, 3],
    flipDefender: [false, true, true],
    legacy: {
      quality: 4,
      prodBuilding: BUILDING.STABLE,
      type: "Soft"
    }
  },
  7: {
    price: 35,
    hp: 12,
    ammo: -1,
    food: 6,
    initiative: 4,
    minAttackDistance: 1,
    maxAttackDistance: 1,
    attackNumberOfFights: [0, 5, 5, 5, 5, 4, 4, 4, 3, 3, 3, 5, 0, 0],
    defenseNumberOfFights: [0, 5, 5, 5, 5, 4, 4, 4, 3, 3, 3, 5, 2, 3],
    moveAndFight: true,
    movementPoints: 7,
    movementCosts: [0, -1, 2, 2, 3, 3, 1, -1, 3],
    flipDefender: [false, false, false],
    legacy: {
      quality: 5,
      prodBuilding: BUILDING.STABLE,
      type: "Soft"
    }
  },
  8: {
    price: 30,
    hp: 10,
    ammo: 6,
    food: 10,
    initiative: 3,
    minAttackDistance: 2,
    maxAttackDistance: 3,
    attackNumberOfFights: [0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 2, 0],
    defenseNumberOfFights: [0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 2, 1],
    moveAndFight: false,
    movementPoints: 4,
    movementCosts: [0, -1, 2, -1, 5, -1, 1, -1, -1],
    flipDefender: [false, false, false],
    legacy: {
      quality: 5,
      prodBuilding: BUILDING.FACTORY,
      type: "Hard"
    }
  },
  9: {
    price: 35,
    hp: 10,
    ammo: 5,
    food: 10,
    initiative: 3,
    minAttackDistance: 2,
    maxAttackDistance: 4,
    attackNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 1, 1],
    defenseNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 1, 1],
    moveAndFight: false,
    movementPoints: 4,
    movementCosts: [0, -1, 2, -1, 4, -1, 1, -1, -1],
    flipDefender: [false, true, true],
    legacy: {
      quality: 6,
      prodBuilding: BUILDING.FACTORY,
      type: "Hard"
    }
  },
  10: {
    price: 45,
    hp: 10,
    ammo: 5,
    food: 10,
    initiative: 4,
    minAttackDistance: 2,
    maxAttackDistance: 4,
    attackNumberOfFights: [0, 2, 2, 2, 2, 1, 1, 1, 4, 4, 4, 2, 1, 0],
    defenseNumberOfFights: [0, 2, 2, 2, 2, 1, 1, 1, 4, 4, 4, 2, 1, 0],
    moveAndFight: false,
    movementPoints: 3,
    movementCosts: [0, -1, 2, -1, -1, -1, 1, -1, -1],
    flipDefender: [false, true, true],
    legacy: {
      quality: 5,
      prodBuilding: BUILDING.FACTORY,
      type: "Hard"
    }
  },
  11: {
    price: 45,
    hp: 12,
    ammo: 10,
    food: 10,
    initiative: 4,
    minAttackDistance: 1,
    maxAttackDistance: 2,
    attackNumberOfFights: [0, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 3, 1, 3],
    defenseNumberOfFights: [0, 4, 4, 4, 4, 3, 3, 3, 1, 1, 1, 4, 1, 3],
    moveAndFight: false,
    movementPoints: 3,
    movementCosts: [0, -1, 2, -1, -1, -1, 1, -1, -1],
    flipDefender: [false, true, true],
    legacy: {
      quality: 5,
      prodBuilding: BUILDING.FACTORY,
      type: "Human"
    }
  },
  12: {
    price: 40,
    hp: 10,
    ammo: -1,
    food: 10,
    initiative: 3,
    minAttackDistance: 1,
    maxAttackDistance: 1,
    attackNumberOfFights: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    defenseNumberOfFights: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    moveAndFight: true,
    movementPoints: 8,
    movementCosts: [0, 1, -1, -1, -1, -1, -1, -1, -1],
    flipDefender: [false, true, true],
    legacy: {
      quality: 4,
      prodBuilding: BUILDING.HARBOUR,
      type: "Water"
    }
  },
  13: {
    price: 50,
    hp: 10,
    ammo: -1,
    food: 5,
    initiative: 2,
    minAttackDistance: 1,
    maxAttackDistance: 1,
    attackNumberOfFights: [0, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 4, 2, 3],
    defenseNumberOfFights: [0, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 4, 2, 3],
    moveAndFight: true,
    movementPoints: 10,
    movementCosts: [0, 1, 1, 1, 1, 1, 1, 1, 1],
    flipDefender: [false, false, false],
    legacy: {
      quality: 5,
      prodBuilding: BUILDING.AIRPORT,
      type: "Air"
    }
  }
}