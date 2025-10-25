# 📝 Sistema de Logging Seguro

## 🔒 Características de Seguridad

### **Ofuscación Automática**

- **Teléfonos**: `+5491134070204` → `+549****0204`
- **Emails**: `user@example.com` → `[REDACTED]`
- **Tokens**: `eyJhbGciOiJIUzI1NiIs...` → `[REDACTED]`
- **UUIDs**: `f1482290-c64f-45fc...` → `[REDACTED]`
- **IPs**: `192.168.1.100` → `192.168.1.xxx`

### **Campos Sensibles Detectados**

```typescript
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
];
```

## 📊 Niveles de Logging

### **Por Entorno**

- **Development**: DEBUG, INFO, WARN, ERROR, CRITICAL
- **Production**: INFO, WARN, ERROR, CRITICAL
- **Test**: ERROR, CRITICAL

### **Categorías**

- **AUTH**: Autenticación y autorización
- **PAYMENT**: Procesos de pago
- **API**: Requests y responses de APIs
- **SECURITY**: Eventos de seguridad
- **USER**: Acciones de usuario
- **SYSTEM**: Eventos del sistema
- **WEBHOOK**: Webhooks externos

## 🛠️ Uso del Logger

### **Logger Básico**

```typescript
import { createLogger } from '@/lib/secure-logging';

const logger = createLogger(request);

logger.info('AUTH', 'User logged in', { userId: '123' });
logger.error('PAYMENT', 'Payment failed', error, { amount: 100 });
logger.warn('SECURITY', 'Suspicious activity detected');
```

### **Logger de Autenticación**

```typescript
import { createAuthLogger } from '@/lib/secure-logging';

const authLogger = createAuthLogger();

authLogger.loginAttempt(request, phone, success);
authLogger.otpSent(request, phone);
authLogger.otpVerified(request, phone, success);
authLogger.sessionCreated(request, userId);
```

### **Logger de Webhooks**

```typescript
import { createWebhookLogger } from '@/lib/secure-logging';

const webhookLogger = createWebhookLogger('polar');

webhookLogger.received(request, metadata);
webhookLogger.processed(request, result);
webhookLogger.error(request, error);
```

## 📈 Formato de Logs

### **Desarrollo (Console)**

```
14:30:25 INFO     AUTH     [req_1234567890_abc123] User logged in
  Metadata: {
    "userId": "123...",
    "phone": "+549****0204"
  }
```

### **Producción (JSON)**

```json
{
  "timestamp": "2025-01-28T14:30:25.123Z",
  "level": "INFO",
  "category": "AUTH",
  "message": "User logged in",
  "requestId": "req_1234567890_abc123",
  "ip": "192.168.1.xxx",
  "userAgent": "Mozilla/5.0...",
  "endpoint": "/api/auth/login",
  "method": "POST",
  "metadata": {
    "userId": "123...",
    "phone": "[REDACTED]"
  }
}
```

## 🔍 APIs de Administración

### **Estadísticas de Logs**

```bash
GET /api/admin/logs?level=INFO&category=AUTH&hours=24
```

### **Configurar Logging**

```bash
POST /api/admin/logs
{
  "level": "WARN",
  "category": "SECURITY",
  "enabled": true
}
```

## ⚠️ Mejores Prácticas

### **✅ Hacer**

- Usar categorías apropiadas
- Incluir contexto relevante
- Ofuscar datos sensibles automáticamente
- Usar niveles apropiados

### **❌ No Hacer**

- Loggear passwords o tokens completos
- Loggear datos de tarjetas de crédito
- Usar console.log directamente
- Loggear información personal sin ofuscar

## 🚀 Integración con Servicios Externos

### **Configuración Futura**

```typescript
// En lib/logging-config.ts
externalServices: {
  datadog: { apiKey: process.env.DATADOG_API_KEY },
  cloudwatch: { region: process.env.AWS_REGION },
  sentry: { dsn: process.env.SENTRY_DSN }
}
```

## 📋 Checklist de Implementación

- [x] Sistema de ofuscación automática
- [x] Loggers especializados (auth, webhook, api)
- [x] Configuración por entorno
- [x] APIs de administración
- [x] Documentación completa
- [x] Integración en endpoints críticos
- [ ] Integración con servicios externos (futuro)
- [ ] Dashboard de monitoreo (futuro)
