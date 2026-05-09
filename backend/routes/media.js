const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const Media = require('../models/Media')
const { protect, adminOnly } = require('../middleware/auth')
const cloudinary = require('../utils/cloudinary')
const path = require('path')
const fs = require('fs')

// Upload to Cloudinary (production) or local (development)
async function uploadFile(file) {
  const isVideo = /mp4|webm|ogg|mov/.test(
    path.extname(file.originalname).toLowerCase().slice(1)
  )

  // Cloudinary mavjud bo'lsa — u yerga yuklash
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: isVideo ? 'video' : 'image',
          folder: 'cosmosX',
          transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve({
            url: result.secure_url,
            publicId: result.public_id,
            type: isVideo ? 'video' : 'image',
            size: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
          })
        }
      )
      uploadStream.end(file.buffer)
    })
  }

  // Local storage (development)
  const uploadDir = path.join(__dirname, '../uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`
  const filePath = path.join(uploadDir, filename)
  fs.writeFileSync(filePath, file.buffer)
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    type: isVideo ? 'video' : 'image',
    size: file.size,
    format: path.extname(file.originalname).slice(1),
  }
}

// Upload media
router.post('/upload', protect, adminOnly, upload.array('files', 20), async (req, res) => {
  try {
    const mediaItems = []
    for (const file of req.files) {
      const uploaded = await uploadFile(file)
      const mediaItem = await Media.create({
        filename: uploaded.publicId,
        originalName: file.originalname,
        url: uploaded.url,
        publicId: uploaded.publicId,
        type: uploaded.type,
        size: uploaded.size,
        format: uploaded.format,
        width: uploaded.width,
        height: uploaded.height,
        uploadedBy: req.user._id
      })
      mediaItems.push(mediaItem)
    }
    res.status(201).json({ success: true, media: mediaItems })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Get all media
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 30, type } = req.query
    const query = type ? { type } : {}
    const total = await Media.countDocuments(query)
    const media = await Media.find(query)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    res.json({ success: true, media, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Delete media
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' })

    // Cloudinary dan o'chirish
    if (media.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.type === 'video' ? 'video' : 'image'
        })
      } catch (e) { console.log('Cloudinary delete error:', e.message) }
    }

    // Local dan o'chirish
    if (!process.env.CLOUDINARY_CLOUD_NAME && media.filename) {
      const filePath = path.join(__dirname, '../uploads', media.filename)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await Media.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Media deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
