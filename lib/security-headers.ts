import { NextRequest, NextResponse } from 'next/server';

// Headers de seguridad críticos
const SECURITY_HEADERS = {
  // Prevenir ataques XSS
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy básico
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Necesario para Next.js
    "style-src 'self' 'unsafe-inline'", // Necesario para Tailwind CSS
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.polar.sh https://sandbox-api.polar.sh",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', '),
  
  // Cache Control para APIs sensibles
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Headers específicos para APIs
const API_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  'Content-Security-Policy': [
    "default-src 'none'",
    "script-src 'none'",
    "style-src 'none'",
    "img-src 'none'",
    "font-src 'none'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'"
  ].join('; ')
};

export function addSecurityHeaders(response: NextResponse, isAPI: boolean = false): NextResponse {
  const headers = isAPI ? API_SECURITY_HEADERS : SECURITY_HEADERS;
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Middleware para aplicar headers automáticamente
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);
    
    // Determinar si es una API route
    const isAPI = request.nextUrl.pathname.startsWith('/api/');
    
    return addSecurityHeaders(response, isAPI);
  };
}

// Función para validar origen en APIs
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // En desarrollo, permitir localhost
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // En producción, validar origen
  const allowedOrigins = [
    'https://zecu.vercel.app',
    'https://www.zecu.vercel.app',
    'https://zecu.app',
    'https://www.zecu.app'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    return true;
  }
  
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return allowedOrigins.some(allowed => 
        refererUrl.origin === allowed
      );
    } catch {
      return false;
    }
  }
  
  return false;
}

// Función para detectar ataques básicos
export function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /wget/i,
    /curl/i,
    /python-requests/i,
    /bot/i,
    /crawler/i,
    /spider/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

// Log de seguridad
export function logSecurityEvent(
  event: string,
  request: NextRequest,
  details?: any
) {
  const clientIP = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
  
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ip: clientIP.replace(/\d+$/, 'xxx'), // Ofuscar último octeto
    userAgent: request.headers.get('user-agent')?.substring(0, 100),
    path: request.nextUrl.pathname,
    method: request.method,
    ...details
  };
  
  console.log('🛡️ Security Event:', logData);
}
