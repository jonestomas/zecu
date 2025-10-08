# 🔐 Guía Completa: Sistema de Autenticación OTP + Planes

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Arquitectura](#arquitectura)
3. [Base de Datos](#base-de-datos)
4. [APIs Implementadas](#apis-implementadas)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Configuración](#configuración)
7. [Integración con n8n](#integración-con-n8n)
8. [Testing](#testing)

---

## 📌 Resumen del Sistema

Sistema completo de autenticación sin contraseñas (passwordless) usando códigos OTP de 6 dígitos enviados por WhatsApp, integrado con planes de suscripción y Mercado Pago.

### Características Principales

- ✅ Autenticación sin contraseñas (OTP por WhatsApp)
- ✅ Registro unificado (una sola pantalla)
- ✅ Gestión de planes: Free y Plus
- ✅ Integración con Mercado Pago
- ✅ Creación automática de usuarios post-pago
- ✅ Sesiones con JWT tokens

---

## 🏗️ Arquitectura

\`\`\`
Frontend (Next.js)
    ↓
API Routes (/api/auth/*)
    ↓
Supabase (PostgreSQL)
    ↓
n8n Webhook → Twilio → WhatsApp
\`\`\`

### Componentes

1. **Frontend**: `/app/login`, `/app/register`, `/app/verify`
2. **Backend**: APIs en `/app/api/auth/*`
3. **Base de Datos**: Supabase (tablas `users` y `otp_codes`)
4. **Mensajería**: n8n + Twilio para envío de WhatsApp
5. **Pagos**: Mercado Pago + Webhook

---

## 💾 Base de Datos

### Tabla: `users`

\`\`\`sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'plus')),
  plan_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Campos:**
- `phone`: Número con código de país (ej: `+5491112345678`)
- `plan`: `'free'` o `'plus'`
- `plan_expires_at`: Fecha de expiración del plan Plus (null para Free)

### Tabla: `otp_codes`

\`\`\`sql
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Campos:**
- `code`: Código de 6 dígitos
- `expires_at`: Expira en 5 minutos
- `verified`: Marcado como `true` al verificarse
- `attempts`: Límite de 3 intentos

### Migraciones

Ejecuta en Supabase SQL Editor:

1. `supabase/migrations/001_create_users_table.sql`
2. `supabase/migrations/002_create_otp_codes_table.sql`

---

## 🔌 APIs Implementadas

### 1. `POST /api/auth/send-otp`

**Descripción:** Genera código OTP y lo envía por WhatsApp.

**Request:**
\`\`\`json
{
  "phone": "+5491112345678",
  "name": "Juan Pérez" // Opcional
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Código enviado exitosamente",
  "isNewUser": false,
  "expiresIn": 300
}
\`\`\`

**Flujo Interno:**
1. Valida formato de teléfono
2. Verifica si el usuario existe
3. Genera código de 6 dígitos
4. Guarda en tabla `otp_codes`
5. Llama webhook n8n para enviar WhatsApp
6. Responde al frontend

### 2. `POST /api/auth/verify-otp`

**Descripción:** Verifica código OTP y crea/actualiza sesión.

**Request:**
\`\`\`json
{
  "phone": "+5491112345678",
  "code": "123456",
  "name": "Juan Pérez" // Opcional para nuevos usuarios
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Verificación exitosa",
  "isNewUser": true,
  "user": {
    "id": "uuid",
    "phone": "+5491112345678",
    "name": "Juan Pérez",
    "plan": "free",
    "plan_expires_at": null
  }
}
\`\`\`

**Flujo Interno:**
1. Valida código en base de datos
2. Verifica que no esté expirado (< 5 min)
3. Verifica intentos (máx 3)
4. Si usuario no existe, lo crea con plan Free
5. Invalida todos los OTP anteriores del teléfono
6. Crea JWT token de sesión (30 días)
7. Establece cookie `session_token`

### 3. `POST /api/auth/update-profile`

**Descripción:** Actualiza nombre del usuario autenticado.

**Request:**
\`\`\`json
{
  "name": "Juan Pérez"
}
\`\`\`

**Headers:**
\`\`\`
Cookie: session_token=<JWT_TOKEN>
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "user": { /* datos del usuario */ }
}
\`\`\`

---

## 🚀 Flujos de Usuario

### Flujo 1: Usuario Nuevo - Plan Free

\`\`\`
1. Usuario → /login
2. Ingresa teléfono → [Enviar código]
3. POST /api/auth/send-otp
4. n8n → WhatsApp: "Tu código es 123456"
5. Usuario ingresa código → [Verificar]
6. POST /api/auth/verify-otp
7. ¿Usuario nuevo? → Pedir nombre
8. POST /api/auth/update-profile
9. → Dashboard (Plan Free activo)
\`\`\`

### Flujo 2: Usuario Existente - Login

\`\`\`
1. Usuario → /login
2. Ingresa teléfono → [Enviar código]
3. POST /api/auth/send-otp (isNewUser: false)
4. WhatsApp: "Tu código es 123456"
5. Usuario ingresa código → [Verificar]
6. POST /api/auth/verify-otp (isNewUser: false)
7. → Dashboard directo
\`\`\`

### Flujo 3: Compra Plan Plus SIN cuenta

\`\`\`
1. Usuario → Landing Page
2. Clic "Suscribirse a Plus"
3. → Mercado Pago (pago de AR$5.499)
4. Pago aprobado
5. Webhook POST /api/webhooks/mercadopago
6. Backend:
   - Crea usuario con plan Plus
   - Genera OTP
   - Envía WhatsApp: "Completá tu registro con código 123456"
7. Usuario → /login
8. Ingresa código recibido
9. POST /api/auth/verify-otp
10. → Dashboard (Plan Plus activo por 30 días)
\`\`\`

### Flujo 4: Upgrade a Plus CON cuenta

\`\`\`
1. Usuario con sesión activa
2. Clic "Suscribirse a Plus"
3. → Mercado Pago
4. Pago aprobado
5. Webhook actualiza: user.plan = 'plus'
6. → Dashboard (Plan Plus activo)
\`\`\`

---

## ⚙️ Configuración

### Variables de Entorno

Agrega a `.env.local`:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT para sesiones
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion

# n8n Webhook para envío de OTP
N8N_WEBHOOK_SEND_OTP_URL=https://tu-n8n-instance.com/webhook/send-otp

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
\`\`\`

### Instalación de Dependencias

\`\`\`bash
npm install jose @supabase/supabase-js
\`\`\`

---

## 🔗 Integración con n8n

### Webhook: Envío de OTP por WhatsApp

**URL del Webhook:** `https://tu-n8n-instance.com/webhook/send-otp`

**Método:** `POST`

**Request Body:**
\`\`\`json
{
  "phone": "+5491112345678",
  "code": "123456",
  "name": "Juan",
  "timestamp": "2025-10-07T..."
}
\`\`\`

### Workflow n8n Sugerido

\`\`\`
1. [Webhook] Recibe solicitud OTP
   ↓
2. [Function] Formatear mensaje
   ↓
3. [Twilio] Enviar WhatsApp
   - To: {{$json.phone}}
   - Body: "Hola {{$json.name}}! Tu código Zecubot es: {{$json.code}}"
   ↓
4. [Response] Confirmar envío
\`\`\`

### Configuración de Twilio

1. **Cuenta Twilio**: Crea en [twilio.com](https://twilio.com)
2. **WhatsApp Sandbox** (desarrollo): Activa en Console
3. **WhatsApp Business** (producción): Solicita aprobación
4. **Credenciales**:
   - Account SID
   - Auth Token
   - WhatsApp From Number (ej: `whatsapp:+14155238886`)

### Plantilla de Mensaje

\`\`\`
Hola {{name}}! 👋

Tu código de verificación para Zecubot es:

*{{code}}*

Este código expira en 5 minutos.

Si no solicitaste este código, ignora este mensaje.
\`\`\`

---

## 🧪 Testing

### Test Manual en Desarrollo

1. **Sin n8n configurado:**
   - Los códigos OTP se imprimen en la consola del servidor
   - Busca: `📱 [DESARROLLO] Código OTP para +5491112345678: 123456`

2. **Con n8n:**
   - Configura `N8N_WEBHOOK_SEND_OTP_URL` en `.env.local`
   - El código se enviará por WhatsApp real

### Test de Flujo Completo

\`\`\`bash
# 1. Iniciar servidor
npm run dev

# 2. Ir a http://localhost:3000/login

# 3. Ingresar teléfono de prueba
+5491112345678

# 4. Revisar consola del servidor para ver OTP
# O revisar WhatsApp si n8n está configurado

# 5. Ingresar código de 6 dígitos

# 6. Si es nuevo usuario, ingresar nombre

# 7. Verificar que redirige a /dashboard
\`\`\`

### Verificar Base de Datos

\`\`\`sql
-- Ver usuarios creados
SELECT * FROM public.users ORDER BY created_at DESC LIMIT 10;

-- Ver códigos OTP generados
SELECT * FROM public.otp_codes ORDER BY created_at DESC LIMIT 10;

-- Ver códigos OTP válidos (no vencidos, no verificados)
SELECT * FROM public.otp_codes 
WHERE expires_at > NOW() 
  AND verified = FALSE;
\`\`\`

---

## 🔒 Seguridad

### Implementado

- ✅ Códigos OTP de un solo uso
- ✅ Expiración de 5 minutos
- ✅ Límite de 3 intentos por código
- ✅ Validación de formato de teléfono
- ✅ Tokens JWT con expiración de 30 días
- ✅ Cookies HttpOnly
- ✅ Row Level Security (RLS) en Supabase

### Recomendaciones Adicionales

1. **Rate Limiting**: Limitar intentos por IP (10 por hora)
2. **CAPTCHA**: Agregar en producción para prevenir bots
3. **SSL/HTTPS**: Obligatorio en producción
4. **Monitoreo**: Alertas para intentos sospechosos

---

## 📱 Próximos Pasos

### Para Producción

1. ✅ Ejecutar migraciones en Supabase
2. ✅ Configurar n8n webhook
3. ✅ Configurar Twilio WhatsApp Business
4. ✅ Actualizar variables de entorno
5. ⬜ Agregar rate limiting
6. ⬜ Agregar logs de auditoría
7. ⬜ Configurar monitoreo (Sentry)
8. ⬜ Testing end-to-end (Playwright)

---

## 🆘 Troubleshooting

### Error: "Código inválido o expirado"

**Causa:** Código vencido o ya usado

**Solución:** Clic en "Reenviar código"

### Error: "No autenticado"

**Causa:** Cookie de sesión expirada

**Solución:** Volver a `/login`

### OTP no llega por WhatsApp

**Verificar:**
1. `N8N_WEBHOOK_SEND_OTP_URL` está configurada
2. n8n workflow está activo
3. Twilio tiene crédito
4. Número está en formato internacional (+54...)

---

## 📚 Referencias

- [Supabase Docs](https://supabase.com/docs)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [n8n Docs](https://docs.n8n.io/)
- [JWT.io](https://jwt.io/)

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0
