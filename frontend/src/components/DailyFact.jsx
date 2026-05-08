import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import api from '../lib/api'

export default function DailyFact() {
  const [fact, setFact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchFact = async (random = false) => {
    try {
      setRefreshing(true)
      const { data } = await api.get(random ? '/facts/random' : '/facts/daily')
      setFact(data.fact)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchFact() }, [])

  if (loading) return (
    <div className="skeleton h-32 rounded-2xl mb-12" />
  )

  if (!fact) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12 p-6 rounded-2xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
      }}
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />

      <div className="relative flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">💡</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-cosmos-400 uppercase tracking-wider">Kunlik Fakt</span>
            {fact.category && (
              <span className="text-xs text-slate-600">• {fact.category.icon} {fact.category.name?.uz}</span>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={fact._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-lg font-bold text-white mb-1">{fact.title?.uz}</h3>
              {fact.excerpt?.uz && (
                <p className="text-sm text-slate-400 line-clamp-2">{fact.excerpt.uz}</p>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-3 mt-3">
            <Link to={`/post/${fact.slug}`}
              className="text-sm text-cosmos-400 hover:text-cosmos-300 flex items-center gap-1 transition-colors">
              Batafsil <FiArrowRight />
            </Link>
            <button
              onClick={() => fetchFact(true)}
              disabled={refreshing}
              className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              Yangi fakt
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
