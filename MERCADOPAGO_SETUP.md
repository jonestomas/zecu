# Configuración de Mercado Pago para Zecu

## 🚀 Integración Completada

Se ha integrado exitosamente Mercado Pago como método de pago para el plan **Plus** de Zecu.

## 📋 Configuración Requerida

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

\`\`\`env
# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token_here
MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key_here

# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development
\`\`\`

### 2. Obtener Credenciales de Mercado Pago

1. **Crear cuenta en Mercado Pago Developers:**
   - Ve a [developers.mercadopago.com](https://developers.mercadopago.com)
   - Crea una cuenta o inicia sesión

2. **Crear una aplicación:**
   - Ve a "Tus integraciones" → "Crear aplicación"
   - Selecciona "Pagos online y presenciales"
   - Completa la información requerida

3. **Obtener credenciales:**
   - **Sandbox (Desarrollo):** Usa las credenciales de prueba
   - **Producción:** Usa las credenciales reales
   - Copia el `Access Token` y `Public Key`

### 3. Configurar URLs de Callback

En el panel de Mercado Pago, configura las siguientes URLs:

- **Success URL:** `https://tu-dominio.com/payment/success`
- **Failure URL:** `https://tu-dominio.com/payment/failure`
- **Pending URL:** `https://tu-dominio.com/payment/pending`
- **Webhook URL:** `https://tu-dominio.com/api/webhooks/mercadopago`

## 🎯 Funcionalidades Implementadas

### ✅ Componentes Creados

1. **PaymentButton** (`components/payment-button.tsx`)
   - Componente reutilizable para pagos
   - Manejo de estados de carga
   - Integración con API de Mercado Pago

2. **Botones Específicos:**
   - `PlusPlanPaymentButton` - Para plan Plus (AR$5.499)

### ✅ API Routes

1. **Create Payment** (`/api/create-payment`)
   - Crea preferencias de pago en Mercado Pago
   - Valida planes disponibles
   - Retorna URLs de pago

2. **Webhook Handler** (`/api/webhooks/mercadopago`)
   - Recibe notificaciones de estado de pago
   - Procesa actualizaciones automáticamente

### ✅ Páginas de Resultado

1. **Success** (`/payment/success`) - Pago exitoso
2. **Failure** (`/payment/failure`) - Pago fallido
3. **Pending** (`/payment/pending`) - Pago pendiente

## 🔧 Configuración de Desarrollo

### Instalar Dependencias

\`\`\`bash
npm install mercadopago
\`\`\`

### Ejecutar en Desarrollo

\`\`\`bash
npm run dev
\`\`\`

### Probar Pagos

1. **Tarjetas de Prueba (Sandbox):**
   - **Visa:** 4509 9535 6623 3704
   - **Mastercard:** 5031 7557 3453 0604
   - **CVV:** 123
   - **Vencimiento:** 11/25

2. **Usuarios de Prueba:**
   - Crea usuarios de prueba en el panel de Mercado Pago
   - Usa estos usuarios para simular compras

## 🚀 Despliegue en Producción

### 1. Actualizar Variables de Entorno

\`\`\`env
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_produccion
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
NODE_ENV=production
\`\`\`

### 2. Configurar Webhook

- Configura la URL del webhook en Mercado Pago
- Asegúrate de que sea accesible públicamente
- Verifica que responda con status 200

### 3. Probar en Producción

1. Realiza una compra de prueba con tarjeta real
2. Verifica que los webhooks funcionen correctamente
3. Confirma que las páginas de resultado se muestren bien

## 📊 Planes Configurados

| Plan | Precio | ID | Características |
|------|--------|----|----|
| **Básico** | AR$1.999/mes | `basic` | 50 análisis, detección avanzada, soporte 24/7 |
| **Premium** | AR$5.999/mes | `premium` | Análisis ilimitados, IA avanzada, 5 números |

## 🔐 Seguridad

- ✅ Validación de planes en backend
- ✅ Verificación de webhooks
- ✅ Manejo seguro de credenciales
- ✅ URLs de callback configurables

## 📞 Soporte

Para dudas sobre la integración:
- Email: soporte@zecu.com
- Documentación: [Mercado Pago Developers](https://developers.mercadopago.com)

---

**¡La integración está lista para usar!** 🎉
