# 🔐 Flujo de Autenticación Antes de Pago

## 📋 Resumen

Sistema implementado donde el usuario **DEBE** registrarse o autenticarse **ANTES** de ir al checkout de Mercado Pago. Esto garantiza que:

✅ Todos los pagos estén asociados a un usuario existente  
✅ No haya usuarios "fantasma" creados después del pago  
✅ El tracking sea más preciso  
✅ La experiencia del usuario sea más clara  

---

## 🔄 Flujo Completo

### 1️⃣ Usuario en Landing Page

El usuario navega por el landing y ve el plan Plus (AR$5.499/mes).

```
┌─────────────────────────────────┐
│   Landing Page (app/page.tsx)   │
│                                  │
│   Plan Plus: AR$5.499/mes       │
│   [Suscribirse a Plus]          │
└─────────────────────────────────┘
```

### 2️⃣ Click en "Suscribirse a Plus"

El botón `PlusPlanPaymentButton` verifica si el usuario está autenticado.

**Componente**: `components/payment-button.tsx`

```typescript
const handlePayment = async () => {
  // 1. Verificar sesión
  const sessionCheck = await fetch("/api/auth/check-session")
  const { authenticated } = await sessionCheck.json()

  if (!authenticated) {
    // Guardar intención de compra
    sessionStorage.setItem("pendingPurchase", JSON.stringify({
      planId: "plus",
      planName: "Plus",
      price: "AR$5.499",
      timestamp: Date.now()
    }))
    
    // Redirigir a login
    window.location.href = "/login"
    return
  }

  // Usuario autenticado → Continuar al pago
  // ...
}
```

### 3️⃣ Usuario NO Autenticado → Login/Registro

Si el usuario no está autenticado, se le redirige a `/login`.

**Flujo de autenticación OTP:**

```
1. Usuario ingresa teléfono (+54911...)
   ↓
2. POST /api/auth/send-otp
   - Genera código de 6 dígitos
   - Guarda en tabla `otp_codes`
   - Envía por WhatsApp (vía n8n → Twilio)
   ↓
3. Usuario recibe WhatsApp:
   "Hola! Tu código Zecubot es: 123456"
   ↓
4. Usuario ingresa código
   ↓
5. POST /api/auth/verify-otp
   - Verifica código
   - Si es nuevo usuario: crea registro en `users` (plan: free)
   - Si es usuario existente: valida
   - Crea JWT session token
   - Establece cookie `session_token`
   ↓
6. Usuario autenticado ✅
```

### 4️⃣ Checkout Automático

Después del login exitoso, el frontend detecta la `pendingPurchase` en `sessionStorage` y redirige a `/checkout`.

**Página**: `app/checkout/page.tsx`

```typescript
useEffect(() => {
  const processPendingPurchase = async () => {
    // 1. Verificar autenticación
    const { authenticated } = await fetch("/api/auth/check-session").then(r => r.json())
    
    // 2. Obtener compra pendiente
    const purchase = JSON.parse(sessionStorage.getItem("pendingPurchase"))
    
    // 3. Crear preferencia de pago
    const { initPoint } = await fetch("/api/create-payment", {
      method: "POST",
      body: JSON.stringify({ planId: purchase.planId })
    }).then(r => r.json())
    
    // 4. Limpiar pendingPurchase
    sessionStorage.removeItem("pendingPurchase")
    
    // 5. Redirigir a Mercado Pago
    window.location.href = initPoint
  }
  
  processPendingPurchase()
}, [])
```

### 5️⃣ Crear Preferencia de Pago (Backend)

**API**: `app/api/create-payment/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // 1. Verificar JWT token en cookie
  const sessionToken = request.cookies.get('session_token')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const session = await verifySessionToken(sessionToken)
  
  // 2. Obtener usuario de la base de datos
  const user = await getUserByPhone(session.phone)
  
  // 3. Validar que no tenga plan Plus activo
  if (user.plan === 'plus' && user.plan_expires_at > new Date()) {
    return NextResponse.json({ error: 'Ya tienes plan Plus' }, { status: 400 })
  }
  
  // 4. Crear preferencia con metadata del usuario
  const preference = await createPaymentPreference(planId, user.email, {
    userId: user.id,
    phone: user.phone,
    name: user.name
  })
  
  return NextResponse.json({
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point
  })
}
```

**Metadata enviada a Mercado Pago:**

```json
{
  "metadata": {
    "user_id": "uuid-del-usuario",
    "user_phone": "+5491112345678",
    "plan_id": "plus"
  },
  "external_reference": "zecu-plus-uuid-del-usuario-1696800000"
}
```

### 6️⃣ Usuario Paga en Mercado Pago

El usuario completa el pago en el checkout de Mercado Pago.

```
┌─────────────────────────────────┐
│   Mercado Pago Checkout         │
│                                  │
│   Plan Plus - Zecu              │
│   AR$ 5.499                     │
│                                  │
│   [Pagar con tarjeta]           │
└─────────────────────────────────┘
```

### 7️⃣ Webhook de Mercado Pago

Cuando el pago es aprobado, Mercado Pago envía un webhook.

**API**: `app/api/webhooks/mercadopago/route.ts`

```typescript
async function handleApprovedPayment(paymentInfo: any) {
  // 1. Extraer metadata
  const metadata = paymentInfo.metadata
  const userId = metadata.user_id
  const userPhone = metadata.user_phone
  const planId = metadata.plan_id
  
  // 2. Buscar usuario en base de datos
  const user = await getUserByPhone(userPhone)
  
  // 3. Verificar que el userId coincida (seguridad)
  if (user.id === userId) {
    // 4. Activar plan Plus
    await updateUserPlan(userPhone, 'plus')
    // plan_expires_at = now + 30 días
    
    // 5. Guardar registro de compra
    await savePurchaseToDatabase({
      userId: user.id,
      planId,
      amount: paymentInfo.transaction_amount,
      paymentId: paymentInfo.id
    })
    
    console.log(`✅ Plan Plus activado para ${userPhone}`)
  }
}
```

### 8️⃣ Página de Éxito

El usuario es redirigido a `/payment/success`.

```
┌─────────────────────────────────┐
│   ✅ Pago Exitoso               │
│                                  │
│   ¡Bienvenido al Plan Plus!     │
│   Tu plan está activo.          │
│                                  │
│   [Ir al Dashboard]             │
└─────────────────────────────────┘
```

---

## 🗂️ Archivos Modificados

### Frontend

1. **`components/payment-button.tsx`**
   - Verifica autenticación antes de crear pago
   - Guarda `pendingPurchase` en sessionStorage
   - Redirige a `/login` si no autenticado

2. **`app/checkout/page.tsx`** (NUEVO)
   - Página intermedia que procesa compra pendiente
   - Verifica autenticación
   - Crea preferencia de pago
   - Redirige a Mercado Pago

### Backend

3. **`app/api/create-payment/route.ts`**
   - Verifica JWT token en cookie
   - Obtiene usuario de la base de datos
   - Valida que no tenga plan activo
   - Incluye metadata del usuario en la preferencia

4. **`lib/mercadopago.ts`**
   - Acepta `UserPaymentData` como tercer parámetro
   - Incluye `user_id`, `user_phone`, `plan_id` en metadata
   - Agrega datos del usuario a `payer`

5. **`app/api/webhooks/mercadopago/route.ts`**
   - Lee metadata del pago
   - Verifica que el `user_id` coincida
   - Actualiza plan del usuario existente
   - Fallback a flujo legacy si no hay metadata

---

## 🔐 Seguridad

### Validaciones Implementadas

✅ **JWT Token**: Cookie `session_token` con expiración de 30 días  
✅ **Verificación de Usuario**: El `user_id` en metadata debe coincidir con el de la DB  
✅ **Plan Activo**: No permite comprar si ya tiene plan Plus activo  
✅ **Expiración de Compra**: `pendingPurchase` expira en 30 minutos  
✅ **Webhook Seguro**: Verifica que los datos del pago coincidan con el usuario  

### Flujo Legacy (Fallback)

Si por alguna razón no llega la metadata (ej: pago directo desde MP), el webhook ejecuta el flujo legacy:

- Lee teléfono del `payer.phone`
- Busca o crea usuario
- Activa plan Plus
- Envía OTP si es usuario nuevo

---

## 📊 Diagrama de Flujo Completo

```
┌──────────────┐
│ Landing Page │
└──────┬───────┘
       │ Click "Suscribirse a Plus"
       ↓
┌──────────────────────┐
│ PaymentButton        │
│ Verifica sesión      │
└──────┬───────────────┘
       │
       ├─→ NO autenticado
       │   ├─→ Guarda pendingPurchase
       │   └─→ Redirige a /login
       │       ↓
       │   ┌───────────────┐
       │   │ Login + OTP   │
       │   └───────┬───────┘
       │           │ Sesión creada
       │           ↓
       │   ┌───────────────────┐
       │   │ /checkout         │
       │   │ Procesa compra    │
       │   └───────┬───────────┘
       │           │
       └─→ SÍ autenticado
               │
               ↓
       ┌──────────────────────┐
       │ POST /create-payment │
       │ + JWT validation     │
       │ + User data          │
       └──────┬───────────────┘
              │ Preferencia con metadata
              ↓
       ┌──────────────────────┐
       │ Mercado Pago         │
       │ Checkout             │
       └──────┬───────────────┘
              │ Usuario paga
              ↓
       ┌──────────────────────┐
       │ Webhook MP           │
       │ Lee metadata         │
       │ Activa plan Plus     │
       └──────┬───────────────┘
              │
              ↓
       ┌──────────────────────┐
       │ /payment/success     │
       │ Plan activado ✅     │
       └──────────────────────┘
```

---

## 🧪 Testing

### Test Manual

1. **Usuario nuevo compra Plus:**
   ```
   1. Ir a landing
   2. Click "Suscribirse a Plus"
   3. Debería redirigir a /login
   4. Ingresar teléfono +54911...
   5. Recibir OTP por WhatsApp
   6. Ingresar código
   7. Debería auto-redirigir a /checkout
   8. Debería auto-redirigir a Mercado Pago
   9. Completar pago
   10. Webhook activa plan Plus
   ```

2. **Usuario existente compra Plus:**
   ```
   1. Usuario ya tiene cuenta (plan free)
   2. Click "Suscribirse a Plus"
   3. Login con OTP
   4. Checkout automático
   5. Pago en MP
   6. Plan actualizado de free → plus
   ```

3. **Usuario con plan Plus intenta comprar:**
   ```
   1. Usuario tiene plan Plus activo
   2. Click "Suscribirse a Plus"
   3. POST /create-payment → Error 400
   4. Mensaje: "Ya tienes un plan Plus activo"
   ```

### Logs a Monitorear

```bash
# Frontend (Browser Console)
📱 Sesión no encontrada, redirigiendo a login
💾 Compra guardada en sessionStorage
✅ Sesión validada, procesando pago

# Backend (Server Console)
✅ Preferencia de pago creada para usuario +54911... (uuid)
💳 Preferencia creada: pref_id para usuario uuid
📦 Metadata recibida: { user_id, user_phone, plan_id }
✅ Plan Plus activado para usuario uuid (+54911...)
```

---

## 🎯 Ventajas vs Flujo Legacy

| Aspecto | Flujo Nuevo | Flujo Legacy |
|---------|-------------|--------------|
| **Registro** | Antes del pago | Después del pago |
| **Usuarios fantasma** | ❌ No ocurre | ✅ Puede ocurrir |
| **Tracking** | ✅ Preciso desde el inicio | ⚠️ Tracking parcial |
| **Experiencia UX** | ✅ Clara y ordenada | ⚠️ Confusa |
| **Seguridad** | ✅ Validación de usuario | ⚠️ Menos validaciones |
| **Debugging** | ✅ Logs completos | ⚠️ Logs parciales |

---

## 📝 Variables de Entorno Necesarias

```bash
# JWT
JWT_SECRET=tu-secreto-super-seguro

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# n8n (para OTP)
N8N_WEBHOOK_SEND_OTP_URL=https://n8n.com/webhook/send-otp
```

---

## ✅ Checklist de Implementación

- [x] PaymentButton verifica autenticación
- [x] Página /checkout creada
- [x] API /create-payment valida JWT
- [x] Metadata del usuario en preferencia MP
- [x] Webhook lee metadata y actualiza plan
- [x] Fallback a flujo legacy
- [x] Validación de plan activo
- [x] Logs completos en cada paso
- [ ] Tests automatizados (pendiente)
- [ ] Modal de confirmación bonito (reemplazar `confirm`)

---

## 🚀 Próximos Pasos

1. **Dashboard de usuario**: Ver plan actual, fecha de expiración, historial de pagos
2. **Renovación automática**: Integración con suscripciones recurrentes de MP
3. **Notificaciones**: Email/WhatsApp cuando el plan está por expirar
4. **Analytics**: Tracking de conversión del flujo completo

