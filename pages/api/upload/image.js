import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false,
  },
}

const BACKEND_URL = process.env.BACKEND_URL || 'https://boganto.com'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB max
    })

    const [fields, files] = await form.parse(req)
    
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image
    
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file uploaded' })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' })
    }

    // Forward the image to the backend server
    const formData = new FormData()
    formData.append('image', fs.createReadStream(imageFile.filepath), {
      filename: imageFile.originalFilename,
      contentType: imageFile.mimetype
    })

    // Forward cookies from the request for authentication
    const cookies = req.headers.cookie || ''

    const backendResponse = await axios.post(
      `${BACKEND_URL}/api/upload/editor-image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Cookie': cookies
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    )

    // Clean up temporary file
    fs.unlinkSync(imageFile.filepath)

    return res.status(200).json({
      success: true,
      url: backendResponse.data.url,
      filename: backendResponse.data.filename,
      size: imageFile.size,
      mimetype: imageFile.mimetype
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return res.status(500).json({ 
      error: 'Failed to upload image',
      message: error.response?.data?.error || error.message 
    })
  }
}
