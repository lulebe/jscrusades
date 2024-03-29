import renderMapBackground from './rendermapbg.js'

export default class GameAssets {

  constructor(mapNum, mapData) {
    this.mapNum = mapNum || null
    this.mapData = mapData || null
    // arrays of ImageBitmaps for each faction (1=crusaders, 2=saracen):
    this.buildings = [null, [], []]
    this.units = [null, [], []]
    // terrain background image
    this.mapBackground = null
    // flags to mark building ownership (1=crusaders, 2=saracen):
    this.flags = []
  }

  async load(loadMapBackground) {
    await this.loadGraphics(loadMapBackground)
  }

  async loadGraphics(loadMapBackground) {
    // load Map Background
    if (loadMapBackground) {
      if (this.mapNum <= 30) {
        const mapJpg = await (await fetch(`/imgs/mapBackgrounds/map${this.mapNum}.jpg`)).blob()
        this.mapBackground = await createImageBitmap(mapJpg, {
          premultiplyAlpha: 'none',
          colorSpaceConversion: 'none'
        })
      } else {
        const mapBgCanvas = await renderMapBackground(this.mapData, false)
        this.mapBackground = await createImageBitmap(mapBgCanvas, {
          premultiplyAlpha: 'none',
          colorSpaceConversion: 'none'
        })
      }
    }
    // load Buildings
    const cBuildingsFetches = []
    const sBuildingsFetches = []
    for (let i = 1; i <= 8; i++) {
      cBuildingsFetches.push(fetch(`/imgs/buildings/${i}_c.png`).then(res => res.blob()).then(blob2Img))
      sBuildingsFetches.push(fetch(`/imgs/buildings/${i}_s.png`).then(res => res.blob()).then(blob2Img))
    }
    const cBuildingsResponses = await Promise.all(cBuildingsFetches)
    const sBuildingsResponses = await Promise.all(sBuildingsFetches)
    cBuildingsResponses.forEach((img, i) => this.buildings[1][i+1] = img)
    sBuildingsResponses.forEach((img, i) => this.buildings[2][i+1] = img)
    // load Units
    const cUnitsFetches = []
    const sUnitsFetches = []
    for (let i = 1; i <= 13; i++) {
      cUnitsFetches.push(fetch(`/imgs/units/${i}_c.png`).then(res => res.blob()).then(blob2Img))
      sUnitsFetches.push(fetch(`/imgs/units/${i}_s.png`).then(res => res.blob()).then(blob2Img))
    }
    const cUnitsResponses = await Promise.all(cUnitsFetches)
    const sUnitsResponses = await Promise.all(sUnitsFetches)
    cUnitsResponses.forEach((img, i) => this.units[1][i+1] = img)
    sUnitsResponses.forEach((img, i) => this.units[2][i+1] = img)
    // load Flags
    this.flags[1] = await fetch(`/imgs/other/ic_1.png`).then(res => res.blob()).then(blob2Img)
    this.flags[2] = await fetch(`/imgs/other/ic_2.png`).then(res => res.blob()).then(blob2Img)
  }

}

function blob2Img (blob) {
  return createImageBitmap(blob, {
    premultiplyAlpha: 'none',
    colorSpaceConversion: 'none'
  })
}