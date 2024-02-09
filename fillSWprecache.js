const fs = require('fs')

const CACHE_ASSETS_CORS = [
  '/',
  'https://code.iconify.design/2/2.2.0/iconify.min.js',
  'https://cdn.socket.io/4.4.1/socket.io.min.js'
]
const ICONS = [
  'bxs:save',
  'bxs:trash',
  'bxs:zoom-in',
  'bxs:zoom-out',
  'bxs:volume-mute',
  'bxs:volume-full',
  'mdi:cctv',
  'mdi:cctv-off',
  'mdi:ammunition',
  'mdi:fruit-watermelon',
  'line-md:navigation-right-up',
  'eos-icons:troubleshooting',
  'line-md:arrow-expand',
  'bi:water',
  'ic:round-grass',
  'teenyicons:plant-outline',
  'carbon:tree',
  'ic:round-terrain',
  'healthicons:paved-road-alt-outline',
  'iconoir:sea-waves',
  'maki:wetland',
  'charm:swords',
  'fluent:building-government-20-filled',
  'fluent:delete-24-filled',
  'fa-solid:coins'
]

function iconUrls () {
  return ICONS.map(icon => {
    const data = icon.split(':')
    return `https://api.iconify.design/${data[0]}.json?icons=${data[1]}`
  })
}

// Recursive function to get files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = `${dir}/${file}`
    if (fs.statSync(filePath).isDirectory()) {
      if (filePath.indexOf('mapData') != -1) return
      getFiles(filePath, fileList)
    } else {
      if (!filePath.endsWith('.css.map') && !filePath.endsWith('/sw.js'))
        fileList.push(filePath)
    }
  })
  return fileList
}

// Replace '/path/to/dir' with the actual directory path
const filesInFolder = getFiles('./static').map(f => f.replace('./static', ''))
fs.writeFileSync('SWfilePaths.json', JSON.stringify([...filesInFolder, ...CACHE_ASSETS_CORS, ...iconUrls()], null, 2))