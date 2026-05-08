import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-9xl mb-6"
        >
          🌌
        </motion.div>
        <h1 className="text-6xl font-bold gradient-text font-space mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Sahifa topilmadi</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Bu sahifa koinotning qorong'u burchagida yo'qolgan. Bosh sahifaga qaytaylik.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base">
          🚀 Bosh sahifaga qaytish
        </Link>
      </motion.div>
    </div>
  )
}
