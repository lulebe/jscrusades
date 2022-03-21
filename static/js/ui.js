export function displayHoverInfo (location, game) {
  const field = game.map.fields[location.y][location.x]
  let unit = game.crusaderPlayer.units.find(u => u.posX == location.x && u.posY == location.y)
  if (!unit)
    game.saracenPlayer.units.find(u => u.posX == location.x && u.posY == location.y)
  document.getElementById('field-info').innerHTML =
    (field ? JSON.stringify(field).replaceAll(',',',<br>') : "no field") +
    "<br><br>" +
    (unit ? JSON.stringify(unit).replaceAll(',',',<br>') : "no unit")
}