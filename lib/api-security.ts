import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

// Esquemas de validación
export const _createPaymentSchema = z.object({
  planId: z.enum(['plus'], {
    errorMap: () => ({ message: 'Plan debe ser "plus"' }),
  }),
  userEmail: z.string().email('Email inválido').optional(),
  captchaToken: z.string().min(1, 'Token captcha requerido').optional(),
});

// Rate limiting por IP
const _rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class APISecurityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'APISecurityError';
  }
}

export async function validateAPIRequest(
  _request: NextRequest,
  schema?: z.ZodSchema,
  options: {
    requireCaptcha?: boolean;
    rateLimitRequests?: number;
    rateLimitWindow?: number;
  } = {}
): Promise<any> {
  const {
    requireCaptcha = false,
    rateLimitRequests = 10,
    rateLimitWindow = 60000, // 1 minuto
  } = options;

  // 1. Validar método HTTP
  if (_request.method !== 'POST') {
    throw new APISecurityError('Método no permitido', 405);
  }

  // 2. Validar Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new APISecurityError('Content-Type debe ser application/json', 400);
  }

  // 3. Rate limiting
  const clientIP = getClientIP(_request);
  if (!checkAPIRateLimit(clientIP, rateLimitRequests, rateLimitWindow)) {
    throw new APISecurityError('Demasiadas solicitudes', 429);
  }

  // 4. Validar tamaño del payload
  const rawBody = await request.text();
  if (rawBody.length > 10240) {
    // 10KB máximo
    throw new APISecurityError('Payload demasiado grande', 413);
  }

  // 5. Parsear y validar JSON
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    throw new APISecurityError('JSON inválido', 400);
  }

  // 6. Sanitizar entrada
  body = sanitizeInput(body);

  // 7. Validar con schema si se proporciona
  if (schema) {
    try {
      body = schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map(e => e.message).join(', ');
        throw new APISecurityError(`Datos inválidos: ${message}`, 400);
      }
      throw error;
    }
  }

  // 8. Validar CAPTCHA si es requerido
  if (requireCaptcha && !body.captchaToken) {
    throw new APISecurityError('Token CAPTCHA requerido', 400);
  }

  // 9. Validar origen (CORS básico)
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [
      'https://zecu.vercel.app',
      'https://www.zecu.com', // Si tienes dominio propio
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      console.warn('⚠️ Origen sospechoso:', origin);
    }
  }

  return body;
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remover caracteres peligrosos
    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // XSS básico
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .substring(0, 1000); // Limitar longitud
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput).slice(0, 100); // Limitar arrays
  }

  if (input && typeof input === 'object') {
    const sanitized: any = {};
    const allowedKeys = ['planId', 'userEmail', 'captchaToken']; // Whitelist

    for (const key of allowedKeys) {
      if (key in input) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }

  return input;
}

function getClientIP(_request: NextRequest): string {
  return (
    _request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkAPIRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const key = ip;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Nueva ventana o primera solicitud
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  rateLimitStore.set(key, current);
  return true;
}

// Middleware wrapper para APIs
export function withAPISecurity(
  handler: (_request: NextRequest, validatedBody: any) => Promise<NextResponse>,
  options: {
    schema?: z.ZodSchema;
    requireCaptcha?: boolean;
    rateLimitRequests?: number;
    rateLimitWindow?: number;
  } = {}
) {
  return async (_request: NextRequest) => {
    try {
      const validatedBody = await validateAPIRequest(_request, options.schema, options);

      // Log seguro
      console.warn('🔒 API call:', {
        method: _request.method,
        path: new URL(_request.url).pathname,
        ip: getClientIP(_request).replace(/\d+$/, 'xxx'),
        timestamp: new Date().toISOString(),
      });

      return await handler(_request, validatedBody);
    } catch (error) {
      if (error instanceof APISecurityError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }

      console.error('❌ API Error:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
  };
}
