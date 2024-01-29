const bodyparser = require('body-parser')
const express = require('express')

const mp = require('./mpsessions')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
require('./socket').init(io)

const rendermapbg = require('./mapbgrenderer/rendermapbg')

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}))

//TODO
app.get('/mpgame', (req, res) => {
  res.send({gameName: mp.makeGame().name})
})

app.post('/rendermapbg', rendermapbg)

app.use('/', express.static('./static'))

const port = process.env.PORT || 8080
http.listen(port, () => {console.log(`running... visit http://localhost:${port}`)})