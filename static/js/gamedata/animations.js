//key: unit Object
//value: {started: Bool(init: false), curX: Number(init initial position), curY(init initial position): Number, fieldsToGoTo: [{x: Number, y: Number}]}
//started will be set true by GameCanvas
//curX/curY are current location
//fieldsToGoTo: array of fields along path, FIFO, GameCanvas will move towards field at index 0 and remove it when reached
