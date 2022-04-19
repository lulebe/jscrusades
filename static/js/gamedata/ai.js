import { startLegacyAi, AI_STEP_TYPE } from './legacy/ai.js'

export default async function (game, gameCanvas) {
  const makeTurn = startLegacyAi(game)
  let turnResult
  do {
    turnResult = makeTurn()
    gameCanvas.drawGame()
    switch (turnResult) {
      case AI_STEP_TYPE.MOVE:
        await timer(500)
        break
      case AI_STEP_TYPE.ATTACK:
        await timer(4000)
    }
  } while (turnResult > 0)
  game.endTurn()
}

function timer (ms) {
  return Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}