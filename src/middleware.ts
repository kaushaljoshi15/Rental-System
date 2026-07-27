import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Enterprise Scraper & Anti-Cloning Middleware
 * 
 * Rejects automated site-cloning tools, offline browsers, and scraping bots.
 * Allows standard web browsers and verified search engine crawlers.
 */
const BLOCKED_USER_AGENTS = [
  'httrack',
  'wget',
  'scooter',
  'ia_archiver',
  'teleport',
  'sitegrabber',
  'webcopy',
  'websitecopier',
  'offline explorer',
  'offline navigator',
  'grabnet',
  'superbot',
  'eirgrabber',
]

const ALLOWED_BOTS = [
  'googlebot',
  'bingbot',
  'duckduckbot',
  'slurp',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
]

export function middleware(request: NextRequest) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase()

  // 1. Check if user-agent is a known search engine crawler
  const isAllowedBot = ALLOWED_BOTS.some((bot) => userAgent.includes(bot))

  if (!isAllowedBot && userAgent) {
    // 2. Check if user-agent matches blocked cloning tools
    const isBlocked = BLOCKED_USER_AGENTS.some((blocked) => userAgent.includes(blocked))

    if (isBlocked) {
      return new NextResponse(
        JSON.stringify({
          error: 'Access Denied',
          message: 'Automated site scraping and cloning is strictly prohibited.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      )
    }
  }

  const response = NextResponse.next()

  // Enforce security headers on response
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'self';")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg (favicon files)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
}
