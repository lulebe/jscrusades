const bodyparser = require('body-parser')
const express = require('express')

const mp = require('./mpsessions')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
require('./socket').init(io)

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}))

app.get('/mpgame', (req, res) => {
  res.json({gameName: mp.makeGame().name})
})

app.use(express.static('./static'))

const port = process.env.PORT || 8080
http.listen(port, () => {console.log(`running... visit http://localhost:${port}`)})