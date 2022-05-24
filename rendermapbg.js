const createCanvas = require('canvas').createCanvas

const tileSize = 200

module.exports = async function (req, res) {
  const mapData = req.body
  const canvas = createCanvas(tileSize * mapData.sizeX, tileSize * mapData.sizeY)
  const ctx = canvas.getContext('2d')
  const terrainColorTable = ['#ffffff', '#0000ff', '#ffffaa', '#88ff88', '#33bb33', '#888888', '#bbbb99', '#6666ff', '#336655']
  mapData.data.forEach((field, i) => {
    const y = Math.floor(i / mapData.sizeX)
    const x = i % mapData.sizeX
    ctx.fillStyle = terrainColorTable[field.terrain]
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
  })
  canvas.createJPEGStream().pipe(res)
}