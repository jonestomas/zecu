# 🛒 Nuevo Flujo de Compra: Registro ANTES de Pago

## 📋 Cambio Implementado

El flujo de compra ahora requiere que el usuario se registre/autentique **ANTES** de ir al checkout de Mercado Pago, en lugar de crear la cuenta después del pago.

---

## 🔄 Flujo Anterior vs Nuevo

### ❌ Flujo Anterior (Ya NO se usa)

```
Landing → "Suscribirse Plus" → Mercado Pago → Pago → 
Webhook crea usuario → Envía OTP → Login → Dashboard
```

**Problemas:**
- Usuarios fantasma si el pago falla
- No sabemos quién es el usuario hasta después del pago
- Más complejo de trackear

### ✅ Flujo Nuevo (Implementado)

```
Landing → "Suscribirse Plus" → Verificar Sesión →
[NO autenticado] → Login/Registro OTP → Checkout → 
Mercado Pago → Pago → Webhook actualiza plan → Dashboard
```

**Ventajas:**
- ✅ Usuario creado antes del pago
- ✅ No hay usuarios fantasma
- ✅ Mejor tracking y analytics
- ✅ Usuario ya autenticado cuando paga
- ✅ Experiencia más clara y profesional

---

## 🚀 Flujos Detallados

### Flujo 1: Usuario NUEVO compra Plan Plus

```
1. Usuario en landing page
   ↓
2. Clic en "Suscribirse a Plan Plus" (AR$5.499/mes)
   ↓
3. Frontend verifica sesión: GET /api/auth/check-session
   ↓ (No autenticado)
4. Guarda intención de compra en sessionStorage:
   {
     planId: "plus",
     planName: "Plan Plus",
     price: "AR$5.499",
     timestamp: 1696800000000
   }
   ↓
5. Redirige a /login
   ↓
6. Usuario ingresa teléfono → POST /api/auth/send-otp
   ↓
7. Recibe código OTP por WhatsApp
   ↓
8. Ingresa código → POST /api/auth/verify-otp
   ↓
9. Backend detecta isNewUser: true → Frontend pide nombre
   ↓
10. Usuario ingresa nombre → POST /api/auth/update-profile
    ↓
11. Frontend detecta pendingPurchase en sessionStorage
    ↓
12. Redirige a /checkout
    ↓
13. /checkout procesa compra pendiente:
    - Lee sessionStorage
    - POST /api/create-payment con planId
    - Limpia sessionStorage
    - Redirige a Mercado Pago
    ↓
14. Usuario paga en Mercado Pago
    ↓
15. Mercado Pago → Webhook POST /api/webhooks/mercadopago
    ↓
16. Webhook busca usuario por teléfono (ya existe)
    ↓
17. Actualiza plan: user.plan = 'plus', plan_expires_at = +30 días
    ↓
18. Mercado Pago redirige a /payment/success
    ↓
19. Usuario va a Dashboard → Ve Plan Plus activo ✅
```

### Flujo 2: Usuario EXISTENTE compra Plan Plus

```
1. Usuario en landing page (ya autenticado)
   ↓
2. Clic en "Suscribirse a Plan Plus"
   ↓
3. Frontend verifica sesión: GET /api/auth/check-session
   ↓ (Autenticado ✅)
4. POST /api/create-payment directamente
   ↓
5. Redirige a Mercado Pago
   ↓
6. Usuario paga
   ↓
7. Webhook actualiza plan del usuario
   ↓
8. Redirige a /payment/success
   ↓
9. Dashboard → Plan Plus activo ✅
```

### Flujo 3: Usuario se registra sin comprar (Plan Free)

```
1. Usuario → /login o /register
   ↓
2. Ingresa teléfono → POST /api/auth/send-otp
   ↓
3. Recibe OTP por WhatsApp
   ↓
4. Ingresa código → POST /api/auth/verify-otp
   ↓
5. isNewUser: true → Pide nombre
   ↓
6. POST /api/auth/update-profile
   ↓
7. NO hay pendingPurchase → Redirige a Dashboard
   ↓
8. Dashboard → Plan Free activo (gratis) ✅
```

---

## 🔧 Componentes Modificados

### 1. `components/payment-button.tsx`

**Antes:**
```typescript
// Creaba preferencia de pago directamente
await fetch("/api/create-payment", { ... })
```

**Ahora:**
```typescript
// Verifica sesión primero
const sessionCheck = await fetch("/api/auth/check-session")

if (!authenticated) {
  // Guarda intención y redirige a login
  sessionStorage.setItem("pendingPurchase", JSON.stringify({ planId, ... }))
  window.location.href = "/login"
} else {
  // Procede al pago
  await fetch("/api/create-payment", { ... })
}
```

### 2. `app/api/auth/check-session/route.ts` (NUEVO)

**Propósito:** Verificar si el usuario tiene sesión activa

```typescript
export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value
  const session = await verifySessionToken(sessionToken)
  
  return NextResponse.json({
    authenticated: !!session,
    userId: session?.userId,
    phone: session?.phone
  })
}
```

### 3. `app/checkout/page.tsx` (NUEVO)

**Propósito:** Página intermedia que procesa la compra pendiente y redirige a Mercado Pago

```typescript
useEffect(() => {
  const pendingPurchase = sessionStorage.getItem('pendingPurchase')
  
  if (pendingPurchase) {
    const { planId } = JSON.parse(pendingPurchase)
    
    // Crear preferencia de pago
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      body: JSON.stringify({ planId })
    })
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('pendingPurchase')
    
    // Redirigir a Mercado Pago
    window.location.href = initPoint
  }
}, [])
```

### 4. `app/login/page.tsx` y `app/verify/page.tsx`

**Modificación:** Después de verificación exitosa o actualización de perfil:

```typescript
// Verificar si hay compra pendiente
const pendingPurchase = sessionStorage.getItem('pendingPurchase')

if (pendingPurchase) {
  router.push('/checkout')  // Ir a procesar compra
} else {
  router.push('/dashboard')  // Ir al dashboard normal
}
```

### 5. `app/api/webhooks/mercadopago/route.ts`

**Modificación:** Ya no crea usuarios automáticamente, solo actualiza plan

```typescript
if (planId === 'plus') {
  const existingUser = await getUserByPhone(fullPhone)
  
  if (existingUser) {
    // Usuario existe - actualizar plan (caso normal)
    await updateUserPlan(fullPhone, 'plus')
  } else {
    // Usuario no existe - crear con Plus (fallback legacy)
    await createUser({ phone, email, plan: 'plus' })
    await sendOTPViaWhatsApp(fullPhone, otpCode)
  }
}
```

---

## 📊 Estados de sessionStorage

### `pendingPurchase`

**Estructura:**
```json
{
  "planId": "plus",
  "planName": "Plan Plus",
  "price": "AR$5.499",
  "timestamp": 1696800000000
}
```

**Cuándo se crea:**
- Al hacer clic en botón de pago sin estar autenticado

**Cuándo se limpia:**
- Al procesar la compra en `/checkout`
- Cuando el usuario cancela explícitamente

**Dónde se usa:**
- `components/payment-button.tsx` (escritura)
- `app/login/page.tsx` (lectura)
- `app/verify/page.tsx` (lectura)
- `app/checkout/page.tsx` (lectura y limpieza)

---

## 🧪 Testing

### Test del Flujo Completo

```bash
# 1. Iniciar servidor
npm run dev

# 2. Limpiar sessionStorage en DevTools
sessionStorage.clear()

# 3. Ir a http://localhost:3000

# 4. Scroll a "Suscripción" → Clic "Suscribirse a Plus"

# 5. Verificar redirección a /login
#    y que sessionStorage tiene "pendingPurchase"

# 6. Ingresar teléfono +5491112345678

# 7. Ver código OTP en consola del servidor

# 8. Ingresar código

# 9. Si es nuevo, ingresar nombre

# 10. Verificar redirección a /checkout

# 11. Verificar redirección automática a Mercado Pago (sandbox)

# 12. Completar pago en MP

# 13. Verificar webhook en logs del servidor

# 14. Verificar plan actualizado en Supabase:
SELECT * FROM users WHERE phone = '+5491112345678';
```

### Verificar sessionStorage

```javascript
// En DevTools Console
console.log(JSON.parse(sessionStorage.getItem('pendingPurchase')))
// Debería mostrar: { planId: "plus", planName: "Plan Plus", ... }
```

---

## 🚨 Edge Cases Manejados

### 1. Usuario cierra el navegador después de login pero antes de pagar

**Solución:** La intención de compra está en sessionStorage, se pierde al cerrar el navegador. El usuario puede volver a intentar comprar.

### 2. Usuario va directo a Mercado Pago (link compartido)

**Solución:** El webhook sigue funcionando. Si el usuario no existe, lo crea con Plan Plus y envía OTP (flujo legacy).

### 3. Usuario ya autenticado hace clic en botón de pago

**Solución:** No guarda `pendingPurchase`, va directo a Mercado Pago.

### 4. Usuario tiene `pendingPurchase` pero ya pagó

**Solución:** Al verificar OTP, detecta que ya tiene Plan Plus activo en la DB, ignora la compra pendiente.

---

## 📈 Mejoras Futuras

### Opción 1: Persistir intención en base de datos

En lugar de `sessionStorage`, guardar en tabla `pending_purchases`:

```sql
CREATE TABLE pending_purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_id VARCHAR(20),
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

**Ventaja:** Sobrevive al cierre del navegador

### Opción 2: Link mágico para retomar compra

Enviar email/WhatsApp con link:
```
https://zecubot.com/checkout?token=abc123
```

### Opción 3: Analytics de abandono

Trackear cuántos usuarios abandonan en cada paso:
- Login iniciado
- OTP enviado
- OTP verificado
- Nombre capturado
- Checkout cargado
- Pago completado

---

## 📚 Referencias

- Documentación completa: `docs/AUTH_OTP_COMPLETE_GUIDE.md`
- Variables de entorno: `docs/ENVIRONMENT_VARIABLES.md`
- Configuración Mercado Pago: `MERCADOPAGO_SETUP.md`

---

**Última actualización:** Octubre 2025  
**Versión del flujo:** 2.0.0 (Registro antes de pago)

