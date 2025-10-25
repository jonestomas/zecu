# 🔐 Variables de Entorno - Zecubot

## 📋 Configuración Completa

Copia este contenido en tu archivo `.env.local`:

\`\`\`bash

# ===========================================

# Supabase Configuration

# ===========================================

# URL de tu proyecto en Supabase

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Service Role Key (con privilegios administrativos)

# NO expongas esta clave en el frontend

# Encuéntrala en: Settings → API → service_role (secret)

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-key-here

# ===========================================

# JWT Secret for Session Tokens

# ===========================================

# Genera un secreto aleatorio con:

# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion

# ===========================================

# n8n Webhook for OTP Sending

# ===========================================

# URL del webhook de n8n que envía WhatsApp

# Formato: https://your-n8n-instance.com/webhook/send-otp

# Déjalo vacío en desarrollo para ver códigos en consola

N8N_WEBHOOK_SEND_OTP_URL=

# ===========================================

# Mercado Pago

# ===========================================

# Access Token de Mercado Pago

# Test: TEST-xxx (sandbox)

# Production: APP_USR-xxx (producción)

MERCADOPAGO_ACCESS_TOKEN=TEST-your-access-token-here

# URL base de tu aplicación (para webhooks y redirects)

NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ===========================================

# Twilio (para n8n workflow)

# ===========================================

# Estas credenciales NO se usan directamente en Next.js

# Se configuran en tu workflow de n8n

# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# TWILIO_AUTH_TOKEN=your-auth-token

# TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

\`\`\`

---

## 📝 Descripción Detallada

### NEXT_PUBLIC_SUPABASE_URL

**Tipo:** Público (puede exponerse en el frontend)  
**Dónde obtenerla:** Supabase Dashboard → Settings → API → Project URL

**Ejemplo:**
\`\`\`
https://abcdefghijklmnop.supabase.co
\`\`\`

---

### SUPABASE_SERVICE_ROLE_KEY

**Tipo:** ⚠️ SECRETO (NUNCA expongas en el frontend)  
**Dónde obtenerla:** Supabase Dashboard → Settings → API → service_role (secret)

**⚠️ Importante:**

- Esta clave tiene acceso completo a tu base de datos
- Solo úsala en el servidor (API Routes)
- Ignora Row Level Security (RLS)

**Ejemplo:**
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjk0NTYwMDAwLCJleHAiOjE4NTIyNDAwMDB9.xxx-signature-xxx
\`\`\`

---

### JWT_SECRET

**Tipo:** SECRETO  
**Propósito:** Firmar tokens de sesión (JWT)

**Generar:**
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

**Output ejemplo:**
\`\`\`
5f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a
\`\`\`

---

### N8N_WEBHOOK_SEND_OTP_URL

**Tipo:** Secreto (URL del webhook)  
**Propósito:** Enviar códigos OTP por WhatsApp vía n8n

**Formato:**
\`\`\`
https://tu-n8n-instance.com/webhook/send-otp
\`\`\`

**Desarrollo sin n8n:**

- Déjalo vacío o comenta la línea
- Los códigos OTP se imprimirán en la consola del servidor

**Producción:**

- Configura tu instancia de n8n
- Crea el webhook (ver `docs/N8N_WORKFLOW.md`)
- Pega la URL aquí

---

### MERCADOPAGO_ACCESS_TOKEN

**Tipo:** SECRETO  
**Dónde obtenerla:**

- Sandbox: [Mercado Pago Developers - Test Credentials](https://www.mercadopago.com.ar/developers/panel/credentials)
- Producción: [Mercado Pago Developers - Production Credentials](https://www.mercadopago.com.ar/developers/panel/credentials)

**Formatos:**

- **Test (Sandbox):** `TEST-1234567890123456-100000-abcdef123456789`
- **Producción:** `APP_USR-1234567890123456-100000-abcdef123456789`

**⚠️ Importante:**

- Usa TEST en desarrollo
- Cambia a APP_USR en producción
- NUNCA expongas estas credenciales en el código

---

### NEXT_PUBLIC_BASE_URL

**Tipo:** Público  
**Propósito:** URL base para webhooks y redirects de Mercado Pago

**Ejemplos:**
\`\`\`bash

# Desarrollo local

NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Producción en Vercel

NEXT_PUBLIC_BASE_URL=https://zecubot.vercel.app

# Dominio custom

NEXT_PUBLIC_BASE_URL=https://www.zecubot.com
\`\`\`

---

## 🚀 Setup Rápido

### 1. Copiar archivo de ejemplo

\`\`\`bash
cp docs/ENVIRONMENT_VARIABLES.md .env.local

# Edita .env.local con tus valores reales

\`\`\`

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto nuevo
3. Copia `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copia `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar JWT Secret

\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copia el output → JWT_SECRET

\`\`\`

### 4. Configurar Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una aplicación
3. Copia `Test Access Token` → `MERCADOPAGO_ACCESS_TOKEN`

### 5. (Opcional) Configurar n8n

1. Instala n8n (ver `docs/N8N_SETUP.md`)
2. Crea workflow de envío de WhatsApp
3. Copia URL del webhook → `N8N_WEBHOOK_SEND_OTP_URL`

---

## 🔒 Seguridad

### ✅ Buenas Prácticas

- ✅ Nunca commitees `.env.local` a git
- ✅ Usa variables diferentes para desarrollo/producción
- ✅ Rota las claves periódicamente (cada 90 días)
- ✅ Usa secretos de Vercel para producción
- ✅ No expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend

### ❌ Malas Prácticas

- ❌ Hardcodear credenciales en el código
- ❌ Usar las mismas claves en dev y prod
- ❌ Compartir `.env.local` por email/chat
- ❌ Exponer secretos en logs públicos
- ❌ Reutilizar secretos entre proyectos

---

## 🚢 Deploy en Vercel

### Configurar Variables en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable:

\`\`\`
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environment: Production, Preview, Development
\`\`\`

Repite para:

- `SUPABASE_SERVICE_ROLE_KEY` (solo Production y Preview)
- `JWT_SECRET` (genera uno nuevo para producción)
- `N8N_WEBHOOK_SEND_OTP_URL`
- `MERCADOPAGO_ACCESS_TOKEN` (usa APP_USR- en producción)
- `NEXT_PUBLIC_BASE_URL`

### Verificar Deploy

\`\`\`bash

# 1. Trigger redeploy

git push origin main

# 2. Verificar logs en Vercel

# Busca errores relacionados con variables faltantes

# 3. Test en producción

curl https://tu-app.vercel.app/api/auth/send-otp \
 -X POST \
 -H "Content-Type: application/json" \
 -d '{"phone": "+5491112345678"}'
\`\`\`

---

## 🧪 Testing

### Verificar Variables Localmente

\`\`\`bash

# Verificar que todas las variables están cargadas

node -e "
require('dotenv').config({ path: '.env.local' });
const vars = [
'NEXT_PUBLIC_SUPABASE_URL',
'SUPABASE_SERVICE_ROLE_KEY',
'JWT_SECRET',
'MERCADOPAGO_ACCESS_TOKEN',
'NEXT_PUBLIC_BASE_URL'
];
vars.forEach(v => {
const val = process.env[v];
console.log(\`\${v}: \${val ? '✅ Set' : '❌ Missing'}\`);
});
"
\`\`\`

---

## 📚 Referencias

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Última actualización:** Octubre 2025
