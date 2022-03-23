const customAlphabet = require('nanoid/non-secure').customAlphabet

const nanoid = customAlphabet('123456789ABCDEFGHIJKLMNPQRSTUVWXYZ', 5)

//game: {name: String, host: Socket(client), remote: Socket(client), lastActive: Int(Timestamp)}
const games = []

setInterval(removeInactiveGames, 10000)

module.exports = {
  makeGame, getGame, removeGame
}

function getGame (name) {
  const game = games.find(game => game.name == name)
  if (game) game.lastActive = (new Date()).getTime()
  return game
}

function makeGame () {
  let gameName = nanoid()
  while (getGame(gameName) != null) {
    gameName = nanoid()
  }
  const game = {name: gameName, host: null, remote: null, lastActive: (new Date()).getTime()}
  games.push(game)
  return game
}

function removeGame (game) {
  games.splice(games.indexOf(game), 1)
}

function removeInactiveGames () {
  games.forEach(game => {
    if (game.lastActive && game.lastActive < ((new Date()).getTime() - 7200000))
      removeGame(game)
  })
}
