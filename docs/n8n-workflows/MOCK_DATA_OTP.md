# 🧪 Datos Mock para Probar el Workflow de OTP en n8n

Esta guía te proporciona datos de prueba (mock) para cada nodo del workflow de OTP.

---

## 📋 Cómo Usar Estos Datos

### Método 1: Test Manual de Webhook (Recomendado)

1. En n8n, abre el workflow "Zecubot - Enviar OTP por WhatsApp"
2. Haz clic en el nodo **"Webhook Recibir OTP"**
3. En el panel derecho, haz clic en **"Listen for Test Event"**
4. Usa curl o Postman para enviar el payload mock (ver abajo)
5. Los datos fluirán por todos los nodos

### Método 2: Ejecutar Manualmente con Datos

1. Haz clic en el nodo que quieres probar
2. En el panel derecho, haz clic en **"Execute Node"**
3. Pega los datos mock en **"Input Data"**
4. Haz clic en **"Execute"**

---

## 🔔 Nodo 1: Webhook Recibir OTP

### Payload de Entrada (Lo que envía Next.js)

\`\`\`json
{
  "phone": "+5491134070204",
  "code": "123456",
  "name": "Tomás Jones"
}
\`\`\`

### Variaciones para Probar

**Usuario sin nombre:**
\`\`\`json
{
  "phone": "+5491134070204",
  "code": "999999"
}
\`\`\`

**Número USA:**
\`\`\`json
{
  "phone": "+12692562013",
  "code": "555555",
  "name": "John Doe"
}
\`\`\`

**Datos inválidos (para probar validación):**
\`\`\`json
{
  "phone": "",
  "code": ""
}
\`\`\`

### 📡 Cómo Probar con curl

\`\`\`bash
# Reemplaza la URL con tu webhook de n8n
curl -X POST http://localhost:5678/webhook/zecubot-send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5491134070204",
    "code": "123456",
    "name": "Tomás Jones"
  }'
\`\`\`

### 📡 Cómo Probar con PowerShell (Windows)

\`\`\`powershell
$body = @{
    phone = "+5491134070204"
    code = "123456"
    name = "Tomás Jones"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/zecubot-send-otp" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
\`\`\`

---

## ✅ Nodo 2: Validar Datos

### Datos de Entrada (del Webhook)

\`\`\`json
{
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "phone": "+5491134070204",
    "code": "123456",
    "name": "Tomás Jones"
  }
}
\`\`\`

### Qué Valida

- ✅ `phone` no vacío
- ✅ `code` no vacío

### Resultados Esperados

**Si es válido:** Va al nodo "Preparar Mensaje" (TRUE)
**Si es inválido:** Va al nodo "Respuesta Error (Validación)" (FALSE)

### Test con Datos Inválidos

\`\`\`json
{
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "phone": "",
    "code": ""
  }
}
\`\`\`

---

## 📝 Nodo 3: Preparar Mensaje

### Datos de Entrada

\`\`\`json
{
  "body": {
    "phone": "+5491134070204",
    "code": "123456",
    "name": "Tomás Jones"
  }
}
\`\`\`

### Datos de Salida Esperados

\`\`\`json
{
  "phone": "+5491134070204",
  "code": "123456",
  "name": "Tomás Jones",
  "message": "Hola Tomás Jones! 👋\n\nTu código de verificación Zecubot es:\n\n*123456*\n\nEste código expira en 5 minutos.\n\n🔒 Nunca compartas este código con nadie."
}
\`\`\`

### Prueba sin Nombre

**Entrada:**
\`\`\`json
{
  "body": {
    "phone": "+5491134070204",
    "code": "999999"
  }
}
\`\`\`

**Salida Esperada:**
\`\`\`json
{
  "phone": "+5491134070204",
  "code": "999999",
  "name": "Usuario",
  "message": "Hola Usuario! 👋\n\nTu código de verificación Zecubot es:\n\n*999999*\n\nEste código expira en 5 minutos.\n\n🔒 Nunca compartas este código con nadie."
}
\`\`\`

---

## 📱 Nodo 4: Enviar WhatsApp (Twilio)

### ⚠️ Importante para el Mock

**NO ejecutes este nodo manualmente con mock data** porque enviará un WhatsApp real.

En su lugar, usa el **"Execute Node"** pero:
1. Haz clic derecho en el nodo → **Disable**
2. Prueba los otros nodos
3. Cuando todo funcione, reactiva este nodo

### Datos de Entrada Esperados

\`\`\`json
{
  "phone": "+5491134070204",
  "code": "123456",
  "name": "Tomás Jones",
  "message": "Hola Tomás Jones! 👋\n\nTu código de verificación Zecubot es:\n\n*123456*\n\nEste código expira en 5 minutos.\n\n🔒 Nunca compartas este código con nadie."
}
\`\`\`

### Configuración del Nodo

- **From:** `whatsapp:+12692562013` (tu número de Twilio)
- **To:** `={{ 'whatsapp:' + $json.phone }}` → resultado: `whatsapp:+5491134070204`
- **Message:** `={{ $json.message }}`

### Respuesta de Twilio (cuando funcione)

\`\`\`json
{
  "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued",
  "to": "whatsapp:+5491134070204",
  "from": "whatsapp:+12692562013",
  "body": "Hola Tomás Jones! 👋\n\nTu código de verificación Zecubot es:\n\n*123456*\n\nEste código expira en 5 minutos.\n\n🔒 Nunca compartas este código con nadie.",
  "num_segments": "1",
  "price": null,
  "price_unit": "USD"
}
\`\`\`

---

## ✔️ Nodo 5: Respuesta Éxito

### Datos de Entrada (desde Twilio)

\`\`\`json
{
  "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued",
  "to": "whatsapp:+5491134070204",
  "from": "whatsapp:+12692562013",
  "phone": "+5491134070204"
}
\`\`\`

### Respuesta que Envía al Cliente (Next.js)

\`\`\`json
{
  "success": true,
  "message": "OTP enviado correctamente a +5491134070204",
  "timestamp": "2024-10-21T15:30:00.000Z"
}
\`\`\`

---

## ❌ Nodo 6: Respuesta Error (Validación)

### Cuándo se Ejecuta

Cuando el webhook recibe datos incompletos (sin `phone` o sin `code`)

### Datos de Entrada (Ejemplo)

\`\`\`json
{
  "body": {
    "phone": "",
    "code": ""
  }
}
\`\`\`

### Respuesta que Envía al Cliente

\`\`\`json
{
  "success": false,
  "error": "Datos incompletos. Se requiere phone y code",
  "timestamp": "2024-10-21T15:30:00.000Z"
}
\`\`\`

### HTTP Status Code

`400 Bad Request`

---

## ⚠️ Nodo 7: Respuesta Error (Twilio)

### Cuándo se Ejecuta

Cuando Twilio falla (credenciales incorrectas, número inválido, sin saldo, etc.)

### Datos de Entrada (Ejemplo de Error)

\`\`\`json
{
  "error": "Unable to create record: The 'To' number +5491134070204 is not a valid WhatsApp-enabled phone number.",
  "code": 21606
}
\`\`\`

### Respuesta que Envía al Cliente

\`\`\`json
{
  "success": false,
  "error": "Error al enviar WhatsApp: Unable to create record: The 'To' number +5491134070204 is not a valid WhatsApp-enabled phone number.",
  "timestamp": "2024-10-21T15:30:00.000Z"
}
\`\`\`

### HTTP Status Code

`500 Internal Server Error`

---

## 🧪 Casos de Prueba Completos

### ✅ Caso 1: Envío Exitoso (Happy Path)

**Request:**
\`\`\`bash
curl -X POST http://localhost:5678/webhook/zecubot-send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5491134070204",
    "code": "123456",
    "name": "Tomás Jones"
  }'
\`\`\`

**Response Esperada:**
\`\`\`json
{
  "success": true,
  "message": "OTP enviado correctamente a +5491134070204",
  "timestamp": "2024-10-21T15:30:00.000Z"
}
\`\`\`

**HTTP Status:** `200 OK`

---

### ❌ Caso 2: Datos Incompletos

**Request:**
\`\`\`bash
curl -X POST http://localhost:5678/webhook/zecubot-send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "",
    "code": ""
  }'
\`\`\`

**Response Esperada:**
\`\`\`json
{
  "success": false,
  "error": "Datos incompletos. Se requiere phone y code",
  "timestamp": "2024-10-21T15:30:00.000Z"
}
\`\`\`

**HTTP Status:** `400 Bad Request`

---

### ⚠️ Caso 3: Número Inválido (Twilio Error)

**Request:**
\`\`\`bash
curl -X POST http://localhost:5678/webhook/zecubot-send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "code": "999999",
    "name": "Test User"
  }'
\`\`\`

**Response Esperada:**
\`\`\`json
{
  "success": false,
  "error": "Error al enviar WhatsApp: The 'To' number +1234567890 is not a valid phone number.",
  "timestamp": "2024-10-21T15:30:00.000Z"
}
\`\`\`

**HTTP Status:** `500 Internal Server Error`

---

## 🎯 Checklist de Pruebas

Prueba estos escenarios en n8n:

- [ ] ✅ **Happy Path**: Teléfono + código + nombre válidos
- [ ] ✅ **Sin nombre**: Solo teléfono + código (debe usar "Usuario" por defecto)
- [ ] ❌ **Teléfono vacío**: Debe retornar error 400
- [ ] ❌ **Código vacío**: Debe retornar error 400
- [ ] ❌ **Ambos vacíos**: Debe retornar error 400
- [ ] ⚠️ **Número inválido**: Twilio debe retornar error (solo si tienes créditos)
- [ ] 🌍 **Número USA**: `+12692562013` (debe funcionar)
- [ ] 🌍 **Número Argentina**: `+5491134070204` (debe funcionar)

---

## 🔍 Debugging en n8n

### Ver los Datos que Fluyen

1. Ejecuta el workflow con el botón **"Test workflow"**
2. Haz clic en cada nodo
3. En el panel derecho verás **"Output Data"**
4. Compara con los datos esperados arriba

### Errores Comunes

**Error:** `Cannot read property 'phone' of undefined`
- **Causa:** El webhook no está recibiendo `body.phone`
- **Solución:** Verifica que envías el JSON correcto

**Error:** `The 'To' number is not a valid WhatsApp-enabled phone number`
- **Causa:** El número no está habilitado en Twilio (si usas Trial)
- **Solución:** Agrega el número en Twilio Console → Verified Caller IDs

**Error:** `Authentication failed`
- **Causa:** Credenciales de Twilio incorrectas
- **Solución:** Verifica Account SID y Auth Token

---

## 📞 Datos de Ejemplo por País

### Argentina 🇦🇷
\`\`\`json
{
  "phone": "+5491134070204",
  "code": "123456",
  "name": "Tomás Jones"
}
\`\`\`

### USA 🇺🇸
\`\`\`json
{
  "phone": "+12692562013",
  "code": "555555",
  "name": "John Smith"
}
\`\`\`

### México 🇲🇽
\`\`\`json
{
  "phone": "+525512345678",
  "code": "777777",
  "name": "Juan Pérez"
}
\`\`\`

### Chile 🇨🇱
\`\`\`json
{
  "phone": "+56912345678",
  "code": "888888",
  "name": "María González"
}
\`\`\`

---

## 🚀 Script de Prueba Rápida

Crea un archivo `test-webhook.sh` (Linux/Mac) o `test-webhook.ps1` (Windows):

**PowerShell (Windows):**
\`\`\`powershell
# test-webhook.ps1
$url = "http://localhost:5678/webhook/zecubot-send-otp"

$tests = @(
    @{ phone = "+5491134070204"; code = "123456"; name = "Tomás" },
    @{ phone = "+5491134070204"; code = "999999" },
    @{ phone = ""; code = "" }
)

foreach ($test in $tests) {
    Write-Host "`nProbando: $($test | ConvertTo-Json -Compress)" -ForegroundColor Yellow
    $body = $test | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body $body
        Write-Host "✅ Respuesta:" -ForegroundColor Green
        $response | ConvertTo-Json
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 2
}
\`\`\`

**Bash (Linux/Mac):**
\`\`\`bash
#!/bin/bash
# test-webhook.sh
URL="http://localhost:5678/webhook/zecubot-send-otp"

echo "Test 1: Datos completos"
curl -X POST $URL -H "Content-Type: application/json" \
  -d '{"phone":"+5491134070204","code":"123456","name":"Tomás"}'

echo -e "\n\nTest 2: Sin nombre"
curl -X POST $URL -H "Content-Type: application/json" \
  -d '{"phone":"+5491134070204","code":"999999"}'

echo -e "\n\nTest 3: Datos vacíos (debe fallar)"
curl -X POST $URL -H "Content-Type: application/json" \
  -d '{"phone":"","code":""}'
\`\`\`

---

**¡Con estos datos mock puedes probar todo el workflow sin enviar WhatsApps reales! 🎉**


