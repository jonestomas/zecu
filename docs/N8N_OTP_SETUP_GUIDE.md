# 📱 Guía Completa: Configurar OTP por WhatsApp con n8n + Twilio

Esta guía te llevará paso a paso para configurar el envío de códigos OTP por WhatsApp usando n8n y Twilio.

---

## ⏱️ Tiempo Estimado

**1 hora** (incluye configuración de credenciales y pruebas)

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener:

- ✅ **Cuenta de Twilio** (con número de WhatsApp)
- ✅ **n8n instalado** y corriendo (local o cloud)
- ✅ **Credenciales de Twilio**:
  - Account SID
  - Auth Token
  - Número de WhatsApp (formato: `+12692562013`)

---

## 🚀 Paso 1: Configurar Credenciales de Twilio en n8n

### 1.1 Acceder a n8n

1. Abre tu instancia de n8n (ej: `http://localhost:5678`)
2. Inicia sesión

### 1.2 Agregar Credenciales de Twilio

1. En n8n, haz clic en **"Settings"** (⚙️) en la barra lateral izquierda
2. Selecciona **"Credentials"**
3. Haz clic en **"+ New Credential"**
4. Busca y selecciona **"Twilio API"**
5. Completa los campos:
   - **Credential Name**: `Twilio Zecubot Production`
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` _(tu Account SID)_
   - **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` _(tu Auth Token)_
6. Haz clic en **"Save"**

### 1.3 Verificar Credenciales

- Asegúrate de que las credenciales se guardaron correctamente
- Anota el nombre de las credenciales (lo necesitarás en el siguiente paso)

---

## 📥 Paso 2: Importar el Workflow de OTP

### 2.1 Ubicar el Archivo JSON

El workflow está en: `zecu/docs/n8n-workflows/SEND_OTP_WORKFLOW.json`

### 2.2 Importar a n8n

1. En n8n, haz clic en **"Workflows"** en la barra lateral
2. Haz clic en **"+ New"** (o **"Import"** si ya tienes otros workflows)
3. Si creaste un nuevo workflow:
   - Haz clic en el menú **"..."** (arriba a la derecha)
   - Selecciona **"Import from File"**
4. Selecciona el archivo `SEND_OTP_WORKFLOW.json`
5. El workflow se importará automáticamente

### 2.3 Verificar Nodos

Deberías ver estos nodos:

1. 🔔 **Webhook Recibir OTP** (trigger)
2. ✅ **Validar Datos**
3. 📝 **Preparar Mensaje**
4. 📱 **Enviar WhatsApp (Twilio)**
5. ✔️ **Respuesta Éxito**
6. ❌ **Respuesta Error (Validación)**
7. ⚠️ **Respuesta Error (Twilio)**

---

## 🔧 Paso 3: Configurar el Nodo de Twilio

### 3.1 Abrir el Nodo de Twilio

1. Haz clic en el nodo **"Enviar WhatsApp (Twilio)"**
2. En el panel derecho, verás la configuración

### 3.2 Seleccionar Credenciales

1. En **"Credential to connect with"**, haz clic en el dropdown
2. Selecciona **"Twilio Zecubot Production"** (las credenciales que creaste)
3. Si no aparecen, haz clic en **"+ Add New"** y configúralas ahora

### 3.3 Configurar el Número de Origen

1. En **"From"**, selecciona **"Expression"** (icono fx)
2. Mantén el valor: `whatsapp:+12692562013` _(reemplaza con tu número de Twilio)_
   - **Importante**: El formato debe ser `whatsapp:+[código_país][número]`
   - Ejemplo: `whatsapp:+14155238886`

### 3.4 Verificar Configuración

- **To**: `={{ 'whatsapp:' + $json.phone }}` _(deja como está)_
- **Message**: `={{ $json.message }}` _(deja como está)_

---

## 🔗 Paso 4: Obtener la URL del Webhook

### 4.1 Activar el Workflow

1. En la esquina superior derecha, cambia el toggle a **"Active"** (ON)
2. El workflow debe estar activo (verde)

### 4.2 Copiar URL del Webhook

1. Haz clic en el nodo **"Webhook Recibir OTP"**
2. En el panel derecho, verás:
   - **Test URL**: `http://localhost:5678/webhook-test/...`
   - **Production URL**: `http://tu-n8n.com/webhook/zecubot-send-otp`
3. **Copia la "Production URL"** (la segunda, sin `-test`)

**Ejemplo de URL:**
\`\`\`
http://localhost:5678/webhook/zecubot-send-otp
\`\`\`
o
\`\`\`
https://n8n.tudominio.com/webhook/zecubot-send-otp
\`\`\`

---

## 🔐 Paso 5: Actualizar Variables de Entorno en Next.js

### 5.1 Editar `.env.local`

1. Abre el archivo `zecu/.env.local`
2. Busca la línea:
   \`\`\`
   N8N_WEBHOOK_SEND_OTP_URL=
   \`\`\`
3. Reemplázala con tu URL del webhook:
   \`\`\`
   N8N_WEBHOOK_SEND_OTP_URL=http://localhost:5678/webhook/zecubot-send-otp
   \`\`\`
   o (si usas n8n cloud/remoto):
   \`\`\`
   N8N_WEBHOOK_SEND_OTP_URL=https://n8n.tudominio.com/webhook/zecubot-send-otp
   \`\`\`

### 5.2 Reiniciar Next.js

1. En tu terminal, presiona `Ctrl + C` para detener el servidor
2. Reinicia con:
   \`\`\`bash
   cd zecu
   npm run dev
   \`\`\`

---

## 🧪 Paso 6: Probar el Flujo Completo

### 6.1 Acceder a la Aplicación

1. Abre tu navegador en: `http://localhost:3000`
2. Cierra sesión si estás logueado

### 6.2 Probar OTP por WhatsApp

1. Haz clic en **"Iniciar Sesión"**
2. Ingresa tu número de teléfono (con código de país):
   - Ejemplo: `+54 11 3407 0204`
3. Haz clic en **"Enviar código"**
4. **Verifica en tu terminal de Next.js**:
   \`\`\`
   📱 Enviando OTP por WhatsApp a +5491134070204
   ✅ OTP enviado por WhatsApp correctamente
   \`\`\`
5. **Verifica en tu WhatsApp**:
   - Deberías recibir un mensaje como:
     \`\`\`
     Hola Tomas! 👋

   Tu código de verificación Zecubot es:

   _123456_

   Este código expira en 5 minutos.

   🔒 Nunca compartas este código con nadie.
   \`\`\`

### 6.3 Ingresar el Código

1. Ingresa el código que recibiste en WhatsApp
2. Haz clic en **"Verificar"**
3. Deberías ser redirigido al dashboard

---

## 🐛 Solución de Problemas

### ❌ Error: "No se pudo enviar el código OTP"

**Posibles causas:**

1. **N8N_WEBHOOK_SEND_OTP_URL vacía o incorrecta**
   - Verifica el archivo `.env.local`
   - Asegúrate de que la URL sea la "Production URL" (sin `-test`)
   - Reinicia el servidor de Next.js

2. **Workflow inactivo en n8n**
   - Verifica que el toggle esté en **"Active" (ON)** en n8n

3. **Credenciales de Twilio incorrectas**
   - Verifica Account SID y Auth Token en n8n
   - Prueba las credenciales manualmente en Twilio Console

4. **Número de WhatsApp incorrecto**
   - Verifica que el número en n8n tenga el formato `whatsapp:+[código][número]`
   - Ej: `whatsapp:+12692562013`

### ⚠️ No recibo el mensaje en WhatsApp

**Posibles causas:**

1. **Número no registrado con Twilio**
   - Si usas Twilio Trial, debes agregar tu número en "Verified Caller IDs"
   - Accede a: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

2. **Formato de número incorrecto**
   - Asegúrate de que el número tenga el formato correcto:
     - Argentina: `+5491134070204` (con el `9` después de `54`)
     - USA: `+12692562013`

3. **Sandbox de WhatsApp no configurado**
   - Si usas WhatsApp Sandbox, envía el mensaje de activación primero
   - Twilio Console → Messaging → Try it out → Send a WhatsApp message

### 🔍 Ver Logs en n8n

Para ver qué está pasando en n8n:

1. Haz clic en **"Executions"** en n8n (barra lateral)
2. Verás una lista de todas las ejecuciones
3. Haz clic en una ejecución para ver los detalles
4. Verás cada nodo y los datos que pasó por él

---

## 📊 Verificar que Todo Funciona

### Checklist de Verificación

- [ ] ✅ Credenciales de Twilio configuradas en n8n
- [ ] ✅ Workflow importado en n8n
- [ ] ✅ Nodo de Twilio configurado con credenciales correctas
- [ ] ✅ Workflow activo (toggle ON)
- [ ] ✅ URL del webhook copiada
- [ ] ✅ `N8N_WEBHOOK_SEND_OTP_URL` actualizada en `.env.local`
- [ ] ✅ Servidor de Next.js reiniciado
- [ ] ✅ OTP recibido por WhatsApp
- [ ] ✅ Login exitoso con el código OTP

---

## 🎯 Siguiente Paso: Producción

Cuando estés listo para producción:

1. **Actualiza la URL del webhook** en `.env.local` con tu dominio público:
   \`\`\`
   N8N_WEBHOOK_SEND_OTP_URL=https://n8n.tudominio.com/webhook/zecubot-send-otp
   \`\`\`

2. **Asegúrate de que n8n esté accesible públicamente** (no `localhost`)

3. **Considera agregar seguridad al webhook**:
   - Agregar autenticación con token
   - Implementar rate limiting
   - Usar HTTPS obligatorio

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. Revisa los logs de Next.js (terminal donde corre `npm run dev`)
2. Revisa las ejecuciones en n8n (sección "Executions")
3. Verifica el formato de tu número de teléfono
4. Asegúrate de que Twilio tenga saldo (si usas cuenta Trial)

---

**¡Listo! Ahora tienes OTP por WhatsApp funcionando con n8n + Twilio 🎉**
