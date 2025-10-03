import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Configuración de seguridad
const WEBHOOK_CONFIG = {
  MAX_PAYLOAD_SIZE: 1024 * 1024, // 1MB máximo
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minuto
  MAX_REQUESTS_PER_WINDOW: 100,
  ALLOWED_IPS: [
    // IPs oficiales de Mercado Pago (actualizar según documentación)
    '200.115.53.193',
    '200.115.53.194',
    '200.115.53.195',
    '200.115.53.196',
    '200.115.53.197',
    '200.115.53.198',
    '200.115.53.199',
    // Agregar más IPs según la documentación oficial
  ]
};

// Rate limiting simple en memoria (en producción usar Redis)
const requestCounts = new Map<string, { count: number; window: number }>();

export class WebhookSecurityError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'WebhookSecurityError';
  }
}

export async function validateWebhookSecurity(request: NextRequest): Promise<boolean> {
  // 1. Validar Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new WebhookSecurityError('Content-Type inválido', 'INVALID_CONTENT_TYPE');
  }

  // 2. Validar User-Agent (Mercado Pago tiene un patrón específico)
  const userAgent = request.headers.get('user-agent');
  if (!userAgent?.includes('MercadoPago')) {
    console.warn('⚠️ User-Agent sospechoso:', userAgent);
  }

  // 3. Rate limiting por IP
  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP)) {
    throw new WebhookSecurityError('Rate limit excedido', 'RATE_LIMIT_EXCEEDED');
  }

  // 4. Validar IP origen (opcional, puede causar problemas con proxies)
  if (process.env.NODE_ENV === 'production' && process.env.VALIDATE_WEBHOOK_IPS === 'true') {
    if (!isAllowedIP(clientIP)) {
      throw new WebhookSecurityError(`IP no autorizada: ${clientIP}`, 'UNAUTHORIZED_IP');
    }
  }

  return true;
}

export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Mercado Pago usa HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Comparación segura para evitar timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error validando firma:', error);
    return false;
  }
}

export function sanitizeWebhookData(data: any): any {
  // Remover campos potencialmente peligrosos
  const sanitized = { ...data };
  
  // Lista de campos a remover por seguridad
  const sensitiveFields = ['__proto__', 'constructor', 'prototype'];
  
  function cleanObject(obj: any): any {
    if (obj && typeof obj === 'object') {
      for (const field of sensitiveFields) {
        delete obj[field];
      }
      
      // Recursivamente limpiar objetos anidados
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = cleanObject(obj[key]);
        }
      }
    }
    return obj;
  }
  
  return cleanObject(sanitized);
}

function getClientIP(request: NextRequest): string {
  // Intentar obtener IP real (considerando proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cloudflareIP = request.headers.get('cf-connecting-ip');
  
  // Usar la IP más confiable disponible
  return cloudflareIP || realIP || forwarded?.split(',')[0] || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = Math.floor(now / WEBHOOK_CONFIG.RATE_LIMIT_WINDOW);
  
  const key = `${ip}-${windowStart}`;
  const current = requestCounts.get(key) || { count: 0, window: windowStart };
  
  if (current.window < windowStart) {
    // Nueva ventana de tiempo
    current.count = 1;
    current.window = windowStart;
  } else {
    current.count++;
  }
  
  requestCounts.set(key, current);
  
  // Limpiar entradas antiguas
  setTimeout(() => {
    for (const [k, v] of requestCounts.entries()) {
      if (v.window < windowStart - 1) {
        requestCounts.delete(k);
      }
    }
  }, 1000);
  
  return current.count <= WEBHOOK_CONFIG.MAX_REQUESTS_PER_WINDOW;
}

function isAllowedIP(ip: string): boolean {
  // En desarrollo, permitir localhost
  if (process.env.NODE_ENV === 'development') {
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'unknown') {
      return true;
    }
  }
  
  return WEBHOOK_CONFIG.ALLOWED_IPs.includes(ip);
}

// Función para logs seguros de webhooks
export function logWebhookSecurely(data: any, ip: string) {
  const safeLog = {
    timestamp: new Date().toISOString(),
    type: data.type,
    action: data.action,
    paymentId: data.data?.id ? `***${data.data.id.slice(-4)}` : 'unknown',
    ip: ip.replace(/\d+$/, 'xxx'), // Ofuscar último octeto de IP
    userAgent: 'MercadoPago-Webhook'
  };
  
  console.log('🔔 Webhook seguro recibido:', safeLog);
}
