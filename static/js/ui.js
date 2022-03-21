export function displayHoverInfo (location, game) {
  if (location.x < 0 || location.y < 0 || location.x >= game.map.sizeX || location.y >= game.map.sizeY) {
    document.getElementById('field-info').innerHTML = ''
    return
  }
  const field = game.map.fields[location.y][location.x]
  let unit = game.crusaderPlayer.units.find(u => u.posX == location.x && u.posY == location.y)
  if (!unit)
    game.saracenPlayer.units.find(u => u.posX == location.x && u.posY == location.y)
  document.getElementById('field-info').innerHTML =
    JSON.stringify(field).replaceAll(',',',<br>') +
    "<br><br>" +
    (unit ? JSON.stringify(unit).replaceAll(',',',<br>') : "no unit")
}