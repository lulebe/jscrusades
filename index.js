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

app.get('/mpsession', (req, res) => {
  const game = mp.makeGame()
  twing.render('mpsetup.twig', {gameName: game.name}).then(rendered => res.end(rendered))
})

app.get('/game', (req, res) => {
  twing.render('game.twig').then(rendered => res.end(rendered))
})

app.use('/static', express.static('./static'))

http.listen(process.env.PORT || 8080, () => {console.log("running...")})