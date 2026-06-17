import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting map. 
// Note: In a distributed edge environment (like Vercel), this only limits per-isolate.
// For robust global rate limiting, use Redis (e.g., @upstash/ratelimit).
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP

export function proxy(request: NextRequest) {
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // 1. Rate Limiting Logic (only applied to /api/* routes)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    
    // Clean up old entries periodically to prevent memory leaks
    if (Math.random() < 0.01) {
      rateLimitMap.forEach((data, key) => {
        if (data.timestamp < windowStart) rateLimitMap.delete(key);
      });
    }

    const currentData = rateLimitMap.get(ip);
    
    if (currentData && currentData.timestamp > windowStart) {
      if (currentData.count >= MAX_REQUESTS_PER_WINDOW) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      currentData.count += 1;
      rateLimitMap.set(ip, currentData);
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }
  }

  // 2. Simple CSRF Defense using Origin / Referer check
  // Protects state-changing endpoints from external forms / cross-site requests
  const method = request.method.toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // If an Origin or Referer is present, it must match our host.
    // Allow if neither is present (e.g. direct API curl, though we could block that too if we wanted strict CSRF).
    if (origin && host) {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden', message: 'CSRF token mismatch or invalid Origin.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else if (referer && host) {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden', message: 'CSRF token mismatch or invalid Referer.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Apply middleware only to API routes
    '/api/:path*',
  ],
};
