const User = require('../models/User');
const Category = require('../models/Category');

const defaultCategories = [
  { name: { uz: 'Koinot Yangiliklari', en: 'Space News' }, icon: '🚀', color: '#6366f1', slug: 'koinot-yangiliklari', order: 1 },
  { name: { uz: 'Sayyoralar', en: 'Planets' }, icon: '🪐', color: '#8b5cf6', slug: 'sayyoralar', order: 2 },
  { name: { uz: 'Qora Tuynuklar', en: 'Black Holes' }, icon: '🕳️', color: '#1e1b4b', slug: 'qora-tuynuklar', order: 3 },
  { name: { uz: 'Galaktikalar', en: 'Galaxies' }, icon: '🌌', color: '#4f46e5', slug: 'galaktikalar', order: 4 },
  { name: { uz: 'NASA', en: 'NASA Data' }, icon: '🛸', color: '#0ea5e9', slug: 'nasa', order: 5 },
  { name: { uz: 'Yer Sirlari', en: 'Earth Mysteries' }, icon: '🌍', color: '#059669', slug: 'yer-sirlari', order: 6 },
  { name: { uz: 'Bermuda', en: 'Bermuda Triangle' }, icon: '🔺', color: '#dc2626', slug: 'bermuda', order: 7 },
  { name: { uz: 'Qadimiy Sivilizatsiyalar', en: 'Ancient Civilizations' }, icon: '🏛️', color: '#d97706', slug: 'qadimiy', order: 8 },
  { name: { uz: 'Okean Sirlari', en: 'Ocean Mysteries' }, icon: '🌊', color: '#0284c7', slug: 'okean', order: 9 },
  { name: { uz: 'Piramidalar', en: 'Pyramids' }, icon: '🏺', color: '#ca8a04', slug: 'piramidalar', order: 10 },
  { name: { uz: 'Yoqolgan Shaharlar', en: 'Lost Cities' }, icon: '🏚️', color: '#7c3aed', slug: 'yoqolgan-shaharlar', order: 11 },
  { name: { uz: 'Qiziqarli Faktlar', en: 'Interesting Facts' }, icon: '💡', color: '#f59e0b', slug: 'faktlar', order: 12 }
];

module.exports = async function seedAdmin() {
  try {
    // Create admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@cosmos.uz',
        password: process.env.ADMIN_PASSWORD || 'Admin123!',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created:', process.env.ADMIN_EMAIL || 'admin@cosmos.uz');
    }

    // Create default categories
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
      }
    }
    console.log('✅ Default categories seeded');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};
