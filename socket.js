const games = require('./mpsessions')

module.exports =  {
  init (io) {
    io.on('connection', client => {
      client.on('host-name', gameName => {
        const game = games.getGame(gameName)
        console.log('host', gameName)
        if (game) {
          game.host = client
          client.game = game
          game.remote && game.host.emit('remote-request')
        }
      })
      client.on('remote-name', gameName => {
        const game = games.getGame(gameName)
        console.log('remote', gameName)
        if (game) {
          if (game.remote) game.remote.game = null
          game.remote = client
          client.game = game
          game.host && game.host.emit('remote-request')
        }
      })
      client.on('game-data', data => {
        console.log(data)
        if (client.game) {
          if (client.game.host === client) client.game.remote.emit('game-data', data)
          if (client.game.remote === client) client.game.host.emit('game-data', data)
        }
      })
      client.on('game-end', data => {
        const game = games.getGame(data.gameName)
        if (game) {
          client.game = null
          if (game.host) game.host.game = null
          if (game.remote) game.remote.game = null
          games.removeGame(game)
        }
      })
      client.on('disconnect', () => {
        if (client.game) {
          if (client.game.host === client) client.game.host = null
          if (client.game.remote === client) client.game.remote = null
          client.game = null
        }
      })
    })
  }
}
