import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CategoryCard({ category, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/category/${category.slug}`}
        className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 group"
        style={{
          background: `${category.color}10`,
          border: `1px solid ${category.color}25`,
        }}
      >
        <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
          {category.icon}
        </span>
        <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors leading-tight">
          {category.name?.uz}
        </span>
        {category.postCount > 0 && (
          <span className="text-xs text-slate-600">{category.postCount} post</span>
        )}
      </Link>
    </motion.div>
  )
}
