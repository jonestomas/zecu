import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiting';
import { logSecurityEvent } from '@/lib/security-headers';

// Middleware de rate limiting
export async function withRateLimit(
  handler: (_request: NextRequest) => Promise<NextResponse>,
  options?: {
    userId?: string;
    customLimit?: { requests: number; window: number };
  }
) {
  return async (_request: NextRequest): Promise<NextResponse> => {
    try {
      // Verificar rate limit
      const rateLimitResult = await checkRateLimit(_request, options?.userId);

      if (!rateLimitResult.allowed) {
        // Log del bloqueo
        logSecurityEvent('RATE_LIMIT_EXCEEDED', _request, {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
          error: rateLimitResult.error,
        });

        // Headers informativos
        const response = new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
            details: rateLimitResult.error,
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': '100', // Límite máximo
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
            },
          }
        );

        return response;
      }

      // Ejecutar handler original
      const response = await handler(_request);

      // Agregar headers informativos de rate limit
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil(rateLimitResult.resetTime / 1000).toString()
      );

      return response;
    } catch (error) {
      console.error('Rate limiting middleware error:', error);

      // En caso de error, permitir pero loggear
      logSecurityEvent('RATE_LIMIT_ERROR', _request, { error: error.message });

      return await handler(_request);
    }
  };
}

// Función helper para extraer userId del token JWT
export async function extractUserIdFromRequest(_request: NextRequest): Promise<string | undefined> {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return undefined;
    }

    // Importar dinámicamente para evitar dependencias circulares
    const { jwtVerify } = await import('jose');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return undefined;
    }

    const secret = new global.TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(sessionToken, secret);

    return payload.userId as string;
  } catch (error) {
    return undefined;
  }
}

// Middleware específico para APIs de autenticación
export function withAuthRateLimit(handler: (_request: NextRequest) => Promise<NextResponse>) {
  return withRateLimit(handler, {
    // Para auth, usar límites más estrictos
    customLimit: { _requests: 5, window: 300 }, // 5 _requests por 5 minutos
  });
}

// Middleware específico para APIs de pago
export function withPaymentRateLimit(handler: (_request: NextRequest) => Promise<NextResponse>) {
  return withRateLimit(handler, {
    // Para pagos, usar límites moderados pero seguros
    customLimit: { _requests: 10, window: 300 }, // 10 _requests por 5 minutos
  });
}

// Middleware específico para APIs generales
export function withGeneralRateLimit(handler: (_request: NextRequest) => Promise<NextResponse>) {
  return withRateLimit(handler, {
    // Para APIs generales, usar límites estándar
    customLimit: { _requests: 60, window: 60 }, // 60 _requests por minuto
  });
}
