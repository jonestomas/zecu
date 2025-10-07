# Integración con n8n para Zecu

## 🔗 Configuración de Webhooks

Esta documentación explica cómo configurar n8n para recibir y procesar los webhooks de Mercado Pago de Zecu.

## 📋 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```env
# n8n Integration
N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/zecu-mercadopago
N8N_API_KEY=tu_api_key_de_n8n_opcional
```

## 🎯 Estructura del Webhook

### Eventos Enviados a n8n

El webhook de Mercado Pago envía los siguientes eventos a n8n:

1. **`payment_approved`** - Pago aprobado exitosamente
2. **`payment_rejected`** - Pago rechazado
3. **`payment_pending`** - Pago pendiente de confirmación
4. **`payment_cancelled`** - Pago cancelado

### Estructura del Payload

```json
{
  "event": "payment_approved",
  "data": {
    "paymentId": "123456789",
    "status": "approved",
    "statusDetail": "accredited",
    "amount": 1999,
    "currency": "ARS",
    "externalReference": "zecu-basic-1703123456",
    "payerEmail": "usuario@ejemplo.com",
    "payerId": "12345678",
    "planId": "basic",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "rawData": { /* datos completos de Mercado Pago */ }
  },
  "source": "mercadopago",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 Configuración en n8n

### 1. Crear Webhook Node

1. En n8n, crea un nuevo workflow
2. Agrega un nodo **Webhook**
3. Configura:
   - **HTTP Method**: POST
   - **Path**: `/zecu-mercadopago` (o el que prefieras)
   - **Authentication**: None (o Bearer Token si usas N8N_API_KEY)

### 2. Estructura del Workflow Recomendado

```
Webhook → Switch (por evento) → Procesar según tipo de pago
                                ↓
                        Supabase (actualizar usuario)
                                ↓
                        Email/Notificación
                                ↓
                        Analytics/Logging
```

### 3. Nodos Necesarios

#### Switch Node (por evento)
- **Mode**: Expression
- **Rules**:
  - `$json.event === "payment_approved"`
  - `$json.event === "payment_rejected"`
  - `$json.event === "payment_pending"`
  - `$json.event === "payment_cancelled"`

#### Supabase Node (para payment_approved)
- **Operation**: Update
- **Table**: `users` o `subscriptions`
- **Update Key**: `email` (usando `$json.data.payerEmail`)
- **Fields**:
  - `subscription_status`: "active"
  - `plan_id`: `$json.data.planId`
  - `payment_id`: `$json.data.paymentId`
  - `activated_at`: `$json.data.timestamp`

#### Email Node (para payment_approved)
- **To**: `$json.data.payerEmail`
- **Subject**: "¡Bienvenido a Zecu! Tu suscripción está activa"
- **Template**: Personalizar según el plan

### 4. Ejemplo de Workflow Completo

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "zecu-mercadopago"
      }
    },
    {
      "name": "Switch por Evento",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "rules": {
          "rules": [
            {
              "operation": "equal",
              "value1": "={{ $json.event }}",
              "value2": "payment_approved"
            },
            {
              "operation": "equal", 
              "value1": "={{ $json.event }}",
              "value2": "payment_rejected"
            }
          ]
        }
      }
    },
    {
      "name": "Actualizar Supabase",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "update",
        "table": "users",
        "updateKey": "email",
        "fields": {
          "subscription_status": "active",
          "plan_id": "={{ $json.data.planId }}",
          "payment_id": "={{ $json.data.paymentId }}"
        }
      }
    }
  ]
}
```

## 📊 Planes Soportados

| Plan ID | Nombre | Precio | Características |
|---------|--------|--------|-----------------|
| `basic` | Básico | AR$1.999 | 50 análisis, detección avanzada |
| `premium` | Premium | AR$5.999 | Análisis ilimitados, IA avanzada |

## 🔐 Seguridad

### Headers de Seguridad
El webhook incluye estos headers:
- `X-Source`: `zecu-mercadopago-webhook`
- `X-Event-Type`: Tipo de evento
- `Authorization`: Bearer token (si N8N_API_KEY está configurado)

### Validación en n8n
Recomendamos validar:
1. **Source**: Verificar que `X-Source` sea correcto
2. **Timestamp**: Verificar que el evento no sea muy antiguo
3. **Datos requeridos**: Validar que `payerEmail` y `planId` estén presentes

## 🚨 Manejo de Errores

### En Zecu (Next.js)
- Si n8n no responde, el webhook continúa procesando localmente
- Se registran logs detallados para debugging
- Timeout de 10 segundos para evitar bloqueos

### En n8n
- Configurar reintentos automáticos
- Notificar errores críticos
- Logging detallado de cada paso

## 📝 Logs y Monitoreo

### Logs en Zecu
```bash
# Ver logs del webhook
tail -f logs/webhook.log

# Logs específicos de n8n
grep "n8n" logs/webhook.log
```

### Logs en n8n
- Usar el nodo **Set** para agregar timestamps
- Configurar notificaciones de error
- Monitorear el estado del workflow

## 🔄 Testing

### Probar Webhook Localmente
```bash
# Usar ngrok para exponer webhook local
ngrok http 3000

# Configurar webhook en Mercado Pago
# URL: https://tu-ngrok-url.ngrok.io/api/webhooks/mercadopago
```

### Probar en n8n
1. Usar el botón "Test" en el nodo Webhook
2. Enviar payload de prueba
3. Verificar que los datos lleguen correctamente

## 📞 Soporte

Si tienes problemas con la integración:
1. Revisar logs en Zecu y n8n
2. Verificar configuración de variables de entorno
3. Probar webhook con herramientas como Postman
4. Contactar al equipo de desarrollo

---

**Nota**: Esta integración está diseñada para ser robusta y tolerante a fallos. Si n8n no está disponible, el sistema de pagos seguirá funcionando localmente.



