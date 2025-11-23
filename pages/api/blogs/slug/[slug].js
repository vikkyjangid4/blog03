// API proxy for blog by slug
import axios from 'axios'

// Unified environment-based backend URL
const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(req, res) {
  const { slug } = req.query

  // Only GET requests allowed
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  if (!slug) {
    return res.status(400).json({
      success: false,
      error: 'Slug parameter is required'
    })
  }

  try {
    // Forward cookies from client
    const cookies = req.headers.cookie || ''

    const headers = {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }

    // Backend URL
    const url = `${BACKEND_URL}/api/blogs/slug/${encodeURIComponent(slug)}`

    // Forward request to backend
    const backendResponse = await axios({
      method: 'GET',
      url,
      headers,
      withCredentials: true,
      validateStatus: () => true
    })

    // Forward Set-Cookie headers
    Object.keys(backendResponse.headers).forEach((key) => {
      if (key.toLowerCase() === 'set-cookie') {
        res.setHeader(key, backendResponse.headers[key])
      }
    })

    // Return backend response
    res.status(backendResponse.status).json(backendResponse.data)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal proxy error',
      message: error.message
    })
  }
}
