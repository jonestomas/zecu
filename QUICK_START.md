# 🚀 Quick Start - Zecu Development

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`bash
# Copia este template
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=genera-con-npm-run-generate-jwt
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890123456-100000-abcdef...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
N8N_WEBHOOK_SEND_OTP_URL=
\`\`\`

#### Generar JWT Secret:

\`\`\`bash
npm run generate-jwt
\`\`\`

Copia el output a `JWT_SECRET` en `.env.local`.

#### Obtener credenciales de Supabase:

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Crea o selecciona tu proyecto
3. Settings → API
4. Copia `Project URL` y `service_role (secret)`

#### Obtener credenciales de Mercado Pago:

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel)
2. Crea una aplicación
3. Copia el **Test Access Token** (empieza con `TEST-`)

### 3. Configurar base de datos

Ve a Supabase SQL Editor y ejecuta estos scripts:

**Tabla users:**

\`\`\`sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'plus')),
  plan_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_plan_expires ON public.users(plan, plan_expires_at);
\`\`\`

**Tabla otp_codes:**

\`\`\`sql
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_code ON public.otp_codes(phone, code);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.otp_codes(expires_at);
\`\`\`

### 4. Verificar configuración

\`\`\`bash
npm run check-env
\`\`\`

Deberías ver ✅ en todas las variables requeridas.

### 5. Iniciar servidor

\`\`\`bash
npm run dev
\`\`\`

O con verificación automática:

\`\`\`bash
npm run dev:check
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 🧪 Testing Rápido

### 1. Test de Login/Registro

\`\`\`bash
# 1. Ir a http://localhost:3000/login
# 2. Ingresar teléfono: +5491112345678
# 3. Ver código en consola del servidor
# 4. Copiar código (ej: 123456)
# 5. Verificar
# 6. Ingresar nombre
\`\`\`

**En la consola del servidor verás:**

\`\`\`
📱 [DESARROLLO] Código OTP para +5491112345678: 123456
\`\`\`

### 2. Test de Pago (Sandbox)

\`\`\`bash
# 1. Ir a http://localhost:3000
# 2. Click "Suscribirse a Plus"
# 3. Confirmar → Login si no estás autenticado
# 4. Redirige a Mercado Pago
# 5. Usar tarjeta de prueba:
#    Número: 5031 7557 3453 0604
#    CVV: 123
#    Fecha: 11/25
#    Nombre: APRO
# 6. Completar pago
# 7. Success! ✅
\`\`\`

**Simular webhook (porque localhost no recibe webhooks reales):**

\`\`\`bash
# En otra terminal
curl http://localhost:3000/api/webhooks/mercadopago \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":PAYMENT_ID_DEL_PASO_6}}'
\`\`\`

### 3. Verificar en Base de Datos

Ve a Supabase → Table Editor → `users`:

- `plan` debería ser `plus`
- `plan_expires_at` debería ser +30 días

---

## 📚 Documentación Completa

- **[TESTING_GUIDE_DEV.md](docs/TESTING_GUIDE_DEV.md)** - Guía detallada de testing
- **[AUTH_BEFORE_PAYMENT_FLOW.md](docs/AUTH_BEFORE_PAYMENT_FLOW.md)** - Flujo de autenticación y pago
- **[ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)** - Variables de entorno explicadas
- **[AUTH_OTP_COMPLETE_GUIDE.md](docs/AUTH_OTP_COMPLETE_GUIDE.md)** - Sistema OTP completo

---

## 🛠️ Scripts Útiles

\`\`\`bash
# Verificar variables de entorno
npm run check-env

# Generar JWT Secret
npm run generate-jwt

# Iniciar con verificación
npm run dev:check

# Build para producción
npm run build

# Linter
npm run lint
\`\`\`

---

## ❓ Problemas Comunes

### "No estás autenticado"

**Solución:** Elimina cookies y haz login de nuevo.

### "Error al crear preferencia de pago"

**Solución:** Verifica `MERCADOPAGO_ACCESS_TOKEN` en `.env.local`.

### Código OTP no aparece

**Solución:** Verifica que `N8N_WEBHOOK_SEND_OTP_URL` esté vacío o comentado.

### Webhook no se ejecuta

**Solución:** En desarrollo local, usa `curl` para simular el webhook (ver Testing Rápido).

---

## 🚀 Deploy a Producción

### Vercel

\`\`\`bash
# 1. Push a GitHub
git push origin main

# 2. Conectar en Vercel
# 3. Configurar variables de entorno en Vercel:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - SUPABASE_SERVICE_ROLE_KEY
#    - JWT_SECRET (genera uno nuevo)
#    - MERCADOPAGO_ACCESS_TOKEN (usa APP_USR-)
#    - NEXT_PUBLIC_BASE_URL (tu dominio de producción)
#    - N8N_WEBHOOK_SEND_OTP_URL

# 4. Deploy automático ✅
\`\`\`

---

## 📞 Soporte

¿Necesitas ayuda? Revisa la documentación en `docs/` o pregunta al equipo.

---

**Última actualización:** Octubre 2025
