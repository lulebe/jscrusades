const bodyparser = require('body-parser')
const express = require('express')
const twing = require('./templates')

const app = express()
const http = require('http').createServer(app)

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}))



app.use('/', express.static('./static'))

http.listen(process.env.PORT || 8080, () => {console.log("running...")})