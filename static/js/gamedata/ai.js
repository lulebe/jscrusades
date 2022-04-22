import { startLegacyAi } from './legacy/ai.js'

export default async function (game, gameCanvas) {
  return new Promise((resolve, reject) => {
    let updateCanvas = setInterval(() => gameCanvas.drawGame(), 100)
    startLegacyAi(game, () => {
      clearInterval(updateCanvas)
      game.endTurn()
      resolve()
    })
  })
}