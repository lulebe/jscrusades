const fs = require('fs')

const CACHE_ASSETS_CORS = [
  '/',
  'https://code.iconify.design/2/2.2.0/iconify.min.js',
  'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@600&display=swap',
  'https://cdn.socket.io/4.4.1/socket.io.min.js'
]

// Recursive function to get files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = `${dir}/${file}`
    if (fs.statSync(filePath).isDirectory()) {
      if (filePath.indexOf('legacy') != -1 || filePath.indexOf('mapData') != -1) return
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
fs.writeFileSync('SWfilePaths.json', JSON.stringify([...filesInFolder, ...CACHE_ASSETS_CORS], null, 2))