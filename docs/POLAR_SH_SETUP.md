# 🌍 Polar.sh - Pagos Internacionales

## 🎯 ¿Por qué Polar.sh?

Polar.sh es ideal para expandir Zecu a nivel internacional porque:

- ✅ **Soporte multi-moneda** - Acepta pagos en USD, EUR, GBP, y más
- ✅ **Stripe como backend** - Infraestructura confiable y global
- ✅ **Suscripciones** - Gestión automática de renovaciones
- ✅ **Developer-friendly** - Fácil integración con Next.js
- ✅ **Webhooks** - Notificaciones en tiempo real
- ✅ **Sin comisiones ocultas** - Pricing transparente

---

## 📦 Instalación

\`\`\`bash
npm install @polar-sh/nextjs
\`\`\`

---

## 🔑 Configuración

### 1. Crear Cuenta en Polar.sh

1. Ve a [https://polar.sh](https://polar.sh)
2. Crea una cuenta
3. Ve a Settings → API Keys
4. Copia tu **Access Token**

### 2. Crear Productos

1. En Polar.sh, ve a Products
2. Crea dos productos:
   - **Zecu Plus** - $10 USD/mes
   - **Zecu Premium** - $25 USD/mes
3. Copia los **Price IDs** de cada producto

### 3. Configurar Webhooks

1. En Polar.sh, ve a Settings → Webhooks
2. Agrega un nuevo webhook:
   - **URL**: `https://tu-dominio.com/api/webhooks/polar`
   - **Eventos**: Selecciona:
     - `checkout.created`
     - `checkout.updated`
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
3. Copia el **Webhook Secret**

### 4. Variables de Entorno

Agrega a tu `.env.local`:

\`\`\`env
# Polar.sh Configuration
POLAR_ACCESS_TOKEN=polar_oat_XXXXXXXXXXXXXXXX
POLAR_PRICE_ID_PLUS=price_XXXXXXXXX
POLAR_PRICE_ID_PREMIUM=price_XXXXXXXXX
POLAR_SUCCESS_URL=https://tu-dominio.com/payment/polar/success?checkout_id={CHECKOUT_ID}
POLAR_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXX
\`\`\`

---

## 🧪 Testing

### Modo Sandbox

Polar.sh detecta automáticamente si estás en desarrollo y usa el modo sandbox.

### Test Cards (Stripe)

Polar.sh usa Stripe, así que puedes usar las tarjetas de prueba de Stripe:

- **Éxito**: `4242 4242 4242 4242`
- **CVV**: Cualquier 3 dígitos
- **Fecha**: Cualquier fecha futura
- **ZIP**: Cualquier código postal válido

---

## 🔄 Flujo de Pago

\`\`\`
Usuario selecciona plan Plus/Premium
    ↓
POST /api/polar/create-checkout
    ↓
Polar.sh crea checkout session
    ↓
Usuario es redirigido a Polar.sh
    ↓
Usuario completa el pago
    ↓
Redirige a /payment/polar/success
    ↓
GET /api/polar/verify-payment
    ↓
Supabase: plan actualizado
    ↓
Usuario redirigido a /welcome
\`\`\`

---

## 🎨 Integración con UI

### Selector de Método de Pago

\`\`\`typescript
// En tu página de checkout
const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'polar'>('mercadopago');

// Lógica de selección
const handleCheckout = async () => {
  if (paymentMethod === 'mercadopago') {
    // Flujo de Mercado Pago (Argentina)
    await handleMercadoPagoCheckout();
  } else {
    // Flujo de Polar.sh (Internacional)
    await handlePolarCheckout();
  }
};
\`\`\`

### Detectar País Automáticamente

\`\`\`typescript
const detectCountry = async () => {
  const response = await fetch('https://ipapi.co/json/');
  const data = await response.json();
  
  if (data.country_code === 'AR') {
    setPaymentMethod('mercadopago');
  } else {
    setPaymentMethod('polar');
  }
};
\`\`\`

---

## 📊 Gestión de Suscripciones

### Cancelación

Las cancelaciones se manejan automáticamente a través del webhook:

\`\`\`typescript
case 'subscription.canceled':
  // Actualizar usuario a plan free
  await supabaseAdmin
    .from('users')
    .update({ plan: 'free', plan_expires_at: null })
    .eq('id', userId);
\`\`\`

### Renovación

Polar.sh maneja las renovaciones automáticamente. Cada vez que se renueva, envía un webhook `subscription.updated`.

---

## 🔒 Seguridad

### Validación de Webhooks

El código ya incluye validación de signatures:

\`\`\`typescript
const event = validateWebhookPayload(
  body, 
  webhookSecret, 
  signature, 
  timestamp
);
\`\`\`

### Variables de Entorno

- ✅ Nunca commitear el `.env.local`
- ✅ Usar variables de entorno en producción
- ✅ Rotar keys periódicamente

---

## 🌍 Multi-moneda

Polar.sh soporta múltiples monedas automáticamente. Para configurar:

1. En Polar.sh → Product Settings
2. Habilita multi-currency
3. Los precios se convertirán automáticamente según la ubicación del usuario

---

## 📈 Analytics

Polar.sh provee un dashboard con:

- 📊 Revenue mensual
- 👥 Suscripciones activas
- 💳 Tasa de conversión
- 🌍 Revenue por país

---

## 🆘 Solución de Problemas

### Error: "Price ID not found"

**Solución**: Verifica que `POLAR_PRICE_ID_PLUS` y `POLAR_PRICE_ID_PREMIUM` estén configurados correctamente.

### Error: "Invalid signature"

**Solución**: Verifica que `POLAR_WEBHOOK_SECRET` coincida con el secret de Polar.sh.

### Webhook no se ejecuta

**Solución**: 
1. Verifica que la URL del webhook sea accesible públicamente
2. Usa ngrok en desarrollo: `ngrok http 3001`
3. Actualiza la URL del webhook en Polar.sh

---

## 🔗 Links Útiles

- **Documentación**: https://docs.polar.sh
- **Dashboard**: https://polar.sh/dashboard
- **API Reference**: https://docs.polar.sh/api
- **Status**: https://status.polar.sh

---

## ✅ Checklist de Implementación

- [ ] Cuenta de Polar.sh creada
- [ ] Access Token configurado
- [ ] Productos creados (Plus & Premium)
- [ ] Price IDs copiados
- [ ] Webhook configurado
- [ ] Variables de entorno agregadas
- [ ] Pago de prueba completado
- [ ] Webhook funcionando
- [ ] UI actualizada para selector de país

---

**¡Listo para aceptar pagos internacionales!** 🌍🚀
