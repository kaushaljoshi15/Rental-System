import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

// Core check route
app.get('/hello', (c) => {
  return c.json({
    status: "success",
    message: "Hello from Hono Edge API Router!",
    timestamp: new Date().toISOString()
  })
})

// Sample halls search endpoint to demonstrate path matching
app.get('/halls/search', (c) => {
  const query = c.req.query('q') || ''
  return c.json({
    status: "success",
    query: query,
    results: []
  })
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
export const OPTIONS = handle(app)
