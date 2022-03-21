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
  #touch2down
  #touch2downX
  #touch2downY
  #pinchStartScale
  #touchmoved
  #touchhovering
  #scale
  #highlightedTile
  #animationsRunning
  #previousAnimationTimestamp
  #animStep

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
    this.#touch2down = false
    this.#touch2downX = 0
    this.#touch2downY = 0
    this.#pinchStartScale = 1.0
    this.#touchmoved = false
    this.#touchhovering = false
    this.#scale = 1.0
    this.#highlightedTile = [-1, -1]
    this.#animationsRunning = 0
    this.#previousAnimationTimestamp = 0
    this.#animStep = 0
    window.addEventListener('resize', () => this.recalculateCanvasSize())
    this.#initMouseEvents()
  }


  recalculateCanvasSize () {
    this.canvas.width = this.canvas.parentElement.clientWidth
    this.canvas.height = this.canvas.parentElement.clientHeight
    //set scale to 0.1 steps between 0.5 and 1 to fit whole game on canvas
    let newScale = Math.min(this.canvas.width / (this.#tileSize * this.game.map.sizeX), this.canvas.height / (this.#tileSize * this.game.map.sizeY))
    this.#scale = Math.max(Math.min(newScale, 1.5), 0.5)
    //center map
    this.#translateX = this.#previousTranslateX = (this.canvas.width - this.#tileSize * this.#scale * this.game.map.sizeX) / 2
    this.#translateY = this.#previousTranslateY =(this.canvas.height - this.#tileSize * this.#scale * this.game.map.sizeY) / 2
    this.drawGame()
  }

  initCanvas () {
    this.recalculateCanvasSize()
  }
  
  drawGame (animTimestamp=null) {
    this.#ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.#ctx.translate(this.#translateX, this.#translateY)
    this.#ctx.scale(this.#scale, this.#scale)

    if (this.#animationsRunning) {
      if (this.#previousAnimationTimestamp == 0) this.#previousAnimationTimestamp = animTimestamp
      this.#animStep = animTimestamp - this.#previousAnimationTimestamp
      this.#previousAnimationTimestamp = animTimestamp
    }
  
    this.#drawMap()
    this.#drawUnits()
    this.#drawUnitAnimations()
    this.#drawGrid()
    this.#drawHighlight()
  
    this.#ctx.scale(1.0/this.#scale, 1.0/this.#scale)
    this.#ctx.translate(-this.#translateX, -this.#translateY)
    if (this.#animationsRunning)
      window.requestAnimationFrame(t => this.drawGame(t))
    else
      this.#previousAnimationTimestamp = 0
  }

  #drawGrid () {
    this.#ctx.strokeStyle = "rgba(77,73,62,0.3)"
    this.#ctx.lineWidth = 1
    this.#ctx.beginPath()
    for (let row = 0; row<this.game.map.sizeY+1; row++) {
      this.#ctx.moveTo(0, this.#tileSize*row)
      this.#ctx.lineTo(this.#tileSize*this.game.map.sizeX, this.#tileSize*row)
    }
    for (let column = 0; column<this.game.map.sizeX+1; column++) {
      this.#ctx.moveTo(this.#tileSize*column, 0)
      this.#ctx.lineTo(this.#tileSize*column, this.#tileSize*this.game.map.sizeY)
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
  
  #drawUnits () {
    this.game.crusaderPlayer.units.forEach(unit => this.#drawUnit(unit))
    this.game.saracenPlayer.units.forEach(unit => this.#drawUnit(unit))
  }

  #drawUnit (unit) {
    if (unit.animation) return
    this.#ctx.drawImage(
      this.assets.units[unit.faction][unit.type],
      unit.posX * this.#tileSize,
      unit.posY * this.#tileSize,
      this.#tileSize,
      this.#tileSize
    )
    this.#ctx.fillStyle = '#ffffff'
    this.#ctx.fillRect(
      (unit.posX + 1) * this.#tileSize - this.#tileSize * 0.25,
      (unit.posY + 1) * this.#tileSize - this.#tileSize * 0.2,
      this.#tileSize * 0.25,
      this.#tileSize * 0.2
    )
    this.#ctx.fillStyle = '#000000'
    this.#ctx.font = (this.#tileSize*0.2) + 'px monospace'
    this.#ctx.textAlign = 'left'
    this.#ctx.fillText(
      String(unit.hp).padStart(2, '0'),
      (unit.posX + 1) * this.#tileSize - this.#tileSize * 0.24,
      (unit.posY + 1) * this.#tileSize - this.#tileSize * 0.035
    )
  }

  #drawUnitAnimations () {
    this.game.crusaderPlayer.units.filter(unit => unit.animation)
    .concat(this.game.saracenPlayer.units.filter(unit => unit.animation))
    .forEach(unit => {
      if (!unit.animation.started) {
        unit.animation.started = true
        this.#animationsRunning++
      } else if (!unit.animation.fieldsToGoTo.length) {
        unit.animation = null
        this.#animationsRunning--
        this.#drawUnit(unit)
      } else {
        this.#drawUnitAnimation(unit)
      }
    })
  }

  #drawUnitAnimation (unit) {
    const nextField = unit.animation.fieldsToGoTo[0]
    let newX
    let newY
    if (nextField.x > unit.animation.curX) { //positive X
      newX = Math.min(unit.animation.curX + this.#animStep/250, nextField.x)
    } else { //negative X
      newX = Math.max(unit.animation.curX - this.#animStep/250, nextField.x)
    }
    if (nextField.y > unit.animation.curY) { //positive Y
      newY = Math.min(unit.animation.curY + this.#animStep/250, nextField.y)
    } else { //negative Y
      newY = Math.max(unit.animation.curY - this.#animStep/250, nextField.y)
    }
    unit.animation.curX = newX
    unit.animation.curY = newY
    if (newX === nextField.x && newY === nextField.y)
      unit.animation.fieldsToGoTo.shift()
    this.#ctx.drawImage(
      this.assets.units[unit.faction][unit.type],
      newX * this.#tileSize,
      newY * this.#tileSize,
      this.#tileSize,
      this.#tileSize
    )
  }

  #drawHighlight () {
    this.#ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    this.#ctx.fillRect(this.#highlightedTile[0] * this.#tileSize, this.#highlightedTile[1] * this.#tileSize, this.#tileSize, this.#tileSize)
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

  #getFieldAtCoordinates (x, y) {
    const bounds = this.canvas.getBoundingClientRect()
    const realX = Math.floor((x - bounds.left - this.#translateX) / this.#scale / this.#tileSize)
    const realY = Math.floor((y - bounds.top - this.#translateY) / this.#scale / this.#tileSize)
    return {realX, realY}
  }

  #canvasClick (x, y) {
    const {realX, realY} = this.#getFieldAtCoordinates(x, y)
    const event = new CustomEvent('fieldClicked', {detail:{x: realX, y: realY}})
    this.canvas.dispatchEvent(event)
  }

  #canvasHover (x, y) {
    const {realX, realY} = this.#getFieldAtCoordinates(x, y)
    if (realX == this.#highlightedTile[0] && realY == this.#highlightedTile[1]) return
    this.#highlightedTile[0] = realX
    this.#highlightedTile[1] = realY
    const event = new CustomEvent('fieldHovered', {detail:{x: realX, y: realY}})
    this.canvas.dispatchEvent(event)
    this.drawGame()
  }

  #pinchZoom (touches) {
    if (touches.length < 2) return
    const startDistance = Math.sqrt(Math.pow((this.#touchdownX - this.#touch2downX), 2) + Math.pow((this.#touchdownY - this.#touch2downY), 2))
    const currentDistance = Math.sqrt(Math.pow((touches[0].clientX - touches[1].clientX), 2) + Math.pow((touches[0].clientY - touches[1].clientY), 2))
    //keep position
    const centerX = (touches[0].clientX + touches[1].clientX) / 2
    const centerY = (touches[0].clientY + touches[1].clientY) / 2
    const bounds = this.canvas.getBoundingClientRect()
    const realX = (centerX - bounds.left - this.#translateX) / this.#scale / this.#tileSize
    const realY = (centerY - bounds.top - this.#translateY) / this.#scale / this.#tileSize
    //execute scale
    this.#scale = Math.min(Math.max(this.#pinchStartScale * (currentDistance / startDistance),0.5), 1.5)
    //translate to keep position
    const newCenterX = realX * this.#tileSize * this.#scale + this.#translateX + bounds.left
    const newCenterY = realY * this.#tileSize * this.#scale + this.#translateY + bounds.top
    this.#translateX += centerX - newCenterX
    this.#translateY += centerY - newCenterY
    this.drawGame()
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
      } else { //highlight field
        this.#canvasHover(e.clientX, e.clientY)
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
        if (this.#touchhovering) {
          const {realX, realY} = this.#getFieldAtCoordinates(e.touches[0].clientX, e.touches[0].clientY)
          if (realX != this.#highlightedTile[0] || realY != this.#highlightedTile[1])
            this.#touchhovering = false
        }
      } else if (!this.#touch2down) {
        this.#previousTranslateX = this.#translateX
        this.#previousTranslateY = this.#translateY
        this.#touchdownX = e.touches[0].clientX
        this.#touchdownY = e.touches[0].clientY
        this.#pinchStartScale = this.#scale
        this.#touch2downX = e.touches[1].clientX
        this.#touch2downY = e.touches[1].clientY
        this.#touch2down = true
      }
    }, {passive: false})
    this.canvas.addEventListener("touchmove", e => {
      e.preventDefault()
      if (this.#touchdown) {
        if (this.#touch2down) {
          this.#pinchZoom(e.touches)
        } else if (Math.abs(e.touches[0].clientX - this.#touchdownX) > 10 || Math.abs(e.touches[0].clientY - this.#touchdownY) > 10) {
          this.#touchmoved = true
          this.#touchhovering = false
          this.#translateX = this.#previousTranslateX + e.touches[0].clientX - this.#touchdownX
          this.#translateY = this.#previousTranslateY + e.touches[0].clientY - this.#touchdownY
        }
        this.drawGame()
      }
    }, {passive: false})
    this.canvas.addEventListener("touchend", e => {
      e.preventDefault()
      if (this.#touch2down) {
        this.#previousTranslateX = this.#translateX
        this.#previousTranslateY = this.#translateY
        this.#touchdownX = e.touches[0].clientX
        this.#touchdownY = e.touches[0].clientY
      }
      this.#touch2down = false
      if (!e.touches.length && this.#touchdown) {
        if (!this.#touchmoved)
          if (this.#touchhovering)
            this.#canvasClick(this.#touchdownX, this.#touchdownY)
          else {
            this.#canvasHover(this.#touchdownX, this.#touchdownY)
            this.#touchhovering = true
          }
        this.#touchdown = false
        this.#touchmoved = false
        this.#previousTranslateX = this.#translateX
        this.#previousTranslateY = this.#translateY
      }
    }, {passive: false})
  }

}
