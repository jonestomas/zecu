# 📁 n8n Workflows - Zecubot

Esta carpeta contiene los workflows de n8n para Zecubot y su documentación.

---

## 📋 Archivos en Esta Carpeta

### 🔧 Workflows (JSON)

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| **`SEND_OTP_WORKFLOW.json`** | Workflow completo para enviar códigos OTP por WhatsApp | Importar en n8n |

### 📚 Documentación

| Archivo | Descripción | Para Quién |
|---------|-------------|------------|
| **`QUICK_START_MOCK.md`** | ⚡ Guía rápida (5 min) - Empezar aquí | Todos |
| **`MOCK_DATA_OTP.md`** | 🧪 Datos de prueba para cada nodo | Testing/Debug |
| **`DATA_FLOW_DIAGRAM.md`** | 📊 Diagrama visual del flujo de datos | Entender/Debug |

### 📄 Documentación Completa (Carpeta Padre)

- **`../N8N_OTP_SETUP_GUIDE.md`** - Guía completa paso a paso (1 hora)

---

## 🚀 Comenzar Aquí

### Si quieres configurar TODO (1 hora):
👉 Lee: **`../N8N_OTP_SETUP_GUIDE.md`**

### Si solo quieres probar con mock data (5 min):
👉 Lee: **`QUICK_START_MOCK.md`**

### Si necesitas debuggear un problema:
👉 Lee: **`DATA_FLOW_DIAGRAM.md`** + **`MOCK_DATA_OTP.md`**

---

## 📦 Workflows Disponibles

### 1. Envío de OTP por WhatsApp

**Archivo:** `SEND_OTP_WORKFLOW.json`

**Descripción:** Recibe peticiones de Next.js con un código OTP y lo envía al usuario por WhatsApp usando Twilio.

**Nodos incluidos:**
1. 🔔 Webhook Recibir OTP
2. ✅ Validar Datos
3. 📝 Preparar Mensaje
4. 📱 Enviar WhatsApp (Twilio)
5. ✔️ Respuesta Éxito
6. ❌ Respuesta Error (Validación)
7. ⚠️ Respuesta Error (Twilio)

**Input esperado:**
```json
{
  "phone": "+5491134070204",
  "code": "123456",
  "name": "Tomás Jones"
}
```

**Output esperado:**
```json
{
  "success": true,
  "message": "OTP enviado correctamente a +5491134070204",
  "timestamp": "2024-10-21T15:30:45.123Z"
}
```

**Cómo importar:**
1. n8n → Workflows → + New → Import from File
2. Selecciona `SEND_OTP_WORKFLOW.json`
3. Configura credenciales de Twilio
4. Activa el workflow

**Cómo probar:**
```powershell
cd zecu
.\scripts\testing\test-webhook-otp.ps1
```

---

## 🎯 Flujo de Trabajo Recomendado

```
1. Lee QUICK_START_MOCK.md          (5 min)
         ↓
2. Importa SEND_OTP_WORKFLOW.json   (1 min)
         ↓
3. Configura credenciales Twilio    (2 min)
         ↓
4. Prueba con datos mock            (2 min)
   (usa MOCK_DATA_OTP.md)
         ↓
5. Si algo falla, consulta          
   DATA_FLOW_DIAGRAM.md
         ↓
6. Integra con Next.js
   (actualiza N8N_WEBHOOK_SEND_OTP_URL)
         ↓
7. ✅ ¡Listo!
```

---

## 🧪 Testing

### Opción 1: Script PowerShell (Windows)
```powershell
cd zecu
.\scripts\testing\test-webhook-otp.ps1
```

### Opción 2: Manual con curl/Invoke-RestMethod
```powershell
$body = @{
    phone = "+5491134070204"
    code = "123456"
    name = "Tomás"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/zecubot-send-otp" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Opción 3: Test en n8n (sin enviar WhatsApp real)
1. Deshabilita el nodo de Twilio
2. Click en "Test workflow"
3. Usa "Listen for Test Event"
4. Envía datos mock

---

## 📊 Estructura de Datos

### Entrada (Next.js → n8n)
```typescript
interface OTPRequest {
  phone: string;      // Ej: "+5491134070204"
  code: string;       // Ej: "123456"
  name?: string;      // Ej: "Tomás Jones" (opcional)
}
```

### Salida (n8n → Next.js)
```typescript
interface OTPResponse {
  success: boolean;
  message?: string;   // Si success: true
  error?: string;     // Si success: false
  timestamp: string;  // ISO 8601
}
```

---

## 🔧 Configuración Requerida

### En n8n:
- [ ] Workflow importado
- [ ] Credenciales de Twilio configuradas
  - Account SID
  - Auth Token
- [ ] Número de origen configurado en nodo Twilio
  - Formato: `whatsapp:+12692562013`
- [ ] Workflow activo (toggle ON)

### En Next.js (`.env.local`):
```env
N8N_WEBHOOK_SEND_OTP_URL=http://localhost:5678/webhook/zecubot-send-otp
```

---

## 🆘 Solución de Problemas

| Problema | Archivo que te Ayudará |
|----------|------------------------|
| No sé cómo empezar | `QUICK_START_MOCK.md` |
| No entiendo cómo funciona | `DATA_FLOW_DIAGRAM.md` |
| Necesito datos de prueba | `MOCK_DATA_OTP.md` |
| Quiero la guía completa | `../N8N_OTP_SETUP_GUIDE.md` |
| Error en un nodo específico | `DATA_FLOW_DIAGRAM.md` (ver output esperado) |
| No recibo WhatsApp | `../N8N_OTP_SETUP_GUIDE.md` → "Solución de Problemas" |

---

## 📞 Errores Comunes

### ❌ "Connection refused"
**Solución:** Asegúrate de que n8n esté corriendo (`http://localhost:5678`)

### ❌ "Webhook not found"
**Solución:** Activa el workflow en n8n (toggle ON)

### ❌ "Authentication failed" (Twilio)
**Solución:** Verifica tus credenciales de Twilio en n8n

### ⚠️ "No recibo WhatsApp"
**Solución:** Si usas Twilio Trial, verifica tu número en: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

---

## 🎉 Próximos Workflows

- [ ] **Detección de Estafas** - Análisis de mensajes con IA
- [ ] **Contabilización de Consultas** - Sistema de límites por plan
- [ ] **Webhook Mercado Pago** - Procesamiento de pagos
- [ ] **Notificaciones** - Alertas y recordatorios

---

## 📚 Links Útiles

- **n8n Documentation:** https://docs.n8n.io/
- **Twilio WhatsApp API:** https://www.twilio.com/docs/whatsapp
- **Twilio Console:** https://console.twilio.com/
- **n8n Community:** https://community.n8n.io/

---

**¿Preguntas? Abre un issue o consulta la documentación completa.**

**¡Feliz automatización! 🤖**

