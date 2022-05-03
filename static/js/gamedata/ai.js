import { startLegacyAi, AI_STEP_TYPE } from './legacy/ai.js'


export default async function makeAITurn(game, gameCanvas, isFastMode) {
  const makeTurn = startLegacyAi(game)
  let turnResult
  do {
    turnResult = makeTurn()
    gameCanvas.drawGame()
    if (!isFastMode) {
      console.log("Maybe wait because not in fast mode")
      await wait(turnResult)
    } else {
      console.log("In fast mode!!!")
    }
  } while (turnResult > 0)
  game.endTurn()
}

async function wait(turnResult) {
  switch (turnResult) {
    case AI_STEP_TYPE.MOVE:
      await timer(750)
      break
    case AI_STEP_TYPE.ATTACK:
      await timer(4000)
  }
}

function timer(ms) {
  console.log("start timer", ms)
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}
