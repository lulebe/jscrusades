const audios = {
  fight: {
    infantry: new Audio('/sounds/infantry.mp3'),
    archer: new Audio('/sounds/archer.mp3'),
    horses: new Audio('/sounds/horses.mp3'),
    catapult: new Audio('/sounds/catapult.mp3'),
    ballista: new Audio('/sounds/ballista.mp3'),
    shiptower: new Audio('/sounds/ship or tower.mp3'),
    airship: new Audio('/sounds/air or ship.mp3')
  },
  turnMusic: [
    new Audio('/sounds/turn1.mp3'),
    new Audio('/sounds/turn2.mp3'),
    new Audio('/sounds/turn3.mp3')
  ],
  win: [
    null,
    new Audio('/sounds/win1.mp3'),
    new Audio('/sounds/win2.mp3')
  ]
}

const fightSounds = [
  null,
  audios.fight.infantry,
  audios.fight.infantry,
  audios.fight.infantry,
  audios.fight.archer,
  audios.fight.horses,
  audios.fight.horses,
  audios.fight.horses,
  audios.fight.catapult,
  audios.fight.ballista,
  audios.fight.catapult,
  audios.fight.shiptower,
  audios.fight.shiptower,
  audios.fight.airship
]

let turnPlaying = null
let playAudio = false

audios.turnMusic.forEach(audio => {
  audio.addEventListener('ended', () => {
    playTurnMusic()
  })
})

export function isMuted () {
  return !playAudio
}

export function playTurnMusic () {
  if (turnPlaying) {
    if (turnPlaying.currentTime < 60) return
    turnPlaying.pause()
  }
  const song = pickTurnMusic()
  turnPlaying = song
  song.volume = 0.2
  song.currentTime = 0
  if (playAudio)
    song.play()
}

export function playFightSound (attackerType, defenderType) {
  if (!playAudio) return
  fightSounds[attackerType].currentTime = 0
  fightSounds[defenderType].currentTime = 0
  fightSounds[attackerType].play()
  fightSounds[defenderType].play()
}

export function toggleAudio () {
  playAudio = !playAudio
  if (!turnPlaying) playTurnMusic()
  if (!playAudio) turnPlaying.pause()
  if (playAudio) turnPlaying.play()
}

function pickTurnMusic () {
  let pick = turnPlaying
  while (pick === turnPlaying) {
    pick = audios.turnMusic[Math.floor(Math.random()*3)]
  }
  return pick
}
