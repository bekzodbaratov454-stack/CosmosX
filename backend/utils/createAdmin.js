// Yangi admin yaratish skripti
// Ishlatish: node utils/createAdmin.js

require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmos_mystery'

async function createAdmin() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ MongoDB ulandi')

  const User = require('../models/User')

  // Eski adminni o'chirish — username va email bo'yicha
  await User.deleteMany({ $or: [{ username: 'admin' }, { email: 'admin@cosmos.uz' }] })
  console.log('Eski admin o\'chirildi')

  // Yangi admin yaratish
  const admin = await User.create({
    username: 'admin',
    email: 'admin@cosmos.uz',
    password: 'Admin123!',
    role: 'admin',
    isActive: true
  })

  console.log('✅ Yangi admin yaratildi!')
  console.log('📧 Email:   admin@cosmos.uz')
  console.log('🔑 Parol:   Admin123!')
  console.log('👤 Username: admin')

  await mongoose.disconnect()
  process.exit(0)
}

createAdmin().catch(err => {
  console.error('❌ Xatolik:', err.message)
  process.exit(1)
})
