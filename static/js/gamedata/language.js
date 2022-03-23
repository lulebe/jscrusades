const UNIT_NAMES = {de:[
  "Keine Einheit",
  "Wache",
  "Lanzenträger",
  "Schwertkämpfer",
  "Bogenschütze",
  "Leichte Kavallerie",
  "Bogenritter",
  "Schwere Kavallerie",
  "Katapult",
  "Ballista",
  "Trebuchet",
  "Belagerungsturm",
  "Kriegsschiff",
  "Greif"
]}

const BUILDING_NAMES = {de:[
  "Kein Gebäude",
  "Dorf",
  "Stadt",
  "Hauptquartier",
  "Kaserne",
  "Stallungen",
  "Fabrik",
  "Hafen",
  "Tempel"
]}

const FIELD_NAMES = {de:[
  "Kein Feld",
  "Meer",
  "Erdboden",
  "Hecken",
  "Wald",
  "Berge",
  "Straße",
  "Fluss",
  "Sumpf"
]}

const FACTION_NAMES = {de: [
  "keine Fraktion",
  "Kreuzritter",
  "Sarazenen"
]}

const WORDS = {de:{
  BUILDING: "Gebäude",
  GROUND: "Untergrund",
  RECRUITABLE: "Verfügbare Einheiten:",
  AMMO: "Munition",
  FOOD: "Proviant",
  MOVEMENT_POINTS: "Reichweite",
  ATTACK_DISTANCE: "Kampfreichweite",
  WINS: " gewinnen! 🥇🎉",
  HBONUS: "Kampfbonus",
  BUILDING_BONUS: "Gebäudebonus",
  EARNINGS: "Einnahmen"
}}

export default {
  locale: 'de',
  get UNIT_NAMES () {
    return UNIT_NAMES[this.locale]
  },
  get BUILDING_NAMES () {
    return BUILDING_NAMES[this.locale]
  },
  get FIELD_NAMES () {
    return FIELD_NAMES[this.locale]
  },
  get FACTION_NAMES () {
    return FACTION_NAMES[this.locale]
  },
  get WORDS () {
    return WORDS[this.locale]
  }
}