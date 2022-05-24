const { createCanvas } = require('canvas')
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')

module.exports = (req, res) => {
  canvas.createJPEGStream().pipe(res)
}