# 🧪 Guía de Testing en Desarrollo - Flujo de Autenticación y Pago

## 📋 Tabla de Contenidos

1. [Setup Inicial](#setup-inicial)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Levantar el Servidor](#levantar-el-servidor)
4. [Testing del Flujo OTP (Sin WhatsApp)](#testing-del-flujo-otp-sin-whatsapp)
5. [Testing del Flujo de Pago (Sandbox)](#testing-del-flujo-de-pago-sandbox)
6. [Testing del Flujo Completo](#testing-del-flujo-completo)
7. [Debugging y Troubleshooting](#debugging-y-troubleshooting)

---

## 🚀 Setup Inicial

### 1. Verificar Dependencias

```bash
# Verificar que Node.js esté instalado
node --version
# Debería mostrar: v18.x o superior

# Verificar que npm esté instalado
npm --version
```

### 2. Instalar Dependencias del Proyecto

```bash
# En la raíz del proyecto zecu
npm install
```

---

## 🔧 Configuración de Variables de Entorno

### 1. Crear archivo `.env.local`

En la raíz del proyecto, crea un archivo `.env.local`:

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# O manualmente: crear archivo .env.local
```

### 2. Configurar Variables Mínimas para Testing

Copia esto en tu `.env.local`:

```bash
# ===========================================
# SUPABASE (OBLIGATORIO)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# JWT (OBLIGATORIO)
# ===========================================
# Genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=tu-secreto-super-seguro-para-desarrollo

# ===========================================
# MERCADO PAGO (OBLIGATORIO para testing de pagos)
# ===========================================
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890123456-100000-abcdef123456789
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ===========================================
# N8N (OPCIONAL - déjalo vacío para testing local)
# ===========================================
# Si está vacío, los códigos OTP se mostrarán en la consola
N8N_WEBHOOK_SEND_OTP_URL=
```

### 3. Obtener Credenciales de Supabase

#### Opción A: Si ya tienes proyecto en Supabase

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role (secret)** → `SUPABASE_SERVICE_ROLE_KEY`

#### Opción B: Crear nuevo proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Click en "New Project"
3. Nombre: `zecu-dev`
4. Database Password: guarda bien esta password
5. Región: South America (sao paulo)
6. Espera 2-3 minutos mientras se crea
7. Ve a **Settings** → **API** y copia las credenciales

### 4. Ejecutar Migraciones de Base de Datos

```bash
# Opción 1: Usar Supabase CLI (recomendado)
# Si no tienes Supabase CLI:
npm install -g supabase

# Iniciar sesión
supabase login

# Link al proyecto
supabase link --project-ref tu-proyecto-ref

# Aplicar migraciones
supabase db push
```

**Opción 2: Manual (más fácil para testing rápido)**

1. Ve a tu proyecto en Supabase Dashboard
2. Click en **SQL Editor** (ícono de database en el menú izquierdo)
3. Copia y ejecuta estos scripts uno por uno:

**Script 1: Crear tabla `users`**

```sql
-- supabase/migrations/001_create_users_table.sql
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

-- Index para búsquedas rápidas por teléfono
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- Index para verificar planes activos
CREATE INDEX IF NOT EXISTS idx_users_plan_expires ON public.users(plan, plan_expires_at);
```

**Script 2: Crear tabla `otp_codes`**

```sql
-- supabase/migrations/002_create_otp_codes_table.sql
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_otp_phone_code ON public.otp_codes(phone, code);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.otp_codes(expires_at);
```

4. Click **Run** en cada script
5. Verifica que las tablas se crearon: ve a **Table Editor** y deberías ver `users` y `otp_codes`

### 5. Generar JWT Secret

```bash
# En PowerShell o terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output ejemplo:
# 5f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a
# Copia esto a JWT_SECRET en .env.local
```

### 6. Obtener Credenciales de Mercado Pago (para testing de pagos)

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel)
2. Crea cuenta si no tienes
3. Ve a **Tus integraciones** → **Crear aplicación**
4. Nombre: "Zecu Dev"
5. Ve a **Credenciales de prueba (Test)**
6. Copia **Access Token** → `MERCADOPAGO_ACCESS_TOKEN`
   - Debería empezar con `TEST-`

---

## 🏃 Levantar el Servidor

### 1. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Deberías ver:

```
▲ Next.js 14.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

### 2. Verificar que el servidor esté corriendo

Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

Deberías ver el landing page de Zecu.

---

## 🧪 Testing del Flujo OTP (Sin WhatsApp)

### Escenario 1: Registro de Usuario Nuevo

#### 1. Ir a la página de login

```
http://localhost:3000/login
```

#### 2. Ingresar un teléfono de prueba

**Formato:** `+54911XXXXXXXX` (Argentina)

Ejemplo: `+5491112345678`

#### 3. Ver el código OTP en la consola del servidor

En la terminal donde corre `npm run dev`, deberías ver:

```bash
⚠️ N8N_WEBHOOK_SEND_OTP_URL no configurada, saltando envío de WhatsApp
📱 [DESARROLLO] Código OTP para +5491112345678: 123456
✅ OTP enviado exitosamente a +5491112345678
```

**¡Ese es tu código!** Cópialo (ej: `123456`)

#### 4. Ingresar el código en el frontend

1. Pega el código en el input (ej: `123456`)
2. Click en "Verificar"
3. Si es usuario nuevo, te pedirá tu nombre
4. Ingresa un nombre (ej: "Juan Testing")
5. Click "Continuar"

#### 5. Verificar que el usuario se creó

Ve a Supabase Dashboard → **Table Editor** → **users**

Deberías ver:
- `phone`: `+5491112345678`
- `name`: `Juan Testing`
- `plan`: `free`
- `created_at`: timestamp actual

#### 6. Verificar la sesión

En el navegador:
1. Abre las **DevTools** (F12)
2. Ve a **Application** → **Cookies** → `http://localhost:3000`
3. Deberías ver una cookie `session_token`

---

## 💳 Testing del Flujo de Pago (Sandbox)

### Escenario 2: Usuario Autenticado Compra Plan Plus

#### 1. Ya debes estar autenticado

Si completaste el Escenario 1, ya tienes sesión activa.

Si no, haz login primero:
```
http://localhost:3000/login
→ Ingresa teléfono
→ Copia código de la consola
→ Verifica
```

#### 2. Ir al landing page

```
http://localhost:3000
```

Scroll hasta la sección de precios.

#### 3. Click en "Comenzar con Mercado Pago" (Plan Plus)

**Qué debería pasar:**

1. Se abre una página de "Procesando tu compra..." (`/checkout`)
2. Muestra el plan seleccionado: **Plus - AR$5.499**
3. Loading de 1-2 segundos
4. Redirige automáticamente a Mercado Pago

#### 4. En Mercado Pago (Sandbox)

Deberías ver el checkout de Mercado Pago con:

```
Plan Plus - Zecu
AR$ 5.499,00

[Pagar con tarjeta de crédito]
[Pagar con tarjeta de débito]
[Otros medios de pago]
```

#### 5. Usar tarjetas de prueba de Mercado Pago

**Tarjeta APROBADA:**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Titular: APRO
DNI: 12345678
```

**Otras tarjetas de prueba:**
- **RECHAZADA:** `5031 4332 1540 6351` + OTHE
- **PENDIENTE:** `5031 4332 1540 6351` + CALL

**Documentación completa:** [Mercado Pago Test Cards](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/integration-test/test-cards)

#### 6. Completar el pago

1. Ingresa datos de la tarjeta APROBADA
2. Click "Pagar"
3. Espera confirmación
4. Serás redirigido a `/payment/success`

#### 7. Verificar que el webhook se ejecutó

En la **consola del servidor** (`npm run dev`), deberías ver:

```bash
Webhook received: { type: 'payment', data: { id: 123456789 } }
Payment info: { id: 123456789, status: 'approved', ... }
✅ Pago aprobado: 123456789
📦 Metadata recibida: { user_id: 'uuid', user_phone: '+5491112345678', plan_id: 'plus' }
✅ Plan Plus activado para usuario uuid (+5491112345678)
```

#### 8. Verificar en la base de datos

Ve a Supabase Dashboard → **Table Editor** → **users**

Busca tu usuario (`+5491112345678`):
- `plan`: debería ser `plus` (cambió de `free`)
- `plan_expires_at`: debería tener una fecha 30 días en el futuro

---

## 🔄 Testing del Flujo Completo

### Escenario 3: Usuario NO Autenticado Intenta Comprar

#### 1. Cerrar sesión

En el navegador:
1. Abre **DevTools** (F12)
2. Ve a **Application** → **Cookies**
3. Elimina la cookie `session_token`
4. Recarga la página

#### 2. Click en "Comenzar con Mercado Pago"

**Qué debería pasar:**

1. Aparece un `confirm()` diciendo:
   ```
   Para suscribirte al plan Plus, primero necesitas crear una cuenta o iniciar sesión.
   ¡Es rápido y solo toma 1 minuto! 🚀
   
   ¿Quieres continuar?
   ```
2. Click "Aceptar"
3. Redirige a `/login`

#### 3. Hacer login con un teléfono NUEVO

Usa un teléfono diferente: `+5491187654321`

1. Ingresa teléfono
2. Copia código de la consola
3. Verifica
4. Ingresa nombre
5. Click "Continuar"

#### 4. Redirección automática a checkout

**Qué debería pasar:**

1. Después del login exitoso, detecta la `pendingPurchase` en `sessionStorage`
2. Redirige automáticamente a `/checkout`
3. Procesa la compra
4. Redirige a Mercado Pago

#### 5. Completar el pago

Usa la tarjeta de prueba APROBADA y completa el pago.

#### 6. Verificar que el plan se activó

Ve a Supabase y verifica que el usuario `+5491187654321` tiene `plan: 'plus'`.

---

## 🐛 Debugging y Troubleshooting

### Problema 1: "No estás autenticado"

**Síntoma:** Al hacer click en el botón de pago, aparece error de autenticación.

**Solución:**
1. Verifica que la cookie `session_token` exista
2. Verifica que `JWT_SECRET` esté configurado en `.env.local`
3. Haz login nuevamente

### Problema 2: "Error al crear la preferencia de pago"

**Síntoma:** Error al intentar crear el pago.

**Posibles causas:**
- `MERCADOPAGO_ACCESS_TOKEN` inválido o expirado
- `NEXT_PUBLIC_BASE_URL` no configurado

**Solución:**
1. Verifica las credenciales en `.env.local`
2. Recarga el servidor: `Ctrl+C` → `npm run dev`
3. Verifica en la consola del servidor si hay errores de Mercado Pago

### Problema 3: No aparece el código OTP en la consola

**Síntoma:** No se muestra el código en la terminal.

**Solución:**
1. Verifica que `N8N_WEBHOOK_SEND_OTP_URL` esté vacío o comentado
2. Busca en la consola: `📱 [DESARROLLO]`
3. Scroll hacia arriba en la terminal

### Problema 4: Usuario no encontrado en la base de datos

**Síntoma:** Después del OTP, no se crea el usuario.

**Solución:**
1. Verifica que las tablas `users` y `otp_codes` existan en Supabase
2. Verifica que `SUPABASE_SERVICE_ROLE_KEY` sea correcta
3. Ve a Supabase → **SQL Editor** y ejecuta:
   ```sql
   SELECT * FROM users WHERE phone = '+5491112345678';
   ```

### Problema 5: Webhook no se ejecuta después del pago

**Síntoma:** El pago se completa pero el plan no se activa.

**Causa:** En desarrollo local, Mercado Pago **NO PUEDE** enviar webhooks a `localhost`.

**Soluciones:**

#### Opción A: Simular webhook manualmente (testing rápido)

1. Ve a la consola del servidor después del pago
2. No verás el log del webhook porque MP no puede alcanzar localhost
3. **Simula el webhook manualmente:**

```bash
# En otra terminal, ejecuta:
curl http://localhost:3000/api/webhooks/mercadopago \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": 123456789
    }
  }'
```

**Nota:** Necesitas el ID real del pago que hiciste. Lo puedes obtener de:
- La URL de éxito: `/payment/success?payment_id=123456789`
- El dashboard de Mercado Pago

#### Opción B: Usar ngrok (testing completo)

```bash
# 1. Instalar ngrok
# Ve a https://ngrok.com y descarga

# 2. Autenticar (necesitas cuenta gratis)
ngrok authtoken tu-auth-token

# 3. Exponer localhost:3000
ngrok http 3000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

Luego actualiza `.env.local`:

```bash
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io
```

Reinicia el servidor y ahora Mercado Pago SÍ podrá enviar webhooks.

#### Opción C: Activar plan manualmente (testing de base de datos)

```sql
-- En Supabase SQL Editor
UPDATE users 
SET 
  plan = 'plus',
  plan_expires_at = NOW() + INTERVAL '30 days'
WHERE phone = '+5491112345678';
```

---

## 📊 Checklist de Testing Completo

### Testing Básico

- [ ] ✅ Servidor levanta sin errores
- [ ] ✅ Landing page carga correctamente
- [ ] ✅ Botón "Suscribirse a Plus" existe
- [ ] ✅ Página `/login` carga
- [ ] ✅ Página `/checkout` existe

### Testing de OTP

- [ ] ✅ Enviar OTP muestra código en consola
- [ ] ✅ Código OTP se guarda en tabla `otp_codes`
- [ ] ✅ Verificar OTP válido crea usuario
- [ ] ✅ Verificar OTP inválido muestra error
- [ ] ✅ Usuario nuevo se crea con `plan: 'free'`
- [ ] ✅ Cookie `session_token` se establece

### Testing de Autenticación

- [ ] ✅ Usuario autenticado ve botón de pago
- [ ] ✅ Usuario NO autenticado ve confirm
- [ ] ✅ Después de login, redirect automático a checkout
- [ ] ✅ Sesión persiste después de recargar página

### Testing de Pago

- [ ] ✅ Crear preferencia de pago funciona
- [ ] ✅ Redirect a Mercado Pago funciona
- [ ] ✅ Tarjeta de prueba APROBADA completa pago
- [ ] ✅ Redirect a `/payment/success` después del pago
- [ ] ✅ Plan se actualiza de `free` a `plus`
- [ ] ✅ `plan_expires_at` se establece a +30 días

### Testing de Seguridad

- [ ] ✅ Usuario sin sesión no puede crear pago
- [ ] ✅ Usuario con plan Plus activo no puede comprar de nuevo
- [ ] ✅ `pendingPurchase` expira después de 30 min

---

## 🎯 Flujo Típico de Testing (5 minutos)

```bash
1. npm run dev
2. Ir a http://localhost:3000
3. Click "Suscribirse a Plus" (sin login)
4. Confirmar → Redirige a /login
5. Ingresar +5491112345678
6. Copiar código de consola (ej: 123456)
7. Verificar código
8. Ingresar nombre "Test User"
9. Auto-redirect a /checkout
10. Auto-redirect a Mercado Pago
11. Usar tarjeta: 5031 7557 3453 0604 / 123 / 11/25 / APRO
12. Pagar → Success
13. Simular webhook:
    curl -X POST http://localhost:3000/api/webhooks/mercadopago \
      -H "Content-Type: application/json" \
      -d '{"type":"payment","data":{"id":PAYMENT_ID}}'
14. Verificar en Supabase: plan = 'plus' ✅
```

---

## 📝 Logs Importantes

### Frontend (Browser Console)

```javascript
// Verificar sesión
fetch('/api/auth/check-session')
  .then(r => r.json())
  .then(console.log)
// { authenticated: true, userId: '...', phone: '+54...' }

// Verificar pendingPurchase
console.log(JSON.parse(sessionStorage.getItem('pendingPurchase')))
// { planId: 'plus', planName: 'Plus', price: 'AR$5.499', timestamp: 1234567890 }
```

### Backend (Server Console)

```bash
# Login exitoso
✅ Nuevo usuario creado: +5491112345678
✅ Usuario existente verificado: +5491112345678

# Pago creado
✅ Preferencia de pago creada para usuario +5491112345678 (uuid)
💳 Preferencia creada: pref_123abc para usuario uuid

# Webhook recibido
📦 Metadata recibida: { user_id: 'uuid', user_phone: '+54...', plan_id: 'plus' }
✅ Plan Plus activado para usuario uuid (+5491112345678)
```

---

## 🚀 Siguiente Paso: Testing con WhatsApp Real

Para testing con WhatsApp real, necesitas configurar n8n + Twilio.

Ver: `docs/N8N_SETUP.md` (crear este archivo si quieres)

---

**¿Preguntas?** Cualquier error que encuentres, cópialo completo y te ayudo a debuggearlo.


