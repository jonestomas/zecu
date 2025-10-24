# 🚀 Guía Rápida: Probar OTP con Datos Mock

Esta es la forma MÁS RÁPIDA de probar tu workflow de OTP en n8n sin código.

---

## ⚡ 3 Pasos - 5 Minutos

### 1️⃣ Importar Workflow (1 min)

1. Abre n8n → http://localhost:5678
2. Click en **"+"** → **"Import from File"**
3. Selecciona: `zecu/docs/n8n-workflows/SEND_OTP_WORKFLOW.json`
4. ✅ Listo

### 2️⃣ Configurar Credenciales Twilio (2 min)

1. Click en el nodo **"Enviar WhatsApp (Twilio)"**
2. En **"Credential to connect with"** → **"+ Create New"**
3. Completa:
   - **Account SID:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Click **"Save"**
5. ✅ Listo

### 3️⃣ Probar con Mock Data (2 min)

**Opción A: Desde PowerShell (Windows)**

\`\`\`powershell
cd zecu
.\scripts\testing\test-webhook-otp.ps1
\`\`\`

**Opción B: Activar en n8n y usar curl**

1. En n8n, activa el workflow (toggle ON)
2. Click en **"Webhook Recibir OTP"**
3. Copia la **"Production URL"**
4. Ejecuta:

\`\`\`powershell
$body = @{
    phone = "+5491134070204"
    code = "123456"
    name = "Tomás"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/zecubot-send-otp" -Method Post -ContentType "application/json" -Body $body
\`\`\`

**Opción C: Test Manual en n8n (sin enviar WhatsApp real)**

1. **Deshabilita temporalmente** el nodo de Twilio:
   - Click derecho en **"Enviar WhatsApp (Twilio)"**
   - Click en **"Disable"**

2. Click en **"Test workflow"** (arriba a la derecha)

3. Click en el nodo **"Webhook Recibir OTP"**

4. Click en **"Listen for Test Event"**

5. En una nueva terminal:
\`\`\`powershell
$body = @{
    phone = "+5491134070204"
    code = "123456"
    name = "Tomás"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/zecubot-send-otp" -Method Post -ContentType "application/json" -Body $body
\`\`\`

6. ✅ Verás los datos fluir por cada nodo (excepto Twilio que está deshabilitado)

7. Cuando todo funcione, **reactiva** el nodo de Twilio

---

## 📋 Datos Mock Listos para Copiar/Pegar

### ✅ Caso Exitoso

\`\`\`json
{
  "phone": "+5491134070204",
  "code": "123456",
  "name": "Tomás Jones"
}
\`\`\`

### ✅ Sin Nombre (usa "Usuario" por defecto)

\`\`\`json
{
  "phone": "+5491134070204",
  "code": "999999"
}
\`\`\`

### ❌ Datos Inválidos (debe fallar)

\`\`\`json
{
  "phone": "",
  "code": ""
}
\`\`\`

---

## 🎯 Verificación Rápida

Después de probar, verifica:

- [ ] ✅ El webhook recibe los datos correctamente
- [ ] ✅ La validación funciona (rechaza datos vacíos)
- [ ] ✅ El mensaje se formatea correctamente
- [ ] ✅ (Opcional) El mensaje llega a WhatsApp
- [ ] ✅ La respuesta es la correcta (JSON con success: true/false)

---

## 🆘 Problemas Comunes

### ❌ "Connection refused"

**Causa:** n8n no está corriendo

**Solución:**
\`\`\`bash
# Verifica que n8n esté corriendo
# Debería abrir: http://localhost:5678
\`\`\`

### ❌ "Webhook not found"

**Causa:** El workflow no está activo

**Solución:**
1. Abre n8n
2. Abre el workflow
3. Activa el toggle (arriba a la derecha)

### ❌ "Authentication failed" (Twilio)

**Causa:** Credenciales de Twilio incorrectas

**Solución:**
1. Ve a https://console.twilio.com
2. Copia tu Account SID y Auth Token
3. Actualiza las credenciales en n8n

### ⚠️ No recibo WhatsApp

**Si usas Twilio Trial:**
1. Ve a: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Agrega tu número de teléfono
3. Verifica con el código que te envían por SMS
4. Vuelve a probar

---

## 🎉 Si Todo Funciona

1. Copia la URL del webhook:
   \`\`\`
   http://localhost:5678/webhook/zecubot-send-otp
   \`\`\`

2. Agrégala a `zecu/.env.local`:
   \`\`\`env
   N8N_WEBHOOK_SEND_OTP_URL=http://localhost:5678/webhook/zecubot-send-otp
   \`\`\`

3. Reinicia Next.js:
   \`\`\`bash
   cd zecu
   npm run dev
   \`\`\`

4. Prueba el login en: http://localhost:3000/login

5. ✅ ¡Listo! Ahora el OTP se envía por WhatsApp automáticamente

---

## 📚 Más Información

- **Datos mock detallados:** `zecu/docs/n8n-workflows/MOCK_DATA_OTP.md`
- **Guía completa paso a paso:** `zecu/docs/N8N_OTP_SETUP_GUIDE.md`
- **Script de prueba:** `zecu/scripts/testing/test-webhook-otp.ps1`

---

**⏱️ Tiempo total: ~5 minutos**

**🎯 Resultado: Workflow funcionando con datos mock**
