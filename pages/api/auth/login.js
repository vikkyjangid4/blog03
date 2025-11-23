// API proxy for authentication with proper cookie forwarding
import axios from 'axios'

// Unified environment-based backend URL
const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(req, res) {
  try {
    // Forward cookies from the request
    const cookies = req.headers.cookie || ''
    
    // Backend request headers
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Cookie': cookies
    }
    
    // Forward the request to the backend
    const backendResponse = await axios({
      method: req.method,
      url: `${BACKEND_URL}/api/auth/login`,
      headers,
      data: req.body,
      withCredentials: true,
      validateStatus: () => true // Do not throw HTTP errors
    })
    
    // Forward Set-Cookie headers from backend
    Object.keys(backendResponse.headers).forEach(key => {
      if (key.toLowerCase() === 'set-cookie') {
        res.setHeader(key, backendResponse.headers[key])
      }
    })
    
    // Send response back to client
    res.status(backendResponse.status).json(backendResponse.data)
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal proxy error',
      message: error.message 
    })
  }
}

