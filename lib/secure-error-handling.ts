import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/secure-logging';

// Tipos de errores seguros
export type ErrorType =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'PAYMENT_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

// Configuración de mensajes de error por tipo
export const _ERROR_MESSAGES = {
  // Errores de validación
  VALIDATION_ERROR: {
    userMessage: 'Los datos proporcionados no son válidos',
    userDetails: 'Por favor, revisa la información ingresada e intenta nuevamente',
    statusCode: 400,
    logLevel: 'WARN' as const,
  },

  // Errores de autenticación
  AUTHENTICATION_ERROR: {
    userMessage: 'No tienes autorización para realizar esta acción',
    userDetails: 'Por favor, inicia sesión e intenta nuevamente',
    statusCode: 401,
    logLevel: 'WARN' as const,
  },

  // Errores de autorización
  AUTHORIZATION_ERROR: {
    userMessage: 'No tienes permisos para acceder a este recurso',
    userDetails: 'Contacta al administrador si crees que esto es un error',
    statusCode: 403,
    logLevel: 'WARN' as const,
  },

  // Recurso no encontrado
  NOT_FOUND_ERROR: {
    userMessage: 'El recurso solicitado no fue encontrado',
    userDetails: 'Verifica que la información sea correcta',
    statusCode: 404,
    logLevel: 'INFO' as const,
  },

  // Rate limiting
  RATE_LIMIT_ERROR: {
    userMessage: 'Demasiadas solicitudes. Intenta de nuevo más tarde',
    userDetails: 'Por favor, espera unos minutos antes de intentar nuevamente',
    statusCode: 429,
    logLevel: 'WARN' as const,
  },

  // Errores de pago
  PAYMENT_ERROR: {
    userMessage: 'Error al procesar el pago',
    userDetails: 'Por favor, verifica tu información de pago e intenta nuevamente',
    statusCode: 402,
    logLevel: 'ERROR' as const,
  },

  // Servicios externos
  EXTERNAL_SERVICE_ERROR: {
    userMessage: 'Servicio temporalmente no disponible',
    userDetails: 'Por favor, intenta nuevamente en unos minutos',
    statusCode: 503,
    logLevel: 'ERROR' as const,
  },

  // Base de datos
  DATABASE_ERROR: {
    userMessage: 'Error interno del servidor',
    userDetails: 'Por favor, intenta nuevamente más tarde',
    statusCode: 500,
    logLevel: 'ERROR' as const,
  },

  // Error interno genérico
  INTERNAL_ERROR: {
    userMessage: 'Error interno del servidor',
    userDetails: 'Por favor, intenta nuevamente más tarde',
    statusCode: 500,
    logLevel: 'ERROR' as const,
  },
};

// Interfaz para errores seguros
export interface SecureError {
  type: ErrorType;
  userMessage: string;
  userDetails?: string;
  statusCode: number;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  technicalDetails?: any;
  requestId?: string;
  userId?: string;
  timestamp: string;
}

// Función para crear errores seguros
export function createSecureError(
  type: ErrorType,
  technicalDetails?: any,
  _requestId?: string,
  userId?: string
): SecureError {
  const config = ERROR_MESSAGES[type];
  const timestamp = new Date().toISOString();

  return {
    type,
    userMessage: config.userMessage,
    userDetails: config.userDetails,
    statusCode: config.statusCode,
    logLevel: config.logLevel,
    technicalDetails,
    requestId,
    userId,
    timestamp,
  };
}

// Función para manejar errores de Zod
export function handleZodError(error: any, _requestId?: string): SecureError {
  const zodError = createSecureError(
    'VALIDATION_ERROR',
    {
      validationErrors: error.errors,
      errorName: error.name,
      errorMessage: error.message,
    },
    _requestId
  );

  return zodError;
}

// Función para manejar errores de autenticación
export function handleAuthError(error: any, _requestId?: string, userId?: string): SecureError {
  const authError = createSecureError(
    'AUTHENTICATION_ERROR',
    {
      errorName: error.name,
      errorMessage: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    _requestId,
    userId
  );

  return authError;
}

// Función para manejar errores de base de datos
export function handleDatabaseError(error: any, _requestId?: string, userId?: string): SecureError {
  const dbError = createSecureError(
    'DATABASE_ERROR',
    {
      errorName: error.name,
      errorMessage: error.message,
      code: error.code,
      constraint: error.constraint,
      table: error.table,
      column: error.column,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    _requestId,
    userId
  );

  return dbError;
}

// Función para manejar errores de servicios externos
export function handleExternalServiceError(
  service: string,
  error: any,
  _requestId?: string,
  userId?: string
): SecureError {
  const externalError = createSecureError(
    'EXTERNAL_SERVICE_ERROR',
    {
      service,
      errorName: error.name,
      errorMessage: error.message,
      statusCode: error.statusCode,
      response: error.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data:
              typeof error.response.data === 'string'
                ? error.response.data.substring(0, 200)
                : error.response.data,
          }
        : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    requestId,
    userId
  );

  return externalError;
}

// Función para manejar errores de pago
export function handlePaymentError(
  provider: string,
  error: any,
  _requestId?: string,
  userId?: string
): SecureError {
  const paymentError = createSecureError(
    'PAYMENT_ERROR',
    {
      provider,
      errorName: error.name,
      errorMessage: error.message,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      errorType: error.errorType,
      response: error.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data:
              typeof error.response.data === 'string'
                ? error.response.data.substring(0, 200)
                : error.response.data,
          }
        : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    requestId,
    userId
  );

  return paymentError;
}

// Función para crear respuesta de error segura
export function createSecureErrorResponse(
  secureError: SecureError,
  _request?: Request
): NextResponse {
  const logger = request ? createLogger(_request) : null;

  // Log del error con detalles técnicos
  if (logger) {
    const logData = {
      errorType: secureError.type,
      statusCode: secureError.statusCode,
      requestId: secureError.requestId,
      userId: secureError.userId,
      technicalDetails: secureError.technicalDetails,
    };

    switch (secureError.logLevel) {
      case 'DEBUG':
        logger.debug('Error occurred', logData);
        break;
      case 'INFO':
        logger.info('API', 'Error occurred', logData);
        break;
      case 'WARN':
        logger.warn('API', 'Error occurred', logData);
        break;
      case 'ERROR':
        logger.error(
          'API',
          'Error occurred',
          new Error(secureError.technicalDetails?.errorMessage || 'Unknown error'),
          logData
        );
        break;
      case 'CRITICAL':
        logger.critical(
          'API',
          'Critical error occurred',
          new Error(secureError.technicalDetails?.errorMessage || 'Unknown error'),
          logData
        );
        break;
    }
  }

  // Crear respuesta segura para el usuario
  const responseBody = {
    success: false,
    error: secureError.userMessage,
    details: secureError.userDetails,
    timestamp: secureError.timestamp,
    requestId: secureError.requestId,
  };

  // En desarrollo, incluir más detalles
  if (process.env.NODE_ENV === 'development') {
    (responseBody as any).debug = {
      type: secureError.type,
      technicalDetails: secureError.technicalDetails,
    };
  }

  return NextResponse.json(responseBody, {
    status: secureError.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': secureError._requestId || 'unknown',
      'X-Error-Type': secureError.type,
    },
  });
}

// Función helper para manejar errores en try-catch
export function handleError(
  error: any,
  _request?: Request,
  userId?: string,
  customType?: ErrorType
): NextResponse {
  let secureError: SecureError;

  // Determinar tipo de error basado en el error original
  if (customType) {
    secureError = createSecureError(customType, error, undefined, userId);
  } else if (error.name === 'ZodError') {
    secureError = handleZodError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    secureError = handleAuthError(error, undefined, userId);
  } else if (error.code && error.code.startsWith('23')) {
    // PostgreSQL error codes
    secureError = handleDatabaseError(error, undefined, userId);
  } else if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    secureError = createSecureError('EXTERNAL_SERVICE_ERROR', error, undefined, userId);
  } else {
    secureError = createSecureError('INTERNAL_ERROR', error, undefined, userId);
  }

  return createSecureErrorResponse(secureError, _request);
}

// Función para validar y sanitizar errores de entrada
export function sanitizeErrorInput(error: any): any {
  if (!error) return error;

  // Crear copia del error para no modificar el original
  const sanitized = { ...error };

  // Remover información sensible
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  delete sanitized.key;
  delete sanitized.otp;
  delete sanitized.code;
  delete sanitized.credit_card;
  delete sanitized.cvv;
  delete sanitized.ssn;
  delete sanitized.dni;

  // Limitar tamaño de mensajes
  if (sanitized.message && typeof sanitized.message === 'string') {
    sanitized.message = sanitized.message.substring(0, 500);
  }

  // Limitar tamaño de stack traces
  if (sanitized.stack && typeof sanitized.stack === 'string') {
    sanitized.stack = sanitized.stack.substring(0, 1000);
  }

  return sanitized;
}
