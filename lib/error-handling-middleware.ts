import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/secure-error-handling';

// Middleware para manejo global de errores
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      // Usar el sistema de manejo de errores seguro
      return handleError(error, request);
    }
  };
}

// Middleware específico para APIs de autenticación
export function withAuthErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      // Manejo específico para errores de autenticación
      return handleError(error, request, undefined, 'AUTHENTICATION_ERROR');
    }
  };
}

// Middleware específico para APIs de pago
export function withPaymentErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      // Manejo específico para errores de pago
      return handleError(error, request, undefined, 'PAYMENT_ERROR');
    }
  };
}

// Middleware específico para APIs de base de datos
export function withDatabaseErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      // Manejo específico para errores de base de datos
      return handleError(error, request, undefined, 'DATABASE_ERROR');
    }
  };
}

// Función para validar y sanitizar respuestas de error
export function sanitizeErrorResponse(response: NextResponse): NextResponse {
  try {
    const body = response.body;
    if (!body) return response;
    
    // Leer el cuerpo de la respuesta
    const reader = body.getReader();
    let chunks: Uint8Array[] = [];
    
    // Esta es una implementación simplificada
    // En un caso real, necesitarías manejar el stream de manera asíncrona
    return response;
  } catch (error) {
    // Si hay error al sanitizar, devolver respuesta genérica
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: 'Por favor, intenta nuevamente más tarde'
    }, { status: 500 });
  }
}

// Función para crear respuestas de error estándar
export function createStandardErrorResponse(
  message: string,
  details?: string,
  statusCode: number = 500
): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    details: details || 'Por favor, intenta nuevamente más tarde',
    timestamp: new Date().toISOString()
  }, { 
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Error-Handled': 'true'
    }
  });
}

// Función para manejar errores de validación específicos
export function handleValidationError(
  errors: any[],
  request?: NextRequest
): NextResponse {
  const sanitizedErrors = errors.map(error => ({
    field: error.path?.join('.') || 'unknown',
    message: error.message,
    code: error.code
  }));
  
  return NextResponse.json({
    success: false,
    error: 'Los datos proporcionados no son válidos',
    details: 'Por favor, revisa la información ingresada e intenta nuevamente',
    validationErrors: sanitizedErrors,
    timestamp: new Date().toISOString()
  }, { 
    status: 400,
    headers: {
      'Content-Type': 'application/json',
      'X-Error-Type': 'VALIDATION_ERROR'
    }
  });
}

// Función para manejar errores de rate limiting
export function handleRateLimitError(
  retryAfter: number,
  request?: NextRequest
): NextResponse {
  return NextResponse.json({
    success: false,
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde',
    details: `Por favor, espera ${retryAfter} segundos antes de intentar nuevamente`,
    retryAfter,
    timestamp: new Date().toISOString()
  }, { 
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': retryAfter.toString(),
      'X-Error-Type': 'RATE_LIMIT_ERROR'
    }
  });
}
