import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone on local Wi-Fi to access dev server without Next.js blocking it
  allowedDevOrigins: ['192.168.68.60', 'http://192.168.68.60'],
  
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            // A permissive but secure CSP for a modern app. Allows external images, fonts, scripts, and local Supabase API.
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://image.pollinations.ai https://images.unsplash.com https://loremflickr.com https://picsum.photos; connect-src 'self' http://localhost:54421 http://127.0.0.1:54421 https://api.stripe.com wss: https:; frame-src 'self' https://js.stripe.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
