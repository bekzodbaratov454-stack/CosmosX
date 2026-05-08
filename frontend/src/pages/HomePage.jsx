import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiArrowRight, FiZap, FiStar, FiTrendingUp } from 'react-icons/fi'
import api from '../lib/api'
import PostCard from '../components/PostCard'
import CategoryCard from '../components/CategoryCard'
import DailyFact from '../components/DailyFact'
import HeroSection from '../components/HeroSection'

export default function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [latestPosts, setLatestPosts] = useState([])
  const [trendingPosts, setTrendingPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes, trendingRes, catRes] = await Promise.all([
          api.get('/posts/featured'),
          api.get('/posts?limit=8'),
          api.get('/posts/trending'),
          api.get('/categories'),
        ])
        setFeaturedPosts(featuredRes.data.posts)
        setLatestPosts(latestRes.data.posts)
        setTrendingPosts(trendingRes.data.posts.slice(0, 5))
        setCategories(catRes.data.categories)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <Helmet>
        <title>CosmosX — Koinot va Yer Sirlari</title>
        <meta name="description" content="Koinot va Yer sirlari haqida eng qiziqarli ma'lumotlar" />
      </Helmet>

      {/* Hero */}
      <HeroSection />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20">

        {/* 3D Solar System Banner */}
        <section className="mb-16">
          <Link to="/solar-system">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative overflow-hidden rounded-2xl p-6 sm:p-8 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 50%, rgba(6,182,212,0.1) 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              {/* Floating planets — faqat katta ekranda */}
              <div className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 items-center gap-3 pointer-events-none select-none">
                <motion.span animate={{ y: [-5,5,-5] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl opacity-50">🪐</motion.span>
                <motion.span animate={{ y: [5,-5,5] }} transition={{ duration: 4, repeat: Infinity }} className="text-3xl opacity-50">🌍</motion.span>
                <motion.span animate={{ y: [-3,3,-3] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-2xl opacity-40">☄️</motion.span>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                    ✨ Yangi
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">🪐 3D Quyosh Sistemasi</h2>
                <p className="text-slate-400 text-sm mb-4">Interaktiv 3D simulyatorda sayyoralarni kashf eting</p>
                <div className="btn-primary inline-flex items-center gap-2 text-sm">
                  Ochish →
                </div>
              </div>
            </motion.div>
          </Link>
        </section>

        {/* Daily Fact */}
        <DailyFact />

        {/* Categories */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiZap className="text-cosmos-400" /> Kategoriyalar
              </h2>
              <p className="text-slate-500 text-sm mt-1">Qiziqtirgan mavzuni tanlang</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat, i) => (
              <CategoryCard key={cat._id} category={cat} index={i} />
            ))}
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiStar className="text-yellow-400" /> Tanlangan Postlar
                </h2>
                <p className="text-slate-500 text-sm mt-1">Eng qiziqarli maqolalar</p>
              </div>
              <Link to="/explore?featured=true" className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                Barchasi <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.slice(0, 6).map((post, i) => (
                <PostCard key={post._id} post={post} index={i} featured={i === 0} />
              ))}
            </div>
          </section>
        )}

        {/* Latest + Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">🆕 So'nggi Postlar</h2>
              <Link to="/explore" className="text-sm text-cosmos-400 hover:text-cosmos-300 flex items-center gap-1">
                Barchasi <FiArrowRight />
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="skeleton h-64 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestPosts.map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Trending sidebar */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-cosmos-400" /> Trend
            </h2>
            <div className="space-y-3">
              {trendingPosts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/post/${post.slug}`}
                    className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/5 group">
                    <span className="text-3xl font-bold text-cosmos-800 font-mono flex-shrink-0 leading-none mt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors line-clamp-2">
                        {post.title?.uz}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                        <span>{post.category?.icon}</span>
                        <span>{post.views?.toLocaleString()} ko'rishlar</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Space types section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">🌌 Koinot Dunyosi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🕳️', title: 'Qora Tuynuklar', desc: 'Koinotning eng sirli va qo\'rqinchli joylari', to: '/category/qora-tuynuklar', color: '#1e1b4b' },
              { icon: '🪐', title: 'Sayyoralar', desc: 'Quyosh sistemasi va uning ajoyib sayyoralari', to: '/category/sayyoralar', color: '#4f46e5' },
              { icon: '🌊', title: 'Okean Sirlari', desc: 'Dengiz tubidagi hali o\'rganilmagan dunyolar', to: '/category/okean', color: '#0284c7' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link to={item.to}
                  className="block p-8 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2 group"
                  style={{
                    background: `radial-gradient(ellipse at top, ${item.color}30 0%, rgba(15,23,42,0.8) 70%)`,
                    border: `1px solid ${item.color}40`,
                  }}>
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
