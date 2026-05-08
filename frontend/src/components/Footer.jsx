import { Link } from 'react-router-dom'
import { FiZap, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-cosmos-950/50"
      style={{ background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <FiZap className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold gradient-text font-space">CosmosX</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Koinot va Yer sirlari haqida eng qiziqarli va sirli ma'lumotlarni bir joyda topasiz.
              Galaktikalardan okean tubigacha — hamma narsa bu yerda.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg text-slate-500 hover:text-cosmos-400 hover:bg-cosmos-600/10 transition-all">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Kategoriyalar</h4>
            <ul className="space-y-2">
              {[
                ['Koinot Yangiliklari', '/category/koinot-yangiliklari'],
                ['Sayyoralar', '/category/sayyoralar'],
                ['Qora Tuynuklar', '/category/qora-tuynuklar'],
                ['Yer Sirlari', '/category/yer-sirlari'],
                ['Okean Sirlari', '/category/okean'],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-500 hover:text-cosmos-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Sayt</h4>
            <ul className="space-y-2">
              {[
                ['Bosh sahifa', '/'],
                ['Kashfiyot', '/explore'],
                ['Kirish', '/login'],
                ["Ro'yxatdan o'tish", '/register'],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-500 hover:text-cosmos-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cosmos-950/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2024 CosmosX. Barcha huquqlar himoyalangan.
          </p>
          <p className="text-xs text-slate-600">
            🌌 Koinot cheksiz, bilim ham cheksiz
          </p>
        </div>
      </div>
    </footer>
  )
}
