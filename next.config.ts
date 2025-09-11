import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de seguridad robusta
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Protección XSS
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Prevenir MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Protección contra clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Content Security Policy estricto
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self'",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Headers específicos para API
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
  
  // Configuración de seguridad adicional
  serverExternalPackages: ["bcryptjs"],
  
  // Configuración de compilación segura
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Configuración para mejorar compatibilidad con Framer Motion
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  
  // Configuración de seguridad de imágenes
  images: {
    unoptimized: true,
    domains: [],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};
``
export default nextConfig;
