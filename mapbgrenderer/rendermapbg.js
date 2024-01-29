const createCanvas = require('canvas').createCanvas
const loadImage = require('canvas').loadImage
const Image = require('canvas').Image
const joinPath = require('path').join

const TILE_SIZE = 100
const OVERLAP = 0.3
const HARBOUR = 7
const texturePath = './imgs/mapTextures/'


module.exports = async function (req, res) {
  const mapData = req.body
  const canvas = createCanvas(TILE_SIZE * mapData.sizeX, TILE_SIZE * mapData.sizeY)
  const ctx = canvas.getContext('2d')
  await renderBase(ctx, mapData)
  await renderField(ctx, mapData, 1)
  await renderField(ctx, mapData, 3)
  await renderField(ctx, mapData, 4)
  await renderField(ctx, mapData, 5)
  await renderField(ctx, mapData, 6)
  await renderField(ctx, mapData, 7)
  await renderField(ctx, mapData, 8)
  if (req.query.thumbnail) {
    sendThumb(canvas, mapData, res)
    return
  }
  canvas.createJPEGStream().pipe(res)
}

function sendThumb (canvas, mapData, res) {
  const thumbSize = Math.floor(Math.min(95.0 / mapData.sizeX, 95.0 / mapData.sizeY))
  const thumbCanvas = createCanvas(thumbSize * mapData.sizeX, thumbSize * mapData.sizeY)
  const ctx = thumbCanvas.getContext('2d')
  ctx.drawImage(canvas, 0, 0, thumbSize * mapData.sizeX, thumbSize * mapData.sizeY)
  res.end(thumbCanvas.toDataURL('image/jpeg', 0.5))
}

async function perFieldOfType (type, mapData, fn) {
  for (let row = 0; row < mapData.sizeY; row++) {
    for (let col = 0; col < mapData.sizeX; col++) {
      if (!type || mapData.data[row * mapData.sizeX + col].terrain === type || (type == 1 && mapData.data[row * mapData.sizeX + col].building === HARBOUR))
        await fn(row, col)
    }
  }
}

async function createMasked (texture, maskFn) {
  const canv = createCanvas(TILE_SIZE, TILE_SIZE)
  const ctx = canv.getContext('2d')
  maskFn(ctx)
  const idata = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE)
  const data32 = new Uint32Array(idata.data.buffer)
  let i = 0
  const len = data32.length
  while(i < len) data32[i] = data32[i++] << 8
  ctx.putImageData(idata, 0, 0)
  ctx.globalCompositeOperation = "source-in";
  ctx.drawImage(texture, 0, 0, TILE_SIZE, TILE_SIZE)
  const result = new Image()
  return new Promise(resolve => {
    result.onload = () => {
      resolve(result)
    }
    result.src = canv.toDataURL('image/png')
  })
}

function getTerrain (mapData, row, col) {
  let terr = mapData.data[row * mapData.sizeX + col].terrain
  if (mapData.data[row * mapData.sizeX + col].building == HARBOUR) return 1
  if (terr === 7) return 1
  return terr
}

function surroundingMatches9 (mapData, row, col) {
  const terr = getTerrain(mapData, row, col)
  const matches = [1,1,1, 1,1,1, 1,1,1]
  if (row > 0) {
    if (col > 0 && getTerrain(mapData, row - 1, col - 1) !== terr) matches[0] = 0
    if (getTerrain(mapData, row - 1, col) !== terr) matches[1] = 0
    if (col < (mapData.sizeX - 1) && getTerrain(mapData, row - 1, col + 1) !== terr) matches[2] = 0
  }
  if (col > 0 && getTerrain(mapData, row, col - 1) !== terr) matches[3] = 0
  if (col < (mapData.sizeX - 1) && getTerrain(mapData, row, col + 1) !== terr) matches[5] = 0
  if (row < (mapData.sizeY - 1)) {
    if (col > 0 && getTerrain(mapData, row + 1, col - 1) !== terr) matches[6] = 0
    if (getTerrain(mapData, row + 1, col) !== terr) matches[7] = 0
    if (col < (mapData.sizeX-1) && getTerrain(mapData, row + 1, col + 1) !== terr) matches[8] = 0
  }
  return matches.join('')
}

function surroundingMatches4 (mapData, row, col) {
  const terr = getTerrain(mapData, row, col)
  const matches = [1,1,1,1]
  if (row > 0 && getTerrain(mapData, row - 1, col) !== terr) matches[0] = 0
  if (col < (mapData.sizeX - 1) && getTerrain(mapData, row, col + 1) !== terr) matches[1] = 0
  if (row < (mapData.sizeY - 1) && getTerrain(mapData, row + 1, col) !== terr) matches[2] = 0
  if (col > 0 && getTerrain(mapData, row, col - 1) !== terr) matches[3] = 0
  return matches.join('')
}

async function renderBase (ctx, mapData) {
  const img = await loadImage(joinPath(texturePath, '2.jpg'))
  await perFieldOfType(null, mapData, (row, col) => {
    ctx.drawImage(img, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE)
  })
}

async function renderField (ctx, mapData, type) {
  if (type === 7) type = 1
  const texture = await loadImage(joinPath(texturePath, type+'.jpg'))
  await perFieldOfType(type, mapData, async function (row, col) {
    const img = await createMasked (texture, ctx => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
      const pattern4 = surroundingMatches4(mapData, row, col)
      const pattern9 = surroundingMatches9(mapData, row, col)
      if (pattern4[0] == '0') { //up
        const grd = ctx.createLinearGradient(0, 0, 0, TILE_SIZE * OVERLAP)
        grd.addColorStop(0, 'black')
        grd.addColorStop(1, 'white')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE * OVERLAP)
      }
      if (pattern4[1] == '0') { //right
        const grd = ctx.createLinearGradient(TILE_SIZE * (1 - OVERLAP), 0, TILE_SIZE, 0)
        grd.addColorStop(0, 'white')
        grd.addColorStop(1, 'black')
        ctx.fillStyle = grd
        ctx.fillRect(TILE_SIZE * (1 - OVERLAP), 0, TILE_SIZE * OVERLAP, TILE_SIZE)
      }
      if (pattern4[2] == '0') { //down
        const grd = ctx.createLinearGradient(0, TILE_SIZE * (1 - OVERLAP), 0, TILE_SIZE)
        grd.addColorStop(0, 'white')
        grd.addColorStop(1, 'black')
        ctx.fillStyle = grd
        ctx.fillRect(0, TILE_SIZE * (1 - OVERLAP), TILE_SIZE, TILE_SIZE * OVERLAP)
      }
      if (pattern4[3] == '0') { //left
        const grd = ctx.createLinearGradient(0, 0, TILE_SIZE * OVERLAP, 0)
        grd.addColorStop(0, 'black')
        grd.addColorStop(1, 'white')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, TILE_SIZE * OVERLAP, TILE_SIZE)
      }
      // Outer corners (adjacent are same but diagonal is different)
      if (pattern9[0] == '0' && pattern4[0] == '1' && pattern4[3] == '1')
        maskOuterCorner(0, 0, ctx)
      if (pattern9[2] == '0' && pattern4[0] == '1' && pattern4[1] == '1')
        maskOuterCorner(TILE_SIZE, 0, ctx)
      if (pattern9[6] == '0' && pattern4[2] == '1' && pattern4[3] == '1')
        maskOuterCorner(0, TILE_SIZE, ctx)
      if (pattern9[8] == '0' && pattern4[1] == '1' && pattern4[2] == '1')
        maskOuterCorner(TILE_SIZE, TILE_SIZE, ctx)
      // Inner corners (adjacent are different)
      if (pattern4[0] == '0' && pattern4[1] == '0')
        maskInnerCorner(TILE_SIZE, 0, ctx)
      if (pattern4[1] == '0' && pattern4[2] == '0')
        maskInnerCorner(TILE_SIZE, TILE_SIZE, ctx)
      if (pattern4[2] == '0' && pattern4[3] == '0')
        maskInnerCorner(0, TILE_SIZE, ctx)
      if (pattern4[3] == '0' && pattern4[0] == '0')
        maskInnerCorner(0, 0, ctx)
    })
    ctx.drawImage(img, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE)
  })
}

function maskOuterCorner (x, y, ctx) {
  const grd = ctx.createRadialGradient(x, y, 0, x, y, TILE_SIZE * OVERLAP)
  grd.addColorStop(0, 'black')
  grd.addColorStop(1, 'white')
  ctx.fillStyle = grd
  ctx.fillRect(x === 0 ? 0 : TILE_SIZE  * (1 - OVERLAP), y === 0 ? 0 : TILE_SIZE  * (1 - OVERLAP), TILE_SIZE  * (1 - OVERLAP), TILE_SIZE * OVERLAP)
}

function maskInnerCorner (x, y, ctx) {
  const grd = ctx.createRadialGradient(
    TILE_SIZE * (x === 0 ? OVERLAP : (1 - OVERLAP)),
    TILE_SIZE * (y === 0 ? OVERLAP : (1 - OVERLAP)),
    0,
    TILE_SIZE * (x === 0 ? OVERLAP : (1 - OVERLAP)),
    TILE_SIZE * (y === 0 ? OVERLAP : (1 - OVERLAP)),
    TILE_SIZE * OVERLAP
  )
  grd.addColorStop(0, 'white')
  grd.addColorStop(1, 'black')
  ctx.fillStyle = grd
  ctx.fillRect(x === 0 ? 0 : TILE_SIZE  * (1 - OVERLAP), y === 0 ? 0 : TILE_SIZE  * (1 - OVERLAP), TILE_SIZE * OVERLAP, TILE_SIZE * 0.3)
}