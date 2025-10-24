# 🧪 Guía de Testing - Flujos de Login y Suscripción

## 📋 Índice

1. [Preparación del entorno](#preparación-del-entorno)
2. [Camino 1: Testing de Login](#camino-1-testing-de-login)
3. [Camino 2: Testing de Suscripción](#camino-2-testing-de-suscripción)
4. [Casos de prueba completos](#casos-de-prueba-completos)
5. [Herramientas de debugging](#herramientas-de-debugging)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Preparación del entorno

### 1. Verificar que todo esté configurado

\`\`\`bash
# Verificar variables de entorno
npm run check-env

# Si falta algo, configurarlo en .env.local
\`\`\`

### 2. Levantar el servidor

\`\`\`bash
npm run dev
\`\`\`

Deberías ver:
\`\`\`
▲ Next.js 15.2.4
- Local:        http://localhost:3000
- Ready in 2.5s
\`\`\`

### 3. Preparar herramientas de testing

**Abrir 3 ventanas:**
1. **Navegador**: http://localhost:3000
2. **DevTools del navegador**: F12 (para ver console y cookies)
3. **Terminal del servidor**: Para ver logs del backend

### 4. Limpiar estado anterior (opcional)

\`\`\`javascript
// En la consola del navegador (DevTools):
// Limpiar sessionStorage
sessionStorage.clear()

// Limpiar cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Recargar página
location.reload()
\`\`\`

---

## 🎯 Camino 1: Testing de Login

### Caso 1.1: Usuario nuevo - Plan Free

**Objetivo:** Usuario nuevo se registra y elige plan Free

**Pasos:**

1. **Ir a login**
   \`\`\`
   http://localhost:3000/login
   \`\`\`

2. **Ingresar teléfono**
   - Código de país: `+54` (Argentina)
   - Teléfono: `1112345678` (cualquier número único)
   - Click "Enviar código"

3. **Ver código OTP en la terminal del servidor**
   \`\`\`bash
   📱 [DESARROLLO] Código OTP para +541112345678: 123456
   \`\`\`
   - Copia el código (ej: `123456`)

4. **Ingresar código OTP**
   - Pega el código en los 6 inputs
   - Click "Verificar"

5. **Completar perfil**
   - Nombre: "Test User"
   - País: "Argentina"
   - Ciudad: "Buenos Aires"
   - Click "Continuar"

6. **Seleccionar plan Free**
   - Click "Comenzar gratis"

7. **Verificar redirect a /welcome**
   - URL debería ser: `http://localhost:3000/welcome`
   - Debería mostrar: "¡Bienvenido, Test User!"
   - Plan activo: "Free"

**Verificación en Supabase:**
\`\`\`sql
SELECT * FROM users WHERE phone = '+541112345678';
\`\`\`

Debería mostrar:
- `name`: Test User
- `country`: Argentina
- `city`: Buenos Aires
- `plan`: free
- `plan_expires_at`: NULL

**✅ Resultado esperado:** Usuario creado con plan Free y redirigido a /welcome

---

### Caso 1.2: Usuario nuevo - Plan Plus

**Objetivo:** Usuario nuevo se registra y elige plan Plus (pagar)

**Pasos:**

1-5. (Igual que Caso 1.1)

6. **Seleccionar plan Plus**
   - Click "Comenzar con Mercado Pago"

7. **Verificar redirect a /checkout**
   - URL: `http://localhost:3000/checkout`
   - Loading: "Procesando tu compra del Plus (AR$5.499)..."

8. **Redirect automático a Mercado Pago**
   - URL: `https://www.mercadopago.com.ar/checkout/...` (sandbox)

9. **Completar pago con tarjeta de prueba**
   \`\`\`
   Número: 5031 7557 3453 0604
   CVV: 123
   Fecha: 11/25
   Titular: APRO
   DNI: 12345678
   \`\`\`

10. **Click "Pagar"**

11. **Verificar redirect a /payment/success**
    - Mensaje: "¡Pago Exitoso!"
    - Auto-redirect a /welcome en 3 segundos

12. **Simular webhook (importante en localhost)**
    \`\`\`bash
    # En otra terminal
    # Reemplaza PAYMENT_ID con el ID real del pago (lo ves en la URL de success)
    curl http://localhost:3000/api/webhooks/mercadopago \
      -X POST \
      -H "Content-Type: application/json" \
      -d "{\"type\":\"payment\",\"data\":{\"id\":PAYMENT_ID}}"
    \`\`\`

**Verificación en Supabase:**
\`\`\`sql
SELECT * FROM users WHERE phone = '+541112345678';
\`\`\`

Debería mostrar:
- `plan`: plus
- `plan_expires_at`: fecha 30 días adelante

**✅ Resultado esperado:** Usuario creado con plan Plus pagado y redirigido a /welcome

---

### Caso 1.3: Usuario existente sin plan

**Objetivo:** Usuario que ya hizo login pero no seleccionó plan

**Pasos:**

1. **Crear usuario sin plan completado**
   \`\`\`sql
   -- En Supabase SQL Editor
   INSERT INTO users (phone, name, plan)
   VALUES ('+541187654321', NULL, 'free');
   \`\`\`

2. **Ir a login**
   \`\`\`
   http://localhost:3000/login
   \`\`\`

3. **Ingresar teléfono existente**
   - Teléfono: `1187654321`
   - Click "Enviar código"

4. **Verificar OTP y continuar**
   - Ver código en terminal
   - Ingresar código

5. **Verificar que muestra "Seleccionar plan"**
   - NO debería pedir nombre/país/ciudad
   - Directamente muestra: Free vs Plus

6. **Seleccionar cualquier plan**

**✅ Resultado esperado:** Usuario sin nombre salta perfil y va directo a selección de plan

---

### Caso 1.4: Usuario existente con plan activo

**Objetivo:** Usuario que ya tiene plan activo va directo al dashboard

**Pasos:**

1. **Usar usuario del Caso 1.1 (que ya tiene plan Free)**
   - Teléfono: `+541112345678`

2. **Hacer login**
   \`\`\`
   http://localhost:3000/login
   \`\`\`

3. **Ingresar teléfono y OTP**

4. **Verificar redirect directo a /dashboard**
   - URL: `http://localhost:3000/dashboard`
   - Muestra plan activo: "Free"
   - Muestra nombre: "Test User"

**✅ Resultado esperado:** Usuario con plan va directo al dashboard sin pasar por selección

---

## 🛒 Camino 2: Testing de Suscripción

### Caso 2.1: Usuario NO autenticado - Click Free desde Landing

**Objetivo:** Usuario sin sesión hace click en "Comenzar gratis ahora"

**Pasos:**

1. **Ir al landing**
   \`\`\`
   http://localhost:3000
   \`\`\`

2. **Asegurarse de NO tener sesión activa**
   \`\`\`javascript
   // En consola del navegador
   document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
   location.reload()
   \`\`\`

3. **Scroll hasta la sección de precios**

4. **Click "Comenzar gratis ahora" (Plan Free)**

5. **Verificar alert/confirm**
   - Mensaje: "Para activar el plan Free, primero necesitas crear una cuenta..."
   - Click "Aceptar"

6. **Verificar que guarda pendingPurchase**
   \`\`\`javascript
   // En consola del navegador
   JSON.parse(sessionStorage.getItem('pendingPurchase'))
   \`\`\`
   
   Debería mostrar:
   \`\`\`json
   {
     "planId": "free",
     "planName": "Free",
     "price": "AR$0",
     "timestamp": 1234567890123
   }
   \`\`\`

7. **Redirect a /login**

8. **Completar login (OTP + Perfil)**

9. **Después de completar perfil, verificar auto-activación**
   - NO debería mostrar "Seleccionar plan"
   - Directamente activa el plan Free
   - Redirect a /welcome

**✅ Resultado esperado:** Flujo completo de registro + activación automática de plan Free

---

### Caso 2.2: Usuario NO autenticado - Click Plus desde Landing

**Objetivo:** Usuario sin sesión hace click en "Comenzar con Mercado Pago"

**Pasos:**

1-3. (Igual que Caso 2.1)

4. **Click "Comenzar con Mercado Pago" (Plan Plus)**

5. **Verificar alert/confirm**
   - Mensaje: "Para suscribirte al plan Plus, primero necesitas crear una cuenta..."
   - Click "Aceptar"

6. **Verificar que guarda pendingPurchase**
   \`\`\`javascript
   JSON.parse(sessionStorage.getItem('pendingPurchase'))
   \`\`\`
   
   Debería mostrar:
   \`\`\`json
   {
     "planId": "plus",
     "planName": "Plus",
     "price": "AR$5.499",
     "timestamp": 1234567890123
   }
   \`\`\`

7. **Redirect a /login**

8. **Completar login (OTP + Perfil)**

9. **Después de completar perfil, verificar auto-redirect a checkout**
   - NO debería mostrar "Seleccionar plan"
   - Directamente va a /checkout
   - Luego a Mercado Pago

10. **Completar pago**

11. **Verificar redirect a /welcome**

**✅ Resultado esperado:** Flujo completo de registro + pago + activación de plan Plus

---

### Caso 2.3: Usuario autenticado - Click Free desde Landing

**Objetivo:** Usuario con sesión activa hace click en plan Free

**Pasos:**

1. **Tener sesión activa** (login previo)
   - Verificar cookie en DevTools → Application → Cookies
   - Debería existir: `session_token`

2. **Ir al landing**
   \`\`\`
   http://localhost:3000
   \`\`\`

3. **Click "Comenzar gratis ahora" (Plan Free)**

4. **Verificar activación inmediata**
   - NO hay alert/confirm
   - Loading: "Procesando..."
   - Redirect directo a /welcome

**Verificación en consola del servidor:**
\`\`\`bash
✅ Plan Free activado para usuario: +541112345678 (uuid-...)
\`\`\`

**✅ Resultado esperado:** Activación instantánea sin pasar por login

---

### Caso 2.4: Usuario autenticado - Click Plus desde Landing

**Objetivo:** Usuario con sesión activa hace click en plan Plus

**Pasos:**

1. **Tener sesión activa** (login previo)

2. **Ir al landing**
   \`\`\`
   http://localhost:3000
   \`\`\`

3. **Click "Comenzar con Mercado Pago" (Plan Plus)**

4. **Verificar redirect inmediato a checkout**
   - NO hay alert/confirm
   - Loading: "Procesando..."
   - Redirect a /checkout
   - Luego a Mercado Pago

5. **Completar pago**

6. **Verificar activación**

**✅ Resultado esperado:** Pago instantáneo sin pasar por login

---

## 📊 Casos de prueba completos

### Matriz de testing

| Caso | Usuario | Acción | Tiene sesión? | Plan actual | Resultado esperado |
|------|---------|--------|---------------|-------------|-------------------|
| 1.1 | Nuevo | Login → Free | No | - | Registro → Perfil → Free → /welcome |
| 1.2 | Nuevo | Login → Plus | No | - | Registro → Perfil → Pago → /welcome |
| 1.3 | Existente | Login | No | Sin plan | OTP → Seleccionar plan |
| 1.4 | Existente | Login | No | Free/Plus | OTP → /dashboard |
| 2.1 | No auth | Landing Free | No | - | Confirm → Login → Free → /welcome |
| 2.2 | No auth | Landing Plus | No | - | Confirm → Login → Pago → /welcome |
| 2.3 | Auth | Landing Free | Sí | Free/Plus | Activar Free → /welcome |
| 2.4 | Auth | Landing Plus | Sí | Free | Pago → /welcome |
| 2.5 | Auth | Landing Plus | Sí | Plus activo | Error: "Ya tienes plan Plus" |

---

## 🔧 Herramientas de debugging

### 1. Verificar estado de sesión

\`\`\`javascript
// En consola del navegador
fetch('/api/auth/check-session')
  .then(r => r.json())
  .then(console.log)
\`\`\`

Respuesta:
\`\`\`json
{
  "authenticated": true,
  "userId": "uuid-...",
  "phone": "+541112345678",
  "name": "Test User",
  "plan": "free",
  "plan_expires_at": null
}
\`\`\`

### 2. Ver pendingPurchase

\`\`\`javascript
// En consola del navegador
console.log(JSON.parse(sessionStorage.getItem('pendingPurchase')))
\`\`\`

### 3. Ver logs del servidor en tiempo real

\`\`\`bash
# Terminal donde corre npm run dev
# Busca estos logs:

# OTP generado
📱 [DESARROLLO] Código OTP para +5491112345678: 123456

# Usuario verificado
✅ Usuario existente verificado: +5491112345678
📊 hasSubscription: true (nombre: Test User)

# Plan activado
✅ Plan Free activado para usuario: +5491112345678 (uuid-...)

# Pago procesado
✅ Pago aprobado: 123456789
✅ Plan Plus activado para usuario uuid (+5491112345678)
\`\`\`

### 4. Queries útiles en Supabase

\`\`\`sql
-- Ver todos los usuarios
SELECT 
  phone, 
  name, 
  plan, 
  plan_expires_at, 
  created_at 
FROM users 
ORDER BY created_at DESC;

-- Ver códigos OTP recientes
SELECT 
  phone, 
  code, 
  expires_at, 
  verified,
  created_at 
FROM otp_codes 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Limpiar usuario de prueba
DELETE FROM users WHERE phone = '+541112345678';
DELETE FROM otp_codes WHERE phone = '+541112345678';
\`\`\`

---

## 🐛 Troubleshooting

### Problema 1: No aparece el código OTP en la consola

**Síntomas:**
- No ves `📱 [DESARROLLO]` en la terminal

**Soluciones:**
1. Verifica que `N8N_WEBHOOK_SEND_OTP_URL` esté vacío en `.env.local`
2. Scroll hacia arriba en la terminal
3. Reinicia el servidor: `Ctrl+C` → `npm run dev`

---

### Problema 2: "No estás autenticado" al hacer clic en plan

**Síntomas:**
- Error al intentar activar plan o crear pago

**Soluciones:**
1. Verifica que la cookie `session_token` exista:
   \`\`\`javascript
   document.cookie
   \`\`\`
2. Verifica sesión:
   \`\`\`javascript
   fetch('/api/auth/check-session').then(r => r.json()).then(console.log)
   \`\`\`
3. Si no hay sesión, haz login de nuevo

---

### Problema 3: Webhook no se ejecuta después del pago

**Síntomas:**
- Pago completa pero el plan no se activa

**Causa:**
- Mercado Pago NO puede enviar webhooks a `localhost`

**Solución:**
\`\`\`bash
# Simular webhook manualmente
curl http://localhost:3000/api/webhooks/mercadopago \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":PAYMENT_ID}}'
\`\`\`

Obtén el `PAYMENT_ID` de:
- URL de success: `/payment/success?payment_id=123456789`
- Logs del servidor
- Dashboard de Mercado Pago

---

### Problema 4: Usuario se queda en "Seleccionar plan" después de login

**Síntomas:**
- Completó OTP y perfil pero no detecta `pendingPurchase`

**Soluciones:**
1. Verifica que `pendingPurchase` esté en sessionStorage:
   \`\`\`javascript
   sessionStorage.getItem('pendingPurchase')
   \`\`\`
2. Verifica que no haya expirado (timestamp < 30 min)
3. Si falta, haz el flujo de nuevo desde el landing

---

### Problema 5: Error "Ya tienes un plan Plus activo"

**Síntomas:**
- Usuario con plan Plus intenta comprar de nuevo

**Solución:**
- Esto es correcto, es una validación
- Si quieres testear de nuevo:
  \`\`\`sql
  -- Expirar el plan manualmente
  UPDATE users 
  SET plan_expires_at = NOW() - INTERVAL '1 day'
  WHERE phone = '+541112345678';
  \`\`\`

---

## ✅ Checklist de testing completo

### Testing básico (5-10 minutos)

- [ ] Caso 1.1: Usuario nuevo → Free
- [ ] Caso 1.2: Usuario nuevo → Plus
- [ ] Caso 2.3: Usuario auth → Free desde landing
- [ ] Caso 2.4: Usuario auth → Plus desde landing

### Testing completo (20-30 minutos)

- [ ] Todos los casos de 1.1 a 1.4
- [ ] Todos los casos de 2.1 a 2.5
- [ ] Verificar datos en Supabase después de cada caso
- [ ] Verificar logs del servidor en cada paso
- [ ] Limpiar datos de prueba al final

---

## 📝 Template de reporte de bugs

Si encuentras un bug, repórtalo con este formato:

\`\`\`markdown
### Bug: [Título descriptivo]

**Caso de prueba:** Caso X.X

**Pasos para reproducir:**
1. ...
2. ...
3. ...

**Resultado esperado:**
...

**Resultado actual:**
...

**Logs del servidor:**
\`\`\`
[pegar logs relevantes]
\`\`\`

**Estado en Supabase:**
\`\`\`sql
[query y resultado]
\`\`\`

**Screenshots:**
[Si aplica]
\`\`\`

---

**Última actualización:** Octubre 2025
