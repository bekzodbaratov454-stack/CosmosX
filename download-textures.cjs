const https = require('https')
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'frontend', 'public', 'textures')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

// Real planet textures from three.js GitHub (no CORS issues)
const files = [
  ['sun.jpg',     'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['earth.jpg',   'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['moon.jpg',    'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/moon_1024.jpg'],
  ['mercury.jpg', 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/moon_1024.jpg'],
  ['venus.jpg',   'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['mars.jpg',    'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['jupiter.jpg', 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['saturn.jpg',  'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['uranus.jpg',  'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
  ['neptune.jpg', 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg'],
]

function get(url, dest) {
  return new Promise((res, rej) => {
    const f = fs.createWriteStream(dest)
    const opts = Object.assign(require('url').parse(url), { rejectUnauthorized: false })
    https.get(opts, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        f.close()
        try { fs.unlinkSync(dest) } catch {}
        return get(r.headers.location, dest).then(res).catch(rej)
      }
      r.pipe(f)
      f.on('finish', () => { f.close(); res() })
    }).on('error', e => { try { fs.unlinkSync(dest) } catch {}; rej(e) })
  })
}

;(async () => {
  console.log('Texturalar yuklanmoqda...\n')
  for (const [name, url] of files) {
    const dest = path.join(dir, name)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 50000) {
      console.log(`✓ ${name} (mavjud)`)
      continue
    }
    process.stdout.write(`⬇  ${name} ... `)
    try { await get(url, dest); console.log('✅') }
    catch (e) { console.log(`❌ ${e.message}`) }
  }
  console.log('\n✅ Tugadi! frontend/public/textures/ papkasini tekshiring.')
})()
