# 📊 Diagrama de Flujo de Datos - Workflow OTP

Este diagrama muestra cómo fluyen los datos por cada nodo del workflow.

---

## 🔄 Flujo Completo con Datos Mock

```
┌─────────────────────────────────────────────────────────────────────┐
│  ENTRADA: POST Request desde Next.js                                │
├─────────────────────────────────────────────────────────────────────┤
│  POST http://localhost:5678/webhook/zecubot-send-otp                │
│                                                                       │
│  Headers:                                                            │
│    Content-Type: application/json                                    │
│                                                                       │
│  Body:                                                               │
│    {                                                                 │
│      "phone": "+5491134070204",                                      │
│      "code": "123456",                                               │
│      "name": "Tomás Jones"                                           │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  📥 NODO 1: Webhook Recibir OTP                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Tipo: Trigger (n8n-nodes-base.webhook)                             │
│  Acción: Recibe el POST request y extrae los datos                  │
│                                                                       │
│  Output:                                                             │
│    {                                                                 │
│      "headers": {                                                    │
│        "content-type": "application/json",                           │
│        "user-agent": "...",                                          │
│        ...                                                           │
│      },                                                              │
│      "body": {                                                       │
│        "phone": "+5491134070204",                                    │
│        "code": "123456",                                             │
│        "name": "Tomás Jones"                                         │
│      }                                                               │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ✅ NODO 2: Validar Datos                                           │
├─────────────────────────────────────────────────────────────────────┤
│  Tipo: Condicional (n8n-nodes-base.if)                              │
│  Acción: Valida que phone y code no estén vacíos                    │
│                                                                       │
│  Condición 1: $json.body.phone is not empty                         │
│  Condición 2: $json.body.code is not empty                          │
│                                                                       │
│  Output (TRUE):  → Va a "Preparar Mensaje"                          │
│  Output (FALSE): → Va a "Respuesta Error (Validación)"              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                            TRUE
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  📝 NODO 3: Preparar Mensaje                                        │
├─────────────────────────────────────────────────────────────────────┤
│  Tipo: Set (n8n-nodes-base.set)                                     │
│  Acción: Extrae datos del body y formatea el mensaje de WhatsApp    │
│                                                                       │
│  Valores que crea:                                                   │
│    - phone:   {{ $json.body.phone }}                                │
│    - code:    {{ $json.body.code }}                                 │
│    - name:    {{ $json.body.name || 'Usuario' }}                    │
│    - message: "Hola {{ name }}! 👋\n\n..."                          │
│                                                                       │
│  Output:                                                             │
│    {                                                                 │
│      "phone": "+5491134070204",                                      │
│      "code": "123456",                                               │
│      "name": "Tomás Jones",                                          │
│      "message": "Hola Tomás Jones! 👋\n\n                           │
│                  Tu código de verificación Zecubot es:\n\n          │
│                  *123456*\n\n                                        │
│                  Este código expira en 5 minutos.\n\n               │
│                  🔒 Nunca compartas este código con nadie."          │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  📱 NODO 4: Enviar WhatsApp (Twilio)                                │
├─────────────────────────────────────────────────────────────────────┤
│  Tipo: Twilio (n8n-nodes-base.twilio)                               │
│  Acción: Envía el mensaje por WhatsApp usando la API de Twilio      │
│                                                                       │
│  Configuración:                                                      │
│    - From: whatsapp:+12692562013  (tu número de Twilio)             │
│    - To:   whatsapp:+5491134070204 (del input)                      │
│    - Body: {{ $json.message }}                                      │
│                                                                       │
│  Request a Twilio API:                                               │
│    POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages   │
│    Body: {                                                           │
│      "From": "whatsapp:+12692562013",                                │
│      "To": "whatsapp:+5491134070204",                                │
│      "Body": "Hola Tomás Jones! 👋\n\n..."                          │
│    }                                                                 │
│                                                                       │
│  Output (si exitoso):                                                │
│    {                                                                 │
│      "sid": "SM1234567890abcdef1234567890abcdef",                    │
│      "status": "queued",                                             │
│      "to": "whatsapp:+5491134070204",                                │
│      "from": "whatsapp:+12692562013",                                │
│      "body": "Hola Tomás Jones! 👋\n\n...",                         │
│      "num_segments": "1",                                            │
│      "price": null,                                                  │
│      "price_unit": "USD"                                             │
│    }                                                                 │
│                                                                       │
│  Output (si falla): → Maneja error en "Respuesta Error (Twilio)"    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ✔️ NODO 5: Respuesta Éxito                                         │
├─────────────────────────────────────────────────────────────────────┤
│  Tipo: Respond to Webhook (n8n-nodes-base.respondToWebhook)         │
│  Acción: Envía respuesta exitosa a Next.js                          │
│                                                                       │
│  HTTP Status: 200 OK                                                 │
│                                                                       │
│  Response Body:                                                      │
│    {                                                                 │
│      "success": true,                                                │
│      "message": "OTP enviado correctamente a +5491134070204",        │
│      "timestamp": "2024-10-21T15:30:45.123Z"                         │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  📨 RESULTADO: Next.js recibe la respuesta                          │
├─────────────────────────────────────────────────────────────────────┤
│  El código en zecu/app/api/auth/send-otp/route.ts procesa:          │
│                                                                       │
│  if (result.success) {                                               │
│    console.log('✅ OTP enviado por WhatsApp correctamente')          │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Flujo Alternativo: Validación Falla

```
┌─────────────────────────────────────────────────────────────────────┐
│  ENTRADA: Datos Inválidos                                           │
├─────────────────────────────────────────────────────────────────────┤
│  Body:                                                               │
│    {                                                                 │
│      "phone": "",                                                    │
│      "code": ""                                                      │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
            📥 Webhook Recibir OTP
                              ↓
              ✅ Validar Datos
                              ↓
                           FALSE
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ❌ NODO 6: Respuesta Error (Validación)                            │
├─────────────────────────────────────────────────────────────────────┤
│  Tipo: Respond to Webhook (n8n-nodes-base.respondToWebhook)         │
│  Acción: Envía error de validación a Next.js                        │
│                                                                       │
│  HTTP Status: 400 Bad Request                                        │
│                                                                       │
│  Response Body:                                                      │
│    {                                                                 │
│      "success": false,                                               │
│      "error": "Datos incompletos. Se requiere phone y code",         │
│      "timestamp": "2024-10-21T15:30:45.123Z"                         │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Flujo Alternativo: Twilio Falla

```
            📥 Webhook Recibir OTP
                              ↓
              ✅ Validar Datos (OK)
                              ↓
            📝 Preparar Mensaje (OK)
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  📱 Enviar WhatsApp (Twilio) - FALLA                                │
├─────────────────────────────────────────────────────────────────────┤
│  Posibles errores:                                                   │
│    - Credenciales incorrectas                                        │
│    - Número no válido                                                │
│    - Sin saldo                                                       │
│    - Número no verificado (Twilio Trial)                             │
│                                                                       │
│  Error Output:                                                       │
│    {                                                                 │
│      "error": "The 'To' number is not a valid phone number",         │
│      "code": 21211                                                   │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️ NODO 7: Respuesta Error (Twilio)                                │
├─────────────────────────────────────────────────────────────────────┤
│  Tipo: Respond to Webhook (n8n-nodes-base.respondToWebhook)         │
│  Acción: Envía error de Twilio a Next.js                            │
│                                                                       │
│  HTTP Status: 500 Internal Server Error                              │
│                                                                       │
│  Response Body:                                                      │
│    {                                                                 │
│      "success": false,                                               │
│      "error": "Error al enviar WhatsApp: The 'To' number...",        │
│      "timestamp": "2024-10-21T15:30:45.123Z"                         │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Tabla Resumen de Datos por Nodo

| Nodo                          | Input Clave                     | Output Clave                    | Siguiente Nodo           |
|-------------------------------|---------------------------------|---------------------------------|--------------------------|
| 1. Webhook Recibir OTP        | `body: { phone, code, name }`   | `body.phone`, `body.code`       | Validar Datos            |
| 2. Validar Datos              | `body.phone`, `body.code`       | TRUE/FALSE                      | Preparar / Error         |
| 3. Preparar Mensaje           | `body.*`                        | `phone`, `code`, `message`      | Enviar WhatsApp          |
| 4. Enviar WhatsApp (Twilio)   | `phone`, `message`              | `sid`, `status`                 | Respuesta Éxito          |
| 5. Respuesta Éxito            | `phone` (del paso 3)            | `{ success: true, ... }`        | FIN (200)                |
| 6. Respuesta Error (Valid.)   | -                               | `{ success: false, ... }`       | FIN (400)                |
| 7. Respuesta Error (Twilio)   | `error` (de Twilio)             | `{ success: false, ... }`       | FIN (500)                |

---

## 🎨 Vista Simplificada

```
                    ┌────────────┐
                    │  Next.js   │
                    │   POST     │
                    └─────┬──────┘
                          │
                          ↓
              ┌───────────────────────┐
              │   🔔 Webhook          │
              │   Recibir OTP         │
              └──────────┬────────────┘
                         │
                         ↓
              ┌───────────────────────┐
              │   ✅ Validar          │
              │   phone & code        │
              └──────┬────────┬───────┘
                     │        │
                 ✓ OK         ✗ Error
                     │        │
                     │        └──────────────┐
                     ↓                       ↓
          ┌──────────────────┐    ┌──────────────────┐
          │   📝 Preparar    │    │   ❌ Error 400   │
          │   Mensaje        │    │   Validación     │
          └────────┬─────────┘    └──────────────────┘
                   │
                   ↓
          ┌──────────────────┐
          │   📱 Twilio      │
          │   Enviar WA      │
          └────────┬─────────┘
                   │
            ┌──────┴──────┐
            │             │
        ✓ OK           ✗ Error
            │             │
            ↓             ↓
    ┌──────────────┐  ┌──────────────┐
    │ ✔️ Success   │  │ ⚠️ Error 500 │
    │ 200          │  │ Twilio       │
    └──────────────┘  └──────────────┘
```

---

## 💡 Cómo Usar Este Diagrama

1. **Para entender el flujo:** Lee de arriba hacia abajo
2. **Para debuggear:** Identifica en qué nodo falla y revisa su "Output Esperado"
3. **Para probar:** Usa los datos mock del input y verifica cada output
4. **Para modificar:** Cambia el nodo "Preparar Mensaje" para personalizar el texto

---

## 🔍 Ver Estos Datos en n8n

1. Ejecuta el workflow en modo test
2. Haz clic en cada nodo
3. En el panel derecho verás **"Input"** y **"Output"**
4. Compara con este diagrama para verificar que todo esté correcto

---

**¡Este diagrama es tu mapa para entender y debuggear el workflow! 🗺️**

