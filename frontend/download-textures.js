const https = require('https')
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'public', 'textures')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

// NASA / Solar System Scope textures via jsDelivr (no CORS)
const files = [
  ['sun.jpg',            'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['mercury.jpg',        'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/moon_1024.jpg'],
  ['venus.jpg',          'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['earth.jpg',          'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['moon.jpg',           'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/moon_1024.jpg'],
  ['mars.jpg',           'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['jupiter.jpg',        'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['saturn.jpg',         'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['uranus.jpg',         'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['neptune.jpg',        'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['stars_milky_way.jpg','https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
]

function get(url, dest) {
  return new Promise((res, rej) => {
    const f = fs.createWriteStream(dest)
    https.get(url, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        f.close(); fs.unlinkSync(dest)
        return get(r.headers.location, dest).then(res).catch(rej)
      }
      r.pipe(f)
      f.on('finish', () => { f.close(); res() })
    }).on('error', e => { try { fs.unlinkSync(dest) } catch {} rej(e) })
  })
}

;(async () => {
  for (const [name, url] of files) {
    const dest = path.join(dir, name)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`✓ ${name}`)
      continue
    }
    process.stdout.write(`⬇ ${name} ... `)
    try { await get(url, dest); console.log('✅') }
    catch (e) { console.log(`❌ ${e.message}`) }
  }
  console.log('\nTugadi!')
})()
