# 🛡️ Guía de Manejo de Errores Seguros

## 📋 Principios de Seguridad

### **✅ Implementado**

- [x] **Mensajes de error seguros**: Sin exposición de información técnica
- [x] **Logging detallado**: Información técnica solo en logs del servidor
- [x] **Categorización de errores**: Tipos específicos con respuestas apropiadas
- [x] **Sanitización automática**: Eliminación de datos sensibles
- [x] **Páginas de error personalizadas**: UX mejorada para usuarios

### **🔒 Información Protegida**

- **Passwords, tokens, secrets**: Nunca expuestos al usuario
- **Stack traces**: Solo en desarrollo
- **Detalles técnicos**: Solo en logs del servidor
- **Estructura de base de datos**: Nunca revelada
- **Configuración del servidor**: Nunca expuesta

## 🎯 Tipos de Errores Manejados

### **VALIDATION_ERROR (400)**

```json
{
  "success": false,
  "error": "Los datos proporcionados no son válidos",
  "details": "Por favor, revisa la información ingresada e intenta nuevamente",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

### **AUTHENTICATION_ERROR (401)**

```json
{
  "success": false,
  "error": "No tienes autorización para realizar esta acción",
  "details": "Por favor, inicia sesión e intenta nuevamente",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

### **AUTHORIZATION_ERROR (403)**

```json
{
  "success": false,
  "error": "No tienes permisos para acceder a este recurso",
  "details": "Contacta al administrador si crees que esto es un error",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

### **NOT_FOUND_ERROR (404)**

```json
{
  "success": false,
  "error": "El recurso solicitado no fue encontrado",
  "details": "Verifica que la información sea correcta",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

### **RATE_LIMIT_ERROR (429)**

```json
{
  "success": false,
  "error": "Demasiadas solicitudes. Intenta de nuevo más tarde",
  "details": "Por favor, espera unos minutos antes de intentar nuevamente",
  "retryAfter": 300,
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

### **PAYMENT_ERROR (402)**

```json
{
  "success": false,
  "error": "Error al procesar el pago",
  "details": "Por favor, verifica tu información de pago e intenta nuevamente",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

### **EXTERNAL_SERVICE_ERROR (503)**

```json
{
  "success": false,
  "error": "Servicio temporalmente no disponible",
  "details": "Por favor, intenta nuevamente en unos minutos",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

### **DATABASE_ERROR (500)**

```json
{
  "success": false,
  "error": "Error interno del servidor",
  "details": "Por favor, intenta nuevamente más tarde",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

### **INTERNAL_ERROR (500)**

```json
{
  "success": false,
  "error": "Error interno del servidor",
  "details": "Por favor, intenta nuevamente más tarde",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

## 🛠️ Uso del Sistema

### **Manejo Básico de Errores**

```typescript
import { handleError } from '@/lib/secure-error-handling';

export async function POST(request: NextRequest) {
  try {
    // Tu lógica aquí
    return NextResponse.json({ success: true });
  } catch (error) {
    // Manejo automático y seguro de errores
    return handleError(error, request);
  }
}
```

### **Manejo Específico por Tipo**

```typescript
import {
  handleZodError,
  handleAuthError,
  handlePaymentError,
  createSecureErrorResponse,
} from '@/lib/secure-error-handling';

// Para errores de validación
if (error instanceof z.ZodError) {
  const secureError = handleZodError(error, requestId);
  return createSecureErrorResponse(secureError, request);
}

// Para errores de autenticación
if (error.name === 'JsonWebTokenError') {
  const secureError = handleAuthError(error, requestId, userId);
  return createSecureErrorResponse(secureError, request);
}

// Para errores de pago
if (error.provider === 'polar') {
  const secureError = handlePaymentError('polar', error, requestId, userId);
  return createSecureErrorResponse(secureError, request);
}
```

### **Middleware de Manejo de Errores**

```typescript
import {
  withErrorHandling,
  withAuthErrorHandling,
  withPaymentErrorHandling,
} from '@/lib/error-handling-middleware';

// Manejo general
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Tu lógica aquí
});

// Manejo específico para autenticación
export const POST = withAuthErrorHandling(async (request: NextRequest) => {
  // Tu lógica aquí
});

// Manejo específico para pagos
export const POST = withPaymentErrorHandling(async (request: NextRequest) => {
  // Tu lógica aquí
});
```

## 📊 Logging de Errores

### **Información Registrada en Logs**

```typescript
{
  "timestamp": "2025-01-28T22:55:06.580Z",
  "level": "ERROR",
  "category": "API",
  "message": "Error occurred",
  "requestId": "req_1234567890_abc123",
  "ip": "192.168.1.xxx",
  "userAgent": "Mozilla/5.0...",
  "endpoint": "/api/auth/login",
  "method": "POST",
  "metadata": {
    "errorType": "AUTHENTICATION_ERROR",
    "statusCode": 401,
    "userId": "123...",
    "technicalDetails": {
      "errorName": "JsonWebTokenError",
      "errorMessage": "Invalid token",
      "stack": "Error: Invalid token\n    at verify..."
    }
  }
}
```

### **Información NO Registrada**

- ❌ Passwords o tokens completos
- ❌ Datos de tarjetas de crédito
- ❌ Información personal sensible
- ❌ Configuración del servidor
- ❌ Detalles internos de la aplicación

## 🎨 Páginas de Error Personalizadas

### **Página de Error General (`/error`)**

- **Diseño**: Card centrado con gradiente de fondo
- **Iconos**: Diferentes según tipo de error
- **Acciones**: Reintentar, volver, ir al inicio
- **Información**: Solo en desarrollo
- **Contacto**: Email de soporte

### **Página 404 (`/not-found`)**

- **Diseño**: Similar a error general
- **Enlaces útiles**: Login, registro, dashboard
- **Navegación**: Botones de acción claros
- **UX**: Mensaje amigable y útil

## 🔍 Desarrollo vs Producción

### **Desarrollo**

```json
{
  "success": false,
  "error": "Los datos proporcionados no son válidos",
  "details": "Por favor, revisa la información ingresada e intenta nuevamente",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123",
  "debug": {
    "type": "VALIDATION_ERROR",
    "technicalDetails": {
      "validationErrors": [...],
      "errorName": "ZodError",
      "errorMessage": "Validation failed"
    }
  }
}
```

### **Producción**

```json
{
  "success": false,
  "error": "Los datos proporcionados no son válidos",
  "details": "Por favor, revisa la información ingresada e intenta nuevamente",
  "timestamp": "2025-01-28T22:55:06.580Z",
  "requestId": "req_1234567890_abc123"
}
```

## 🚀 Beneficios Implementados

### **Seguridad**

- ✅ **Sin exposición de información técnica**
- ✅ **Logging detallado para debugging**
- ✅ **Sanitización automática de datos sensibles**
- ✅ **Categorización apropiada de errores**

### **UX/UI**

- ✅ **Mensajes de error amigables**
- ✅ **Páginas de error personalizadas**
- ✅ **Acciones claras para el usuario**
- ✅ **Información de contacto disponible**

### **Desarrollo**

- ✅ **Debugging facilitado en desarrollo**
- ✅ **Middleware reutilizable**
- ✅ **Tipado fuerte con TypeScript**
- ✅ **Documentación completa**

## 📈 Métricas de Seguridad

### **Estado Actual**

- **APIs con manejo seguro**: 3/3 ✅
- **Tipos de error cubiertos**: 9/9 ✅
- **Páginas de error personalizadas**: 2/2 ✅
- **Middleware implementado**: 4/4 ✅
- **Documentación completa**: ✅

### **Cobertura de Errores**

- **Validación**: ✅ Zod errors
- **Autenticación**: ✅ JWT errors
- **Autorización**: ✅ Permission errors
- **Base de datos**: ✅ PostgreSQL errors
- **Servicios externos**: ✅ API errors
- **Pagos**: ✅ Payment provider errors
- **Rate limiting**: ✅ Rate limit errors
- **Recursos**: ✅ 404 errors
- **Internos**: ✅ Generic errors

## 🎯 Próximos Pasos

### **Corto Plazo**

- [ ] Implementar en todas las APIs restantes
- [ ] Agregar métricas de errores
- [ ] Configurar alertas para errores críticos

### **Mediano Plazo**

- [ ] Dashboard de errores para administradores
- [ ] Análisis de patrones de errores
- [ ] Integración con servicios de monitoreo

### **Largo Plazo**

- [ ] Machine learning para detección de anomalías
- [ ] Auto-recuperación de errores transitorios
- [ ] Predicción de errores basada en patrones
