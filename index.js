const bodyparser = require('body-parser')
const express = require('express')
const twing = require('./templates')

const mp = require('./mpsessions')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
require('./socket').init(io)

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}))


app.get('/', (req, res) => {
  twing.render('index.twig').then(rendered => res.end(rendered))
})

app.get('/game', (req, res) => {
  let game
  if (req.query.mp)
    game = mp.makeGame()
  twing.render('game.twig', {gameName: game ? game.name : null}).then(rendered => res.end(rendered))
})

app.use('/static', express.static('./static'))

const port = process.env.PORT || 8080
http.listen(port, () => {console.log(`running... visit http://localhost:${port}`)})