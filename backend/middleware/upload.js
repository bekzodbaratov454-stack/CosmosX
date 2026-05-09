const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Memory storage — Cloudinary ga yuboramiz
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg|mp4|webm|ogg|mov/
  const ext = path.extname(file.originalname).toLowerCase().slice(1)
  if (allowed.test(ext)) cb(null, true)
  else cb(new Error('Only images and videos allowed'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})

module.exports = upload
