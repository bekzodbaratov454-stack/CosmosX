import { useRef, useMemo, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

// ─── Seeded RNG ───────────────────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// ─── Canvas Texture Helper ────────────────────────────────────────────────────
function makeTex(drawFn, size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  drawFn(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// ─── Planet Textures ──────────────────────────────────────────────────────────
function makeSunTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(1)
    const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    grad.addColorStop(0, '#fff7a1')
    grad.addColorStop(0.3, '#ffe066')
    grad.addColorStop(0.6, '#ffaa00')
    grad.addColorStop(0.85, '#ff6600')
    grad.addColorStop(1, '#cc2200')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, s, s)
    // sunspots
    for (let i = 0; i < 18; i++) {
      const x = rng() * s, y = rng() * s, r = rng() * 18 + 4
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(120,40,0,${0.3 + rng() * 0.4})`
      ctx.fill()
    }
    // surface granules
    for (let i = 0; i < 200; i++) {
      const x = rng() * s, y = rng() * s, r = rng() * 6 + 2
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,200,50,${0.1 + rng() * 0.2})`
      ctx.fill()
    }
  }, 1024)
}

function makeMercuryTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(2)
    ctx.fillStyle = '#8a8a8a'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 80; i++) {
      const x = rng() * s, y = rng() * s, r = rng() * 20 + 3
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(50,50,50,${0.5 + rng() * 0.4})`)
      g.addColorStop(0.6, `rgba(80,80,80,0.3)`)
      g.addColorStop(1, 'rgba(140,140,140,0)')
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()
    }
    for (let i = 0; i < 30; i++) {
      const x = rng() * s, y = rng() * s, w = rng() * 60 + 20, h = rng() * 30 + 10
      ctx.fillStyle = `rgba(60,60,60,${0.2 + rng() * 0.3})`
      ctx.beginPath(); ctx.ellipse(x, y, w, h, rng() * Math.PI, 0, Math.PI * 2); ctx.fill()
    }
  }, 512)
}

function makeVenusTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(3)
    const grad = ctx.createLinearGradient(0, 0, s, s)
    grad.addColorStop(0, '#e8c84a')
    grad.addColorStop(0.5, '#d4a017')
    grad.addColorStop(1, '#c8960c')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 25; i++) {
      const y = rng() * s, thick = rng() * 30 + 8
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= s; x += 20) {
        ctx.lineTo(x, y + Math.sin(x * 0.04 + rng() * 6) * 15)
      }
      ctx.lineWidth = thick
      ctx.strokeStyle = `rgba(255,220,80,${0.15 + rng() * 0.25})`
      ctx.stroke()
    }
    for (let i = 0; i < 15; i++) {
      const x = rng() * s, y = rng() * s, rx = rng() * 80 + 30, ry = rng() * 20 + 8
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200,160,10,${0.2 + rng() * 0.2})`; ctx.fill()
    }
  }, 512)
}

function makeEarthTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(4)
    ctx.fillStyle = '#1a6fa8'; ctx.fillRect(0, 0, s, s)
    // continents
    const continents = [
      { x: 0.55, y: 0.35, rx: 0.12, ry: 0.18 },
      { x: 0.48, y: 0.55, rx: 0.08, ry: 0.12 },
      { x: 0.25, y: 0.4, rx: 0.14, ry: 0.2 },
      { x: 0.72, y: 0.45, rx: 0.1, ry: 0.15 },
      { x: 0.15, y: 0.6, rx: 0.07, ry: 0.1 },
      { x: 0.8, y: 0.6, rx: 0.06, ry: 0.09 },
    ]
    continents.forEach(c => {
      ctx.beginPath()
      ctx.ellipse(c.x * s, c.y * s, c.rx * s + rng() * 20, c.ry * s + rng() * 20, rng() * Math.PI, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${60 + rng() * 40},${120 + rng() * 40},${40 + rng() * 30},0.9)`; ctx.fill()
    })
    // polar ice
    ctx.fillStyle = 'rgba(240,248,255,0.9)'
    ctx.beginPath(); ctx.ellipse(s / 2, 0, s * 0.35, s * 0.1, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(s / 2, s, s * 0.3, s * 0.08, 0, 0, Math.PI * 2); ctx.fill()
    // clouds
    for (let i = 0; i < 40; i++) {
      const x = rng() * s, y = rng() * s, rx = rng() * 60 + 20, ry = rng() * 15 + 5
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${0.15 + rng() * 0.25})`; ctx.fill()
    }
  }, 1024)
}

function makeMoonTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(5)
    ctx.fillStyle = '#b0b0b0'; ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 60; i++) {
      const x = rng() * s, y = rng() * s, r = rng() * 25 + 3
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(80,80,80,${0.4 + rng() * 0.4})`)
      g.addColorStop(0.7, `rgba(100,100,100,0.2)`)
      g.addColorStop(1, 'rgba(180,180,180,0)')
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()
    }
    for (let i = 0; i < 20; i++) {
      const x = rng() * s, y = rng() * s, r = rng() * 8 + 2
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(60,60,60,${0.5 + rng() * 0.3})`; ctx.fill()
    }
  }, 256)
}

function makeMarsTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(6)
    const grad = ctx.createLinearGradient(0, 0, s, s)
    grad.addColorStop(0, '#c1440e'); grad.addColorStop(0.5, '#a0330a'); grad.addColorStop(1, '#8b2500')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, s, s)
    // surface variation
    for (let i = 0; i < 50; i++) {
      const x = rng() * s, y = rng() * s, rx = rng() * 60 + 20, ry = rng() * 30 + 10
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${150 + rng() * 50},${50 + rng() * 30},${10 + rng() * 20},0.3)`; ctx.fill()
    }
    // Olympus Mons
    const ox = s * 0.35, oy = s * 0.45
    const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, s * 0.08)
    og.addColorStop(0, 'rgba(60,20,5,0.8)'); og.addColorStop(1, 'rgba(160,50,10,0)')
    ctx.beginPath(); ctx.arc(ox, oy, s * 0.08, 0, Math.PI * 2); ctx.fillStyle = og; ctx.fill()
    // polar ice
    ctx.fillStyle = 'rgba(240,240,255,0.85)'
    ctx.beginPath(); ctx.ellipse(s / 2, 0, s * 0.25, s * 0.07, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(s / 2, s, s * 0.2, s * 0.06, 0, 0, Math.PI * 2); ctx.fill()
  }, 512)
}

function makeJupiterTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(7)
    const bands = [
      '#c88b3a', '#e8c87a', '#d4a050', '#f0d890', '#c07030',
      '#e0b060', '#d09040', '#f0e0a0', '#b86820', '#e8c070',
    ]
    const bh = s / bands.length
    bands.forEach((c, i) => {
      ctx.fillStyle = c; ctx.fillRect(0, i * bh, s, bh + 1)
    })
    // band turbulence
    for (let i = 0; i < 60; i++) {
      const y = rng() * s, x = rng() * s, rx = rng() * 80 + 20, ry = rng() * 12 + 4
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${100 + rng() * 80},${60 + rng() * 40},${20 + rng() * 20},0.25)`; ctx.fill()
    }
    // Great Red Spot
    const gx = s * 0.65, gy = s * 0.62
    const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, s * 0.09)
    gg.addColorStop(0, 'rgba(180,40,20,0.95)'); gg.addColorStop(0.5, 'rgba(200,80,30,0.7)'); gg.addColorStop(1, 'rgba(180,100,40,0)')
    ctx.beginPath(); ctx.ellipse(gx, gy, s * 0.09, s * 0.055, 0, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill()
  }, 1024)
}

function makeSaturnTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(8)
    const grad = ctx.createLinearGradient(0, 0, 0, s)
    grad.addColorStop(0, '#e8d5a0'); grad.addColorStop(0.3, '#d4b870'); grad.addColorStop(0.6, '#c8a850'); grad.addColorStop(1, '#b89040')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 20; i++) {
      const y = rng() * s, thick = rng() * 15 + 5
      ctx.fillStyle = `rgba(${160 + rng() * 40},${120 + rng() * 30},${50 + rng() * 30},0.3)`
      ctx.fillRect(0, y, s, thick)
    }
  }, 512)
}

function makeUranusTexture() {
  return makeTex((ctx, s) => {
    const grad = ctx.createLinearGradient(0, 0, 0, s)
    grad.addColorStop(0, '#7de8e8'); grad.addColorStop(0.5, '#4fc4c4'); grad.addColorStop(1, '#2aa8a8')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, s, s)
    const rng = mulberry32(9)
    for (let i = 0; i < 8; i++) {
      const y = rng() * s
      ctx.fillStyle = `rgba(100,220,220,0.15)`; ctx.fillRect(0, y, s, rng() * 20 + 5)
    }
  }, 256)
}

function makeNeptuneTexture() {
  return makeTex((ctx, s) => {
    const rng = mulberry32(10)
    const grad = ctx.createLinearGradient(0, 0, 0, s)
    grad.addColorStop(0, '#1a3a8a'); grad.addColorStop(0.5, '#1428a0'); grad.addColorStop(1, '#0a1878')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 12; i++) {
      const y = rng() * s, x = rng() * s, w = rng() * 120 + 40, h = rng() * 10 + 3
      ctx.beginPath(); ctx.ellipse(x, y, w, h, rng() * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180,220,255,${0.15 + rng() * 0.2})`; ctx.fill()
    }
    // Great Dark Spot
    const dx = s * 0.4, dy = s * 0.45
    ctx.beginPath(); ctx.ellipse(dx, dy, s * 0.07, s * 0.04, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(5,10,60,0.7)'; ctx.fill()
  }, 512)
}

function makeSaturnRingTexture() {
  return makeTex((ctx, s) => {
    ctx.clearRect(0, 0, s, s)
    const cx = s / 2, cy = s / 2
    const rings = [
      { r1: 0.38, r2: 0.44, color: 'rgba(200,180,120,0.6)' },
      { r1: 0.45, r2: 0.52, color: 'rgba(220,200,140,0.8)' },
      { r1: 0.53, r2: 0.58, color: 'rgba(180,160,100,0.5)' },
      { r1: 0.59, r2: 0.62, color: 'rgba(160,140,80,0.3)' },
      { r1: 0.63, r2: 0.68, color: 'rgba(200,185,130,0.6)' },
      { r1: 0.69, r2: 0.72, color: 'rgba(140,120,70,0.25)' },
    ]
    rings.forEach(({ r1, r2, color }) => {
      const g = ctx.createRadialGradient(cx, cy, r1 * s, cx, cy, r2 * s)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(0.2, color)
      g.addColorStop(0.8, color)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(cx, cy, r2 * s, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()
    })
  }, 1024)
}

// ─── Planet Data ──────────────────────────────────────────────────────────────
const PLANET_DATA = [
  {
    id: 'sun', name: 'Sun', nameUz: 'Quyosh',
    radius: 5, orbitRadius: 0, speed: 0, tilt: 0.13,
    color: '#ffcc00', emissive: '#ff8800', emissiveIntensity: 1.5,
    getTexture: makeSunTexture,
    info: {
      en: 'The star at the center of our Solar System. It contains 99.86% of the total mass of the Solar System and provides the energy that sustains life on Earth.',
      uz: 'Quyosh sistemasining markazi bo\'lgan yulduz. U Quyosh sistemasining umumiy massasining 99.86% ini tashkil etadi va Yerdagi hayotni qo\'llab-quvvatlovchi energiya beradi.',
    },
    stats: { diameter: '1,392,700 km', distance: '0 AU', moons: '0', temperature: '5,500°C (surface)' },
    funFact: { en: 'The Sun is so large that about 1.3 million Earths could fit inside it.', uz: 'Quyosh shunchalik kattaki, uning ichiga taxminan 1.3 million Yer sig\'adi.' },
  },
  {
    id: 'mercury', name: 'Mercury', nameUz: 'Merkuriy',
    radius: 0.7, orbitRadius: 10, speed: 4.74, tilt: 0.03,
    color: '#9a9a9a', getTexture: makeMercuryTexture,
    info: {
      en: 'The smallest planet closest to the Sun. It has no atmosphere and experiences extreme temperature swings from -180°C to 430°C.',
      uz: 'Quyoshga eng yaqin va eng kichik sayyora. Atmosferasi yo\'q va harorat -180°C dan 430°C gacha o\'zgaradi.',
    },
    stats: { diameter: '4,879 km', distance: '0.39 AU', moons: '0', temperature: '-180°C to 430°C' },
    funFact: { en: 'A year on Mercury is only 88 Earth days long.', uz: 'Merkuriydagi bir yil atigi 88 Yer kuniga teng.' },
  },
  {
    id: 'venus', name: 'Venus', nameUz: 'Venera',
    radius: 1.2, orbitRadius: 16, speed: 3.5, tilt: 0.05,
    color: '#e8c84a', getTexture: makeVenusTexture,
    info: {
      en: 'Hottest planet due to greenhouse effect. Surface temperature reaches 465°C. Rotates backwards compared to most planets.',
      uz: 'Issiqxona effekti tufayli eng issiq sayyora. Yuzasi harorati 465°C ga yetadi. Ko\'pchilik sayyoralardan farqli ravishda teskari aylanadi.',
    },
    stats: { diameter: '12,104 km', distance: '0.72 AU', moons: '0', temperature: '465°C' },
    funFact: { en: 'A day on Venus is longer than its year.', uz: 'Veneradagi bir kun uning bir yilidan uzunroq.' },
  },
  {
    id: 'earth', name: 'Earth', nameUz: 'Yer',
    radius: 1.3, orbitRadius: 23, speed: 2.98, tilt: 0.41,
    color: '#2a7fd4', getTexture: makeEarthTexture,
    info: {
      en: 'The only known planet with life. It has liquid water, a protective atmosphere, and a magnetic field that shields it from solar radiation.',
      uz: 'Hayot mavjud yagona ma\'lum sayyora. Suyuq suv, himoya atmosferasi va quyosh nurlanishidan himoya qiluvchi magnit maydoni mavjud.',
    },
    stats: { diameter: '12,742 km', distance: '1.00 AU', moons: '1', temperature: '-88°C to 58°C' },
    funFact: { en: 'Earth is the densest planet in the Solar System.', uz: 'Yer Quyosh sistemasidagi eng zich sayyoradir.' },
  },
  {
    id: 'mars', name: 'Mars', nameUz: 'Mars',
    radius: 0.9, orbitRadius: 32, speed: 2.41, tilt: 0.44,
    color: '#c1440e', getTexture: makeMarsTexture,
    info: {
      en: 'The Red Planet, home to Olympus Mons — the tallest volcano in the Solar System. NASA rovers have been exploring its surface since 1997.',
      uz: 'Qizil sayyora, Quyosh sistemasidagi eng baland vulqon — Olimp tog\'iga uy. NASA roverlari 1997 yildan beri uning yuzasini o\'rganmoqda.',
    },
    stats: { diameter: '6,779 km', distance: '1.52 AU', moons: '2', temperature: '-125°C to 20°C' },
    funFact: { en: 'Olympus Mons on Mars is nearly 3 times the height of Mount Everest.', uz: 'Marsdagi Olimp tog\'i Everestdan deyarli 3 marta balandroq.' },
  },
  {
    id: 'jupiter', name: 'Jupiter', nameUz: 'Yupiter',
    radius: 3.5, orbitRadius: 52, speed: 1.31, tilt: 0.05,
    color: '#c88b3a', getTexture: makeJupiterTexture,
    info: {
      en: 'Largest planet in the Solar System. The Great Red Spot is a storm that has been raging for over 350 years. It has 95 known moons.',
      uz: 'Quyosh sistemasidagi eng katta sayyora. Katta Qizil Dog\' 350 yildan ortiq davom etayotgan bo\'rondir. 95 ta ma\'lum oyi bor.',
    },
    stats: { diameter: '139,820 km', distance: '5.20 AU', moons: '95', temperature: '-110°C' },
    funFact: { en: 'Jupiter\'s magnetic field is 20,000 times stronger than Earth\'s.', uz: 'Yupiterning magnit maydoni Yernikidan 20,000 marta kuchliroq.' },
  },
  {
    id: 'saturn', name: 'Saturn', nameUz: 'Saturn',
    radius: 3.0, orbitRadius: 72, speed: 0.97, tilt: 0.47,
    color: '#e8d5a0', getTexture: makeSaturnTexture,
    hasRings: true,
    info: {
      en: 'Famous for its spectacular ring system made of ice and rock. It is the least dense planet — it would float on water.',
      uz: 'Muz va toshdan iborat ajoyib halqa tizimi bilan mashhur. U eng kam zich sayyora — suvda suzib yurardi.',
    },
    stats: { diameter: '116,460 km', distance: '9.58 AU', moons: '146', temperature: '-140°C' },
    funFact: { en: 'Saturn\'s rings are only about 10 meters thick on average.', uz: 'Saturn halqalari o\'rtacha atigi 10 metr qalinlikka ega.' },
  },
  {
    id: 'uranus', name: 'Uranus', nameUz: 'Uran',
    radius: 2.2, orbitRadius: 92, speed: 0.68, tilt: 1.71,
    color: '#7de8e8', getTexture: makeUranusTexture,
    hasRings: true, ringTilted: true,
    info: {
      en: 'Ice giant rotating on its side with an axial tilt of 98°. It has faint rings and 27 known moons named after Shakespeare characters.',
      uz: 'Yonboshlab aylanuvchi muzli gigant, o\'q og\'ishi 98°. Zaif halqalari va Shekspir qahramonlari nomidagi 27 ta ma\'lum oyi bor.',
    },
    stats: { diameter: '50,724 km', distance: '19.2 AU', moons: '27', temperature: '-195°C' },
    funFact: { en: 'Uranus rotates on its side, likely due to a massive ancient collision.', uz: 'Uran yonboshlab aylanadi, ehtimol qadimgi ulkan to\'qnashuv tufayli.' },
  },
  {
    id: 'neptune', name: 'Neptune', nameUz: 'Neptun',
    radius: 2.1, orbitRadius: 115, speed: 0.54, tilt: 0.49,
    color: '#1a3a8a', getTexture: makeNeptuneTexture,
    info: {
      en: 'Farthest planet from the Sun with the strongest winds in the Solar System, reaching 2,100 km/h. It has 16 known moons.',
      uz: 'Quyoshdan eng uzoq sayyora, Quyosh sistemasidagi eng kuchli shamollar — 2100 km/soat. 16 ta ma\'lum oyi bor.',
    },
    stats: { diameter: '49,244 km', distance: '30.1 AU', moons: '16', temperature: '-200°C' },
    funFact: { en: 'Neptune was predicted mathematically before it was observed.', uz: 'Neptun kuzatilishidan oldin matematik jihatdan bashorat qilingan.' },
  },
]

const BLACK_HOLE_DATA = {
  id: 'blackhole', name: 'Black Hole', nameUz: 'Qora Tuynuk',
  info: {
    en: 'A region where gravity is so strong that nothing — not even light — can escape. The boundary is called the event horizon.',
    uz: 'Qora tuynuk — tortishish kuchi shunchalik kuchliki, hech narsa — hatto yorug\'lik ham — qochib qutula olmaydi. Chegara voqealar gorizonti deyiladi.',
  },
  stats: { diameter: 'Unknown', distance: '~200 AU', moons: 'N/A', temperature: 'Near absolute zero (outside)' },
  funFact: { en: 'Time passes slower near a black hole due to gravitational time dilation.', uz: 'Qora tuynuk yaqinida gravitatsion vaqt kengayishi tufayli vaqt sekinroq o\'tadi.' },
}

// ─── Sun Component ────────────────────────────────────────────────────────────
function Sun({ data, onClick, paused, speed }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const texture = useMemo(() => data.getTexture(), [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    if (!paused) meshRef.current.rotation.y += 0.002 * speed
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.04
      glowRef.current.scale.setScalar(s)
      glowRef.current.material.opacity = 0.15 + Math.sin(t * 2) * 0.05
    }
  })

  return (
    <group>
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(data) }}>
        <sphereGeometry args={[data.radius, 64, 64]} />
        <meshStandardMaterial map={texture} emissive={new THREE.Color(data.emissive)} emissiveIntensity={data.emissiveIntensity} />
      </mesh>
      {/* Corona glow layers */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[data.radius * 1.18, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[data.radius * 1.35, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <pointLight color="#fff5cc" intensity={3} distance={500} decay={1} />
      <pointLight color="#ff8800" intensity={1.5} distance={200} decay={2} />
    </group>
  )
}

// ─── Saturn Rings ─────────────────────────────────────────────────────────────
function SaturnRings({ radius, tilted }) {
  const ringTex = useMemo(() => makeSaturnRingTexture(), [])
  return (
    <mesh rotation={[tilted ? Math.PI / 2 + 0.3 : Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 1.3, radius * 2.2, 128]} />
      <meshBasicMaterial map={ringTex} side={THREE.DoubleSide} transparent opacity={0.85} />
    </mesh>
  )
}

// ─── Uranus Rings ─────────────────────────────────────────────────────────────
function UranusRings({ radius }) {
  return (
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <ringGeometry args={[radius * 1.4, radius * 1.9, 64]} />
      <meshBasicMaterial color="#88dddd" side={THREE.DoubleSide} transparent opacity={0.35} />
    </mesh>
  )
}

// ─── Moon (orbits Earth) ──────────────────────────────────────────────────────
function Moon({ earthPos, onClick, paused, speed }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const texture = useMemo(() => makeMoonTexture(), [])
  const angleRef = useRef(0)

  useFrame((_, delta) => {
    if (!paused) angleRef.current += delta * 1.2 * speed
    if (groupRef.current) {
      groupRef.current.position.x = earthPos.x + Math.cos(angleRef.current) * 3.5
      groupRef.current.position.z = earthPos.z + Math.sin(angleRef.current) * 3.5
      groupRef.current.position.y = earthPos.y
    }
    if (meshRef.current && !paused) meshRef.current.rotation.y += 0.01 * speed
  })

  const moonData = {
    id: 'moon', name: 'Moon', nameUz: 'Oy',
    info: {
      en: 'Earth\'s only natural satellite. It stabilizes Earth\'s axial tilt and drives ocean tides.',
      uz: 'Yerning yagona tabiiy yo\'ldoshi. U Yerning o\'q og\'ishini barqarorlashtiradi va okean to\'lqinlarini boshqaradi.',
    },
    stats: { diameter: '3,474 km', distance: '0.00257 AU', moons: '0', temperature: '-173°C to 127°C' },
    funFact: { en: 'The Moon is slowly drifting away from Earth at about 3.8 cm per year.', uz: 'Oy har yili taxminan 3.8 sm tezlikda Yerdan uzoqlashib bormoqda.' },
  }

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(moonData) }}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  )
}

// ─── Planet Component ─────────────────────────────────────────────────────────
function Planet({ data, onClick, paused, speed, onPositionUpdate }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const angleRef = useRef(Math.random() * Math.PI * 2)
  const texture = useMemo(() => data.getTexture(), [])

  useFrame((_, delta) => {
    if (!paused && data.orbitRadius > 0) {
      angleRef.current += (delta * data.speed * 0.05 * speed) / data.orbitRadius
    }
    if (groupRef.current && data.orbitRadius > 0) {
      groupRef.current.position.x = Math.cos(angleRef.current) * data.orbitRadius
      groupRef.current.position.z = Math.sin(angleRef.current) * data.orbitRadius
    }
    if (meshRef.current && !paused) meshRef.current.rotation.y += 0.01 * speed
    if (onPositionUpdate && groupRef.current) {
      onPositionUpdate(groupRef.current.position)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        rotation={[data.tilt || 0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClick(data) }}
      >
        <sphereGeometry args={[data.radius, 48, 48]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {data.hasRings && data.id === 'saturn' && <SaturnRings radius={data.radius} tilted={false} />}
      {data.hasRings && data.id === 'uranus' && <UranusRings radius={data.radius} />}
    </group>
  )
}

// ─── Orbit Ring ───────────────────────────────────────────────────────────────
function OrbitRing({ radius }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return pts
  }, [radius])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#334466" transparent opacity={0.3} />
    </line>
  )
}

// ─── Asteroid Belt ────────────────────────────────────────────────────────────
function AsteroidBelt() {
  const points = useMemo(() => {
    const rng = mulberry32(42)
    const positions = new Float32Array(1200 * 3)
    for (let i = 0; i < 1200; i++) {
      const angle = rng() * Math.PI * 2
      const r = 40 + rng() * 10
      const y = (rng() - 0.5) * 2
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(angle) * r
    }
    return positions
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(points, 3))
    return geo
  }, [points])

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#aaaaaa" size={0.15} sizeAttenuation transparent opacity={0.7} />
    </points>
  )
}

// ─── Background Stars ─────────────────────────────────────────────────────────
function BackgroundStars() {
  const { positions, colors } = useMemo(() => {
    const rng = mulberry32(99)
    const count = 15000
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const starColors = [
      [1, 1, 1], [0.8, 0.9, 1], [1, 1, 0.8], [1, 0.85, 0.7], [0.7, 0.8, 1],
    ]
    for (let i = 0; i < count; i++) {
      const theta = rng() * Math.PI * 2
      const phi = Math.acos(2 * rng() - 1)
      const r = 800 + rng() * 400
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      const c = starColors[Math.floor(rng() * starColors.length)]
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]
    }
    return { positions: pos, colors: col }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])

  return (
    <points geometry={geometry}>
      <pointsMaterial vertexColors size={0.6} sizeAttenuation transparent opacity={0.9} />
    </points>
  )
}

// ─── Milky Way Band ───────────────────────────────────────────────────────────
function MilkyWayBand() {
  const positions = useMemo(() => {
    const rng = mulberry32(77)
    const count = 4000
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2
      const spread = (rng() - 0.5) * 80
      const r = 700 + rng() * 200
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = spread
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    return pos
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#aabbff" size={0.8} sizeAttenuation transparent opacity={0.4} />
    </points>
  )
}

// ─── Nebula ───────────────────────────────────────────────────────────────────
function Nebula({ position, count, color1, color2, seed }) {
  const { positions, colors } = useMemo(() => {
    const rng = mulberry32(seed)
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c1 = new THREE.Color(color1)
    const c2 = new THREE.Color(color2)
    for (let i = 0; i < count; i++) {
      const r = rng() * 60
      const theta = rng() * Math.PI * 2
      const phi = Math.acos(2 * rng() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      const t = rng()
      col[i * 3] = c1.r * t + c2.r * (1 - t)
      col[i * 3 + 1] = c1.g * t + c2.g * (1 - t)
      col[i * 3 + 2] = c1.b * t + c2.b * (1 - t)
    }
    return { positions: pos, colors: col }
  }, [count, color1, color2, seed])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])

  return (
    <group position={position}>
      <points geometry={geometry}>
        <pointsMaterial vertexColors size={1.2} sizeAttenuation transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}

// ─── Black Hole ───────────────────────────────────────────────────────────────
function BlackHole({ onClick }) {
  const diskRef = useRef()
  const lensRef = useRef()

  useFrame((state, delta) => {
    if (diskRef.current) diskRef.current.rotation.z += delta * 1.5
    if (lensRef.current) {
      lensRef.current.material.opacity = 0.08 + Math.sin(state.clock.getElapsedTime() * 2) * 0.03
    }
  })

  return (
    <group position={[200, 0, -300]} onClick={(e) => { e.stopPropagation(); onClick(BLACK_HOLE_DATA) }}>
      {/* Event horizon */}
      <mesh>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Gravitational lensing layers */}
      <mesh ref={lensRef}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#220033" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#110022" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      {/* Accretion disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 6, 0, 0]}>
        <ringGeometry args={[9, 22, 128]} />
        <meshBasicMaterial color="#ff6600" side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[Math.PI / 6, 0, 0]}>
        <ringGeometry args={[22, 28, 128]} />
        <meshBasicMaterial color="#ff9900" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 6, 0, 0]}>
        <ringGeometry args={[28, 32, 128]} />
        <meshBasicMaterial color="#ffcc00" side={THREE.DoubleSide} transparent opacity={0.25} />
      </mesh>
      {/* Glow */}
      <pointLight color="#ff6600" intensity={2} distance={80} decay={2} />
    </group>
  )
}

// ─── Comet ────────────────────────────────────────────────────────────────────
function Comet({ paused, speed }) {
  const groupRef = useRef()
  const tailRef = useRef()
  const tRef = useRef(0)

  const tailPositions = useMemo(() => new Float32Array(60 * 3), [])
  const tailGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3))
    return geo
  }, [tailPositions])

  useFrame((_, delta) => {
    if (!paused) tRef.current += delta * 0.08 * speed
    const t = tRef.current
    const a = 180, b = 80
    const x = a * Math.cos(t)
    const z = b * Math.sin(t) - 100
    const y = Math.sin(t * 2) * 15

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z)
    }

    // Update tail
    const dx = -Math.sin(t) * a, dz = Math.cos(t) * b
    const len = Math.sqrt(dx * dx + dz * dz)
    const nx = dx / len, nz = dz / len
    for (let i = 0; i < 60; i++) {
      const f = i / 60
      tailPositions[i * 3] = x + nx * f * 25
      tailPositions[i * 3 + 1] = y
      tailPositions[i * 3 + 2] = z + nz * f * 25
    }
    if (tailRef.current) {
      tailRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <pointLight color="#aaddff" intensity={0.5} distance={20} decay={2} />
      </group>
      <points ref={tailRef} geometry={tailGeo}>
        <pointsMaterial color="#aaddff" size={0.4} sizeAttenuation transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </>
  )
}

// ─── Distant Galaxy Sprite ────────────────────────────────────────────────────
function GalaxySprite({ position, color, size }) {
  const tex = useMemo(() => makeTex((ctx, s) => {
    const rng = mulberry32(position[0] * 100 | 0)
    const cx = s / 2, cy = s / 2
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s / 2)
    g.addColorStop(0, color)
    g.addColorStop(0.3, color.replace('1)', '0.5)'))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s)
    // spiral arms
    for (let arm = 0; arm < 3; arm++) {
      const startAngle = (arm / 3) * Math.PI * 2
      ctx.beginPath()
      for (let i = 0; i < 60; i++) {
        const r = (i / 60) * s * 0.45
        const a = startAngle + (i / 60) * Math.PI * 3
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.strokeStyle = color.replace('1)', '0.4)')
      ctx.lineWidth = 3; ctx.stroke()
    }
    // stars
    for (let i = 0; i < 80; i++) {
      const r = rng() * s * 0.45
      const a = rng() * Math.PI * 2
      ctx.beginPath()
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, rng() * 1.5 + 0.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${0.3 + rng() * 0.5})`; ctx.fill()
    }
  }, 128), [])

  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </Billboard>
  )
}

// ─── Info Panel ───────────────────────────────────────────────────────────────
function InfoPanel({ selected, lang, onClose, onLangToggle }) {
  if (!selected) return null

  const name = lang === 'uz' ? (selected.nameUz || selected.name) : selected.name
  const info = selected.info?.[lang] || ''
  const stats = selected.stats || {}
  const funFact = selected.funFact?.[lang] || ''

  return (
    <AnimatePresence>
      <motion.div
        key={selected.id}
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ 
          position: 'fixed', 
          right: '12px', 
          top: '64px',
          width: '260px',
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
          zIndex: 50,
          pointerEvents: 'auto'
        }}
      >
        <div
          className="rounded-2xl p-5 text-white"
          style={{
            background: 'rgba(10, 15, 40, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(100, 120, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold" style={{ textShadow: '0 0 20px rgba(100,150,255,0.8)' }}>
              {name}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={onLangToggle}
                className="text-xs px-2 py-1 rounded-lg font-mono transition-all"
                style={{
                  background: 'rgba(80,100,255,0.25)',
                  border: '1px solid rgba(80,100,255,0.4)',
                  color: '#aabbff',
                }}
              >
                {lang === 'uz' ? "English" : "O'zbek"}
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Info text */}
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#c0cce8' }}>
            {info}
          </p>

          {/* Stats table */}
          <div
            className="rounded-xl p-3 mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6688cc' }}>
              {lang === 'en' ? 'Statistics' : 'Statistika'}
            </h3>
            <div className="space-y-2">
              {Object.entries(stats).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs capitalize" style={{ color: '#7788aa' }}>
                    {lang === 'en' ? key : {
                      diameter: 'Diametr', distance: 'Masofa', moons: 'Oylar', temperature: 'Harorat'
                    }[key] || key}
                  </span>
                  <span className="text-xs font-mono" style={{ color: '#aaccff' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fun fact */}
          {funFact && (
            <div
              className="rounded-xl p-3"
              style={{
                background: 'linear-gradient(135deg, rgba(80,50,150,0.3), rgba(30,60,120,0.3))',
                border: '1px solid rgba(100,80,200,0.3)',
              }}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">✨</span>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#aa88ff' }}>
                    {lang === 'en' ? 'Fun Fact' : 'Qiziqarli fakt'}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#c0b8e8' }}>{funFact}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────
function Sidebar({ lang, onSelect, selected, visible, onToggle }) {
  const allObjects = [
    ...PLANET_DATA,
    { id: 'moon', name: 'Moon', nameUz: 'Oy' },
    { ...BLACK_HOLE_DATA },
    { id: 'nebula1', name: 'Orion Nebula', nameUz: 'Orion Tumanligi' },
    { id: 'nebula2', name: 'Blue Nebula', nameUz: 'Ko\'k Tumanlik' },
    { id: 'comet', name: 'Comet', nameUz: 'Kometa' },
  ]

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-20 z-50 flex items-center justify-center transition-all"
        style={{
          left: visible ? '220px' : '8px',
          width: '28px',
          height: '48px',
          borderRadius: visible ? '0 8px 8px 0' : '8px',
          background: 'rgba(20,30,80,0.85)',
          border: '1px solid rgba(80,100,255,0.3)',
          backdropFilter: 'blur(10px)',
          color: '#aabbff',
          fontSize: '12px',
          transition: 'left 0.3s ease',
        }}
      >
        {visible ? '◀' : '▶'}
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed z-40 pointer-events-auto"
            style={{ 
              left: '8px', 
              top: '72px',
              width: '200px',
              maxHeight: 'calc(100vh - 100px)', 
              overflowY: 'auto' 
            }}
          >
            <div
              className="rounded-2xl p-3"
              style={{
                background: 'rgba(8, 12, 35, 0.88)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(80,100,255,0.25)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: '#6688cc' }}>
                {lang === 'en' ? 'Objects' : 'Ob\'yektlar'}
              </h3>
              <div className="space-y-1">
                {allObjects.map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => onSelect(obj)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: selected?.id === obj.id ? 'rgba(80,100,255,0.25)' : 'transparent',
                      border: selected?.id === obj.id ? '1px solid rgba(80,100,255,0.4)' : '1px solid transparent',
                      color: selected?.id === obj.id ? '#aabbff' : '#8899bb',
                    }}
                  >
                    {lang === 'en' ? obj.name : (obj.nameUz || obj.name)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ paused, speed, onSelect, lang }) {
  const earthPosRef = useRef(new THREE.Vector3())
  const { camera } = useThree()
  const [cameraDistance, setCameraDistance] = useState(80)

  useFrame(() => {
    const d = camera.position.length()
    setCameraDistance(d)
  })

  const deepSpaceVisible = cameraDistance > 150

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[50, 50, 50]} intensity={0.5} />
      <BackgroundStars />
      <MilkyWayBand />

      {/* Orbit rings */}
      {PLANET_DATA.filter(p => p.orbitRadius > 0).map(p => (
        <OrbitRing key={p.id + '_orbit'} radius={p.orbitRadius} />
      ))}

      {/* Sun */}
      <Sun data={PLANET_DATA[0]} onClick={onSelect} paused={paused} speed={speed} />

      {/* Planets */}
      {PLANET_DATA.slice(1).map(p => (
        <Planet
          key={p.id}
          data={p}
          onClick={onSelect}
          paused={paused}
          speed={speed}
          onPositionUpdate={p.id === 'earth' ? (pos) => { earthPosRef.current.copy(pos) } : undefined}
        />
      ))}

      {/* Moon */}
      <Moon earthPos={earthPosRef.current} onClick={onSelect} paused={paused} speed={speed} />

      {/* Asteroid belt */}
      <AsteroidBelt />

      {/* Comet */}
      <Comet paused={paused} speed={speed} />

      {/* Deep space objects — fade in when zoomed out */}
      {deepSpaceVisible && (
        <>
          <BlackHole onClick={onSelect} />
          <Nebula position={[-400, 100, -500]} count={5000} color1="#ff69b4" color2="#9b59b6" seed={111} />
          <Nebula position={[500, -50, -400]} count={4000} color1="#00bfff" color2="#00ced1" seed={222} />
          <GalaxySprite position={[1200, 200, -800]} color="rgba(255,200,150,1)" size={80} />
          <GalaxySprite position={[-1100, -100, -900]} color="rgba(150,200,255,1)" size={60} />
          <GalaxySprite position={[900, 300, -1200]} color="rgba(200,150,255,1)" size={70} />
          <GalaxySprite position={[-800, 150, 1000]} color="rgba(255,220,180,1)" size={55} />
        </>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SolarSystemPage() {
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [selected, setSelected] = useState(null)
  const [lang, setLang] = useState('en')
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const handleSelect = useCallback((obj) => {
    setSelected(obj)
  }, [])

  const handleClose = useCallback(() => setSelected(null), [])
  const handleLangToggle = useCallback(() => setLang(l => l === 'en' ? 'uz' : 'en'), [])

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 pointer-events-auto"
        style={{
          background: 'rgba(5, 8, 25, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(80,100,255,0.2)',
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: '#7788bb' }}
            onMouseEnter={e => e.currentTarget.style.color = '#aabbff'}
            onMouseLeave={e => e.currentTarget.style.color = '#7788bb'}
          >
            <span>←</span>
            <span>{lang === 'en' ? 'Back' : 'Orqaga'}</span>
          </Link>
          <div className="w-px h-5" style={{ background: 'rgba(80,100,255,0.3)' }} />
          <h1 className="text-base font-semibold" style={{ color: '#c0d0ff' }}>
            {lang === 'en' ? '🌌 Solar System Explorer' : '🌌 Quyosh Sistemasi'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={handleLangToggle}
            className="text-xs px-3 py-1.5 rounded-lg font-mono transition-all"
            style={{
              background: 'rgba(80,100,255,0.2)',
              border: '1px solid rgba(80,100,255,0.35)',
              color: '#aabbff',
            }}
          >
            {lang === 'uz' ? "English" : "O'zbek"}
          </button>

          {/* Speed slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#6677aa' }}>
              {lang === 'en' ? 'Speed' : 'Tezlik'}
            </span>
            <input
              type="range"
              min="0.1"
              max="8"
              step="0.1"
              value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))}
              className="w-24 accent-indigo-400"
              style={{ cursor: 'pointer' }}
            />
            <span className="text-xs font-mono w-8" style={{ color: '#aabbff' }}>{speed.toFixed(1)}x</span>
          </div>

          {/* Pause/Play */}
          <button
            onClick={() => setPaused(p => !p)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: paused ? 'rgba(80,200,100,0.2)' : 'rgba(255,100,80,0.2)',
              border: `1px solid ${paused ? 'rgba(80,200,100,0.4)' : 'rgba(255,100,80,0.4)'}`,
              color: paused ? '#80ee90' : '#ff9988',
            }}
          >
            {paused ? (lang === 'en' ? '▶ Play' : '▶ Ijro') : (lang === 'en' ? '⏸ Pause' : '⏸ To\'xtat')}
          </button>
        </div>
      </div>

      {/* Hint */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 text-xs px-4 py-2 rounded-full pointer-events-none"
        style={{
          background: 'rgba(10,15,40,0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(80,100,255,0.2)',
          color: '#6677aa',
        }}
      >
        {lang === 'en'
          ? '🖱 Drag to rotate · Scroll to zoom · Click objects for info · Zoom out to see deep space'
          : '🖱 Aylantirish · Kattalashtirish · Ob\'yektlarni bosing · Uzoqroq ko\'rish uchun kichraytiring'}
      </div>

      {/* Sidebar */}
      <Sidebar
        lang={lang}
        onSelect={handleSelect}
        selected={selected}
        visible={sidebarVisible}
        onToggle={() => setSidebarVisible(v => !v)}
      />

      {/* Info panel */}
      <InfoPanel
        selected={selected}
        lang={lang}
        onClose={handleClose}
        onLangToggle={handleLangToggle}
      />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 35, 80], fov: 60, near: 0.1, far: 5000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#000005' }}
        onPointerMissed={() => setSelected(null)}
      >
        <Suspense fallback={null}>
          <Scene paused={paused} speed={speed} onSelect={handleSelect} lang={lang} />
          <OrbitControls
            minDistance={3}
            maxDistance={2000}
            enablePan
            enableZoom
            enableRotate
            zoomSpeed={1.2}
            rotateSpeed={0.6}
            panSpeed={0.8}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
