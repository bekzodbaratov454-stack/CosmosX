import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiPlay } from 'react-icons/fi'

export default function HeroSection() {
  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
          }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Floating planets */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-10 md:right-32 text-7xl md:text-9xl opacity-20 pointer-events-none select-none"
      >
        🪐
      </motion.div>
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-32 left-10 md:left-32 text-5xl md:text-7xl opacity-15 pointer-events-none select-none"
      >
        🌍
      </motion.div>
      <motion.div
        animate={{ y: [-5, 15, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-40 left-20 text-4xl opacity-10 pointer-events-none select-none"
      >
        ✨
      </motion.div>

      {/* Content */}
      <div className="relative text-center px-4 sm:px-6 max-w-5xl mx-auto pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-cosmos-400 animate-pulse" />
          Koinot va Yer sirlari — bir joyda
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 font-space"
        >
          <span className="gradient-text">Koinot</span>
          <br />
          <span className="text-white">Sirlari</span>
          <span className="gradient-text"> Ochiladi</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Galaktikalardan okean tubigacha, qora tuynuklardan yo'qolgan shaharlargacha —
          koinot va Yerning eng sirli va qiziqarli ma'lumotlari bu yerda.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/explore" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4 w-full sm:w-auto">
            Kashfiyotni boshlash <FiArrowRight />
          </Link>
          <Link to="/category/koinot-yangiliklari" className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-4 w-full sm:w-auto">
            <FiPlay /> Koinot yangiliklari
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-cosmos-950/50"
        >
          {[
            { value: '12+', label: 'Kategoriya' },
            { value: '∞', label: 'Sirlar' },
            { value: '🌌', label: 'Koinot' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold gradient-text font-space">{stat.value}</div>
              <div className="text-xs text-slate-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
      >
        <span className="text-xs">Pastga aylantiring</span>
        <div className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 rounded-full bg-cosmos-500"
          />
        </div>
      </motion.div>
    </section>
  )
}
