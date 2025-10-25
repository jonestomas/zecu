import { NextRequest } from 'next/server';

// Tipos de eventos de logging
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
export type LogCategory = 'AUTH' | 'PAYMENT' | 'API' | 'SECURITY' | 'USER' | 'SYSTEM' | 'WEBHOOK';

// Configuración de logging
export const _LOG_CONFIG = {
  // Niveles de log por entorno
  levels: {
    development: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'],
    production: ['INFO', 'WARN', 'ERROR', 'CRITICAL'],
    test: ['ERROR', 'CRITICAL'],
  },

  // Campos que deben ser ofuscados
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'key',
    'otp',
    'code',
    'phone',
    'email',
    'credit_card',
    'cvv',
    'ssn',
    'dni',
    'address',
    'ip',
    'session',
    'cookie',
    'authorization',
  ],

  // Patrones para detectar datos sensibles
  sensitivePatterns: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\b\+?[1-9]\d{1,14}\b/g, // Teléfonos
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Tarjetas de crédito
    /\b[A-Za-z0-9+/]{20,}={0,2}\b/g, // Tokens base64
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, // UUIDs
  ],
};

// Interfaz para eventos de log
interface LogEvent {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Función para generar ID único de request
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Función para ofuscar datos sensibles
function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Ofuscar patrones sensibles
    let sanitized = data;

    LOG_CONFIG.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};

    Object.keys(data).forEach(key => {
      const lowerKey = key.toLowerCase();

      // Verificar si el campo es sensible
      const isSensitive = LOG_CONFIG.sensitiveFields.some(field => lowerKey.includes(field));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(data[key]);
      }
    });

    return sanitized;
  }

  return data;
}

// Función para extraer información básica del request
function extractRequestInfo(_request: NextRequest): {
  ip: string;
  userAgent: string;
  endpoint: string;
  method: string;
} {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  // Ofuscar IP (mantener solo los primeros 3 octetos)
  const maskedIp = ip.replace(/\.\d+$/, '.xxx');

  return {
    ip: maskedIp,
    userAgent: request.headers.get('user-agent')?.substring(0, 100) || 'unknown',
    endpoint: request.nextUrl.pathname,
    method: request.method,
  };
}

// Función principal de logging
export function createLogger(_request?: NextRequest) {
  const requestId = generateRequestId();
  const requestInfo = request ? extractRequestInfo(_request) : null;

  return {
    debug: (message: string, metadata?: any) =>
      log('DEBUG', 'SYSTEM', message, _requestId, _requestInfo, metadata),

    info: (category: LogCategory, message: string, metadata?: any) =>
      log('INFO', category, message, _requestId, _requestInfo, metadata),

    warn: (category: LogCategory, message: string, metadata?: any) =>
      log('WARN', category, message, _requestId, _requestInfo, metadata),

    error: (category: LogCategory, message: string, error?: Error, metadata?: any) =>
      log('ERROR', category, message, _requestId, _requestInfo, metadata, error),

    critical: (category: LogCategory, message: string, error?: Error, metadata?: any) =>
      log('CRITICAL', category, message, _requestId, _requestInfo, metadata, error),

    // Logger específico para seguridad
    security: {
      auth: (message: string, metadata?: any) =>
        log('INFO', 'SECURITY', `AUTH: ${message}`, _requestId, _requestInfo, metadata),

      payment: (message: string, metadata?: any) =>
        log('INFO', 'SECURITY', `PAYMENT: ${message}`, _requestId, _requestInfo, metadata),

      api: (message: string, metadata?: any) =>
        log('INFO', 'SECURITY', `API: ${message}`, _requestId, _requestInfo, metadata),

      threat: (message: string, metadata?: any) =>
        log('WARN', 'SECURITY', `THREAT: ${message}`, _requestId, _requestInfo, metadata),

      violation: (message: string, metadata?: any) =>
        log('ERROR', 'SECURITY', `VIOLATION: ${message}`, _requestId, _requestInfo, metadata),
    },

    // Logger específico para APIs
    api: {
      request: (endpoint: string, method: string, userId?: string, metadata?: any) =>
        log('INFO', 'API', `Request: ${method} ${endpoint}`, _requestId, _requestInfo, {
          userId,
          ...metadata,
        }),

      response: (endpoint: string, statusCode: number, duration: number, metadata?: any) =>
        log('INFO', 'API', `Response: ${endpoint} ${statusCode}`, _requestId, _requestInfo, {
          statusCode,
          duration,
          ...metadata,
        }),

      error: (endpoint: string, error: Error, metadata?: any) =>
        log('ERROR', 'API', `Error: ${endpoint}`, _requestId, _requestInfo, metadata, error),
    },
  };
}

// Función interna de logging
function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  _requestId: string,
  _requestInfo: any,
  metadata?: any,
  error?: Error
) {
  const env = process.env.NODE_ENV || 'development';
  const allowedLevels =
    LOG_CONFIG.levels[env as keyof typeof LOG_CONFIG.levels] || LOG_CONFIG.levels.development;

  // Verificar si el nivel está permitido en el entorno actual
  if (!allowedLevels.includes(level)) {
    return;
  }

  const logEvent: LogEvent = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    requestId,
    ...requestInfo,
    metadata: metadata ? sanitizeData(metadata) : undefined,
    error: error
      ? {
          name: error.name,
          message: error.message,
          stack: env === 'development' ? error.stack : undefined,
        }
      : undefined,
  };

  // Formatear log según el entorno
  if (env === 'development') {
    console.warn(formatLogForConsole(logEvent));
  } else {
    console.warn(JSON.stringify(logEvent));
  }

  // En producción, aquí podrías enviar a un servicio de logging externo
  // como Datadog, CloudWatch, etc.
}

// Función para formatear logs para consola (desarrollo)
function formatLogForConsole(event: LogEvent): string {
  const timestamp = new Date(event.timestamp).toLocaleTimeString();
  const level = event.level.padEnd(8);
  const category = event.category.padEnd(8);
  const requestId = event.requestId ? `[${event.requestId}]` : '';

  let logLine = `${timestamp} ${level} ${category} ${requestId} ${event.message}`;

  if (event.metadata) {
    logLine += `\n  Metadata: ${JSON.stringify(event.metadata, null, 2)}`;
  }

  if (event.error) {
    logLine += `\n  Error: ${event.error.name}: ${event.error.message}`;
    if (event.error.stack) {
      logLine += `\n  Stack: ${event.error.stack}`;
    }
  }

  return logLine;
}

// Función para logging de webhooks (especializada)
export function createWebhookLogger(webhookType: string) {
  return {
    received: (_request: NextRequest, metadata?: any) => {
      const logger = createLogger(_request);
      logger.info('WEBHOOK', `Webhook ${webhookType} received`, {
        webhookType,
        headers: Object.fromEntries(_request.headers.entries()),
        ...metadata,
      });
    },

    processed: (_request: NextRequest, result: any, metadata?: any) => {
      const logger = createLogger(_request);
      logger.info('WEBHOOK', `Webhook ${webhookType} processed successfully`, {
        webhookType,
        result,
        ...metadata,
      });
    },

    error: (_request: NextRequest, error: Error, metadata?: any) => {
      const logger = createLogger(_request);
      logger.error('WEBHOOK', `Webhook ${webhookType} processing failed`, error, {
        webhookType,
        ...metadata,
      });
    },
  };
}

// Función para logging de autenticación (especializada)
export function createAuthLogger() {
  return {
    loginAttempt: (_request: NextRequest, phone: string, success: boolean, metadata?: any) => {
      const logger = createLogger(_request);
      logger.security.auth(`Login attempt ${success ? 'successful' : 'failed'}`, {
        phone: phone.replace(/\d(?=\d{4})/g, '*'), // Ofuscar teléfono
        success,
        ...metadata,
      });
    },

    otpSent: (_request: NextRequest, phone: string, metadata?: any) => {
      const logger = createLogger(_request);
      logger.security.auth('OTP sent', {
        phone: phone.replace(/\d(?=\d{4})/g, '*'),
        ...metadata,
      });
    },

    otpVerified: (_request: NextRequest, phone: string, success: boolean, metadata?: any) => {
      const logger = createLogger(_request);
      logger.security.auth(`OTP verification ${success ? 'successful' : 'failed'}`, {
        phone: phone.replace(/\d(?=\d{4})/g, '*'),
        success,
        ...metadata,
      });
    },

    sessionCreated: (_request: NextRequest, userId: string, metadata?: any) => {
      const logger = createLogger(_request);
      logger.security.auth('Session created', {
        userId: `${userId.substring(0, 8)}...`, // Ofuscar userId
        ...metadata,
      });
    },
  };
}
