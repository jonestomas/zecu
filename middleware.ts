import { NextRequest, NextResponse } from 'next/server';
import { addSecurityHeaders, validateOrigin, detectSuspiciousActivity, logSecurityEvent } from '@/lib/security-headers';
import { SECURITY_HEADERS_BY_TYPE } from '@/lib/csp-config';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 1. Detectar actividad sospechosa
  if (detectSuspiciousActivity(request)) {
    logSecurityEvent('SUSPICIOUS_USER_AGENT', request);
    
    // Para APIs, bloquear completamente
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  // 2. Validar origen para APIs
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!validateOrigin(request)) {
      logSecurityEvent('INVALID_ORIGIN', request);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  // 3. Aplicar headers de seguridad específicos
  const isAPI = request.nextUrl.pathname.startsWith('/api/');
  const isAuth = request.nextUrl.pathname.startsWith('/login') || 
                 request.nextUrl.pathname.startsWith('/register') ||
                 request.nextUrl.pathname.startsWith('/verify');
  
  let headerType = 'public';
  if (isAPI) headerType = 'api';
  else if (isAuth) headerType = 'auth';
  
  // Aplicar headers específicos por tipo
  const headers = SECURITY_HEADERS_BY_TYPE[headerType as keyof typeof SECURITY_HEADERS_BY_TYPE];
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // 5. Log de acceso para APIs sensibles
  const sensitiveAPIs = [
    '/api/auth/',
    '/api/polar/',
    '/api/webhooks/',
    '/api/create-payment'
  ];
  
  if (sensitiveAPIs.some(api => request.nextUrl.pathname.startsWith(api))) {
    logSecurityEvent('API_ACCESS', request);
  }
  
  return response;
}

// Configurar qué rutas aplicar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
