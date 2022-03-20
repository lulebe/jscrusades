export default class GameCanvas {

  #ctx
  #tileSize
  #translateX
  #translateY
  #previousTranslateX
  #previousTranslateY
  #mousedown
  #mousedownX
  #mousedownY
  #mousemoved
  #touchdown
  #touchdownX
  #touchdownY
  #touchmoved
  #scale

  constructor(canvas, game, gameAssets) {
    this.game = game
    this.assets = gameAssets
    this.canvas = canvas
    this.#ctx = this.canvas.getContext('2d')
    this.#tileSize = 80
    this.#translateX = 0
    this.#translateY = 0
    this.#previousTranslateX = 0
    this.#previousTranslateY = 0
    this.#mousedown = false
    this.#mousedownX = 0
    this.#mousedownY = 0
    this.#mousemoved = false
    this.#touchdown = false
    this.#touchdownX = 0
    this.#touchdownY = 0
    this.#touchmoved = false
    this.#scale = 1.0
    window.addEventListener('resize', () => this.recalculateCanvasSize())
    this.#initMouseEvents()
  }


  recalculateCanvasSize () {
    this.canvas.width = document.body.clientWidth
    this.canvas.height = window.innerHeight - 64
    this.drawGame()
  }

  initCanvas () {
    this.recalculateCanvasSize()
  }
  
  drawGame () {
    this.#ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.#ctx.translate(this.#translateX, this.#translateY)
    this.#ctx.scale(this.#scale, this.#scale)
  
    this.#drawMap()
    this.#drawUnits()
    this.#drawGrid()
  
    this.#ctx.scale(1.0/this.#scale, 1.0/this.#scale)
    this.#ctx.translate(-this.#translateX, -this.#translateY)
  }

  #drawGrid () {
    this.#ctx.strokeStyle = "#ffffff"
    this.#ctx.lineWidth = 1
    this.#ctx.beginPath()
    for (let row = 0; row<21; row++) {
      this.#ctx.moveTo(0, this.#tileSize*row)
      this.#ctx.lineTo(this.#tileSize*20, this.#tileSize*row)
    }
    for (let column = 0; column<21; column++) {
      this.#ctx.moveTo(this.#tileSize*column, 0)
      this.#ctx.lineTo(this.#tileSize*column, this.#tileSize*20)
    }
    this.#ctx.stroke()
  }
  
  #drawMap () {
    this.#ctx.drawImage(this.assets.mapBackground, 0, 0, this.game.map.sizeX * this.#tileSize, this.game.map.sizeY * this.#tileSize)
    this.game.map.fields.forEach((row, rowIndex) => {
      row.forEach((field, fieldIndex) => {
        if (!field.building) return
        this.#ctx.drawImage(
          this.assets.buildings[field.buildingFaction][field.building],
          fieldIndex * this.#tileSize,
          rowIndex * this.#tileSize,
          this.#tileSize,
          this.#tileSize
        )
        if (!field.owner) return
        this.#ctx.drawImage(
          this.assets.flags[field.owner],
          (fieldIndex + 1) * this.#tileSize - this.#tileSize / 3,
          rowIndex * this.#tileSize,
          this.#tileSize / 3,
          this.#tileSize / 3
        )
      })
    })
  }
  
  #drawUnits() {
  
  }

  


  
  zoomIn () {
    const currentCenterX = ((this.canvas.width/2)-this.#translateX) / this.#scale
    const currentCenterY = ((this.canvas.height/2)-this.#translateY) / this.#scale
    this.#scale += 0.1
    if (this.#scale >= 1.5) this.#scale = 1.5
    this.#translateX = this.#previousTranslateX = (this.canvas.width/2) - (currentCenterX * this.#scale)
    this.#translateY = this.#previousTranslateY = (this.canvas.height/2) - (currentCenterY * this.#scale)
    this.drawGame()
  }

  zoomOut () {
    const currentCenterX = ((this.canvas.width/2)-this.#translateX) / this.#scale
    const currentCenterY = ((this.canvas.height/2)-this.#translateY) / this.#scale
    this.#scale -= 0.1
    if (this.#scale <= 0.3) this.#scale = 0.3
    this.#translateX = this.#previousTranslateX = (this.canvas.width/2) - (currentCenterX * this.#scale)
    this.#translateY = this.#previousTranslateY = (this.canvas.height/2) - (currentCenterY * this.#scale)
    this.drawGame()
  }

  //mouse events

  #canvasClick (x, y) {
    const bounds = this.canvas.getBoundingClientRect()
    const realX = Math.floor((x - bounds.left - this.#translateX) / this.#scale / this.#tileSize)
    const realY = Math.floor((y - bounds.top - this.#translateY) / this.#scale / this.#tileSize)
    const event = new CustomEvent('fieldClicked', {detail:{x: realX, y: realY}})
    this.canvas.dispatchEvent(event)
  }

  #initMouseEvents () {
    this.canvas.addEventListener("mousedown", e => {
      this.#mousedownX = e.clientX
      this.#mousedownY = e.clientY
      this.#mousedown = true
    }, {passive: false})
    this.canvas.addEventListener("mousemove", e => {
      if (this.#mousedown) {
        this.#mousemoved = true
        this.#translateX = this.#previousTranslateX + e.clientX - this.#mousedownX
        this.#translateY = this.#previousTranslateY + e.clientY - this.#mousedownY
        this.drawGame()
      }
    }, {passive: false})
    window.addEventListener("mouseup", e => {
      if (this.#mousedown) {
        if (!this.#mousemoved)
          this.#canvasClick(this.#mousedownX, this.#mousedownY)
        this.#mousedown = false
        this.#mousemoved = false
        this.#previousTranslateX = this.#translateX
        this.#previousTranslateY = this.#translateY
      }
    }, {passive: false})
    this.canvas.addEventListener("touchstart", e => {
      e.preventDefault()
      if (!this.#touchdown) {
        this.#touchdownX = e.touches[0].clientX
        this.#touchdownY = e.touches[0].clientY
        this.#touchdown = true
      }
    }, {passive: false})
    this.canvas.addEventListener("touchmove", e => {
      e.preventDefault()
      if (this.#touchdown) {
        if (Math.abs(e.touches[0].clientX - this.#touchdownX) > 10 || Math.abs(e.touches[0].clientY - this.#touchdownY) > 10) {
          this.#touchmoved = true
          this.#translateX = this.#previousTranslateX + e.touches[0].clientX - this.#touchdownX
          this.#translateY = this.#previousTranslateY + e.touches[0].clientY - this.#touchdownY
        }
        this.drawGame()
      }
    }, {passive: false})
    this.canvas.addEventListener("touchend", e => {
      e.preventDefault()
      if (this.#touchdown) {
        if (!this.#touchmoved)
          this.canvasClick(this.#touchdownX, this.#touchdownY)
        this.#touchdown = false
        this.#touchmoved = false
        this.#previousTranslateX = this.#translateX
        this.#previousTranslateY = this.#translateY
      }
    }, {passive: false})
  }

}
