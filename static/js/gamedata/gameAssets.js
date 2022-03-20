import config from '../config.js'

export default class GameAssets {

  constructor(game) {
    this.game = game
    // arrays of ImageBitmaps for each faction (1=crusaders, 2=saracen):
    this.buildings = [null, [], []]
    this.units = [null, [], []]
    // terrain background image
    this.mapBackground = null
    // flags to mark building ownership (1=crusaders, 2=saracen):
    this.flags = []
  }

  async load() {
    await this.loadGraphics()
  }

  async loadGraphics() {
    // load Map Background
    const mapJpg = await (await fetch(`${config.STATIC_URL}/imgs/mapBackgrounds/map${this.game.map.mapNum}.jpg`)).blob()
    this.mapBackground = await createImageBitmap(mapJpg, {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none'
    })
    // load Buildings
    const cBuildingsFetches = []
    const sBuildingsFetches = []
    for (let i = 1; i <= 8; i++) {
      cBuildingsFetches.push(fetch(`${config.STATIC_URL}/imgs/buildings/${i}_c.png`).then(res => res.blob()).then(blob2Img))
      sBuildingsFetches.push(fetch(`${config.STATIC_URL}/imgs/buildings/${i}_s.png`).then(res => res.blob()).then(blob2Img))
    }
    const cBuildingsResponses = await Promise.all(cBuildingsFetches)
    const sBuildingsResponses = await Promise.all(sBuildingsFetches)
    cBuildingsResponses.forEach((img, i) => this.buildings[1][i+1] = img)
    sBuildingsResponses.forEach((img, i) => this.buildings[2][i+1] = img)
    // load Units
    const cUnitsFetches = []
    const sUnitsFetches = []
    for (let i = 1; i <= 13; i++) {
      cUnitsFetches.push(fetch(`${config.STATIC_URL}/imgs/units/${i}_c.png`).then(res => res.blob()).then(blob2Img))
      sUnitsFetches.push(fetch(`${config.STATIC_URL}/imgs/units/${i}_s.png`).then(res => res.blob()).then(blob2Img))
    }
    const cUnitsResponses = await Promise.all(cUnitsFetches)
    const sUnitsResponses = await Promise.all(sUnitsFetches)
    cUnitsResponses.forEach((img, i) => this.units[1][i+1] = img)
    sUnitsResponses.forEach((img, i) => this.units[2][i+1] = img)
    // load Flags
    this.flags[1] = await fetch(`${config.STATIC_URL}/imgs/other/ic_1.png`).then(res => res.blob()).then(blob2Img)
    this.flags[2] = await fetch(`${config.STATIC_URL}/imgs/other/ic_2.png`).then(res => res.blob()).then(blob2Img)
  }

}

function blob2Img (blob) {
  return createImageBitmap(blob, {
    premultiplyAlpha: 'none',
    colorSpaceConversion: 'none'
  })
}