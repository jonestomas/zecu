// Content Security Policy configurations
export const _CSP_POLICIES = {
  // CSP para páginas públicas
  public: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requiere unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind CSS requiere unsafe-inline
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.polar.sh https://sandbox-api.polar.sh",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; '),

  // CSP más estricto para APIs
  api: [
    "default-src 'none'",
    "script-src 'none'",
    "style-src 'none'",
    "img-src 'none'",
    "font-src 'none'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
    "media-src 'none'",
    "worker-src 'none'",
    "child-src 'none'",
    "manifest-src 'none'",
  ].join('; '),

  // CSP para páginas de autenticación (más estricto)
  auth: [
    "default-src 'self'",
    "script-src 'self'", // Sin unsafe-inline para auth
    "style-src 'self' 'unsafe-inline'", // Mantener para Tailwind
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'none'",
    "worker-src 'none'",
    "child-src 'none'",
    "manifest-src 'none'",
  ].join('; '),
};

// Headers de seguridad por tipo de página
export const _SECURITY_HEADERS_BY_TYPE = {
  public: {
    'Content-Security-Policy': CSP_POLICIES.public,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-Powered-By': 'Next.js',
  },

  api: {
    'Content-Security-Policy': CSP_POLICIES.api,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'X-Powered-By': 'Next.js',
  },

  auth: {
    'Content-Security-Policy': CSP_POLICIES.auth,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'X-Powered-By': 'Next.js',
  },
};
