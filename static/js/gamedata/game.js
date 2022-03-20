export default class Game {

  static GAME_TYPE = {
    LOCAL_MP: 1,
    LOCAL_SP: 2,
    ONLINE_MP: 3
  }

  constructor(map, crusader, saracen, type) {
    this.map = map
    this.crusaderPlayer = crusader
    this.saracenPlayer = saracen
  }

}