# Correcciones para Workflow de Contabilización en n8n

## 📋 Instrucciones Generales
Debes modificar estos nodos en tu workflow de n8n. Para cada nodo, busca por su **nombre** y aplica los cambios indicados.

---

## 1️⃣ **Nodo: "Validar Límite"**

### ❌ Configuración Actual (INCORRECTA):
\`\`\`
Type: HTTP Request
URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/consultas/validar
Method: (no especificado, usa GET por defecto)
Body Parameters:
  - phone: {{ $json.From.replace('whatsapp:', '') }}
\`\`\`

### ✅ Configuración Correcta:
\`\`\`
Type: HTTP Request
Method: POST
URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/consultas/validar
Authentication: None

Headers:
  Content-Type: application/json

Body:
  Body Content Type: JSON
  JSON:
  {
    "userId": "{{ $('Get a row').item.json.id }}"
  }
\`\`\`

**Explicación**: 
- Cambiamos a método **POST**
- Cambiamos `phone` por `userId` 
- Obtenemos el `userId` del nodo "Get a row" que trae el usuario de Supabase

---

## 2️⃣ **Nodo: "Registrar Consulta"**

### ❌ Configuración Actual (INCORRECTA):
\`\`\`
Type: HTTP Request
URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/consultas/registrar
Body Parameters:
  - phone: {{ $node["Webhook WhatsApp"].json["From"].replace('whatsapp:', '') }}
  - mensaje: {{ $node["Webhook WhatsApp"].json["Body"] }}
  - tipo: analisis_estafa
\`\`\`

### ✅ Configuración Correcta:
\`\`\`
Type: HTTP Request
Method: POST
URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/consultas/registrar
Authentication: None

Headers:
  Content-Type: application/json

Body:
  Body Content Type: JSON
  JSON:
  {
    "userId": "{{ $('Get a row').item.json.id }}",
    "mensaje": "{{ $('data_extraction').item.json.body }}",
    "tipo": "analisis_estafa"
  }
\`\`\`

**Explicación**: 
- Cambiamos referencias a nodos que SÍ existen: `data_extraction` y `Get a row`
- Cambiamos `phone` por `userId`
- Usamos el campo `body` de `data_extraction` que contiene el mensaje del usuario

---

## 3️⃣ **Nodo: "Enviar Límite Alcanzado (Twilio)"**

### ❌ Configuración Actual (INCORRECTA):
\`\`\`
Type: Twilio
From: +12692562013
To: =
(campo vacío)
\`\`\`

### ✅ Configuración Correcta:
\`\`\`
Type: Twilio
From: +12692562013
To: {{ $('data_extraction').item.json.from }}
To WhatsApp: true

Message:
🚫 *Límite Alcanzado*

Has alcanzado el límite de consultas de tu plan *{{ $('Validar Límite').json.plan.toUpperCase() }}*.

📊 Consultas usadas: {{ $('Validar Límite').json.consultas_usadas }}/{{ $('Validar Límite').json.limite }}

💎 *Actualiza a Plan Plus* para obtener:
✅ 50 consultas por mes
✅ Análisis más detallados
✅ Soporte prioritario

👉 Actualiza aquí: {{$env.NEXT_PUBLIC_BASE_URL}}/checkout
\`\`\`

**Explicación**: 
- Agregamos el campo `To` que estaba vacío
- Tomamos el número de teléfono de `data_extraction.from`

---

## 4️⃣ **Nodo: "HTTP Request2" (Actualizar Consulta)**

### ⚠️ **PROBLEMA IMPORTANTE**
Este nodo está conectado como **herramienta del AI Agent** (`httpRequestTool`), lo cual NO es lo que necesitamos. Debe ser un nodo normal que se ejecute **después** del AI Agent.

### 🔧 Solución: **ELIMINAR y RECREAR**

#### Paso 1: Eliminar el nodo "HTTP Request2" actual

#### Paso 2: Crear nuevo nodo "Actualizar Consulta"
\`\`\`
Type: HTTP Request (NO httpRequestTool)
Method: POST
URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/consultas/actualizar
Authentication: None

Headers:
  Content-Type: application/json

Body:
  Body Content Type: JSON
  JSON:
  {
    "consultaId": "{{ $('Registrar Consulta').json.consultaId }}",
    "respuesta": "{{ $('AI Agent1').json.output }}",
    "riesgo_detectado": {{ $('AI Agent1').json.output.toLowerCase().includes('riesgo: sí') || $('AI Agent1').json.output.toLowerCase().includes('riesgo: si') }},
    "nivel_riesgo": "{{ $('AI Agent1').json.output.toLowerCase().includes('alto') ? 'alto' : ($('AI Agent1').json.output.toLowerCase().includes('medio') ? 'medio' : 'bajo') }}"
  }
\`\`\`

#### Paso 3: Reconectar el flujo
\`\`\`
AI Agent1 
   ↓
Actualizar Consulta (nuevo nodo)
   ↓
Send an SMS/MMS/WhatsApp message3
\`\`\`

**Explicación**:
- Convertimos la herramienta en un nodo normal
- Agregamos todos los campos necesarios: `respuesta`, `riesgo_detectado`, `nivel_riesgo`
- El nodo se ejecuta ENTRE el AI Agent y el envío del mensaje de WhatsApp

---

## 5️⃣ **IMPORTANTE: Conectar "Get a row" con "Validar Límite"**

Actualmente tu flujo va:
\`\`\`
data_extraction → Validar Límite
\`\`\`

Debe ir:
\`\`\`
data_extraction → Get a row → Validar Límite
\`\`\`

### 🔧 Cómo hacerlo:
1. Desconecta el cable entre `data_extraction` y `Validar Límite`
2. Conecta `data_extraction` con `Get a row`
3. Conecta `Get a row` con `Validar Límite`

**Razón**: Necesitamos el `user_id` de Supabase antes de validar el límite.

---

## 📊 **Flujo Corregido Completo**

\`\`\`
Twilio Trigger
    ↓
Code in JavaScript
    ↓
data_extraction
    ↓
Get a row (obtener usuario de Supabase)
    ↓
Validar Límite (POST con userId)
    ↓
¿Puede Consultar?
    ├── NO → Enviar Límite Alcanzado → FIN
    └── SÍ ↓
Registrar Consulta (POST con userId)
    ↓
Plan (switch de planes)
    ├── free → Text Classifier → Bot Saludo → Send Message → FIN
    └── plus/premium ↓
Switch3 (verificar multimedia)
    ├── Text → Text Classifier1 → Bot Saludo1 → Send Message → FIN
    └── Multimedia → (prohibido para plan free)
    ↓
Campos_texto1
    ↓
Buffer1
    ↓
Get Buffer1
    ↓
Switch5 (timing)
    ↓
Redis1
    ↓
Edit Fields1
    ↓
Send SMS "Estoy analizando..."
    ↓
AI Agent1 (análisis)
    ↓
**Actualizar Consulta (NUEVO)** ← AGREGAR AQUÍ
    ↓
Send an SMS/MMS/WhatsApp message3 (respuesta final)
\`\`\`

---

## 🧪 **Prueba Final**

Después de aplicar todos los cambios:

1. **Activa** el workflow en n8n
2. **Envía** un mensaje de WhatsApp al bot: `"Hola, necesito ayuda"`
3. **Verifica** en los logs de n8n:
   - ✅ "Validar Límite" devuelve `puede_consultar: true`
   - ✅ "Registrar Consulta" devuelve `consultaId`
   - ✅ AI Agent responde
   - ✅ "Actualizar Consulta" se ejecuta exitosamente
   - ✅ Recibes la respuesta en WhatsApp

4. **Verifica** en Supabase:
   - Tabla `consultas` tiene un nuevo registro
   - Campo `respuesta` está lleno
   - Campo `mes_periodo` es correcto (formato: `2025-10`)

---

## 🎯 **Resumen de Cambios**

| Nodo | Cambio Principal |
|------|------------------|
| **Validar Límite** | Agregar método POST, cambiar `phone` → `userId` |
| **Registrar Consulta** | Corregir referencias, cambiar `phone` → `userId` |
| **Enviar Límite Alcanzado** | Agregar campo `to` |
| **HTTP Request2** | ELIMINAR y recrear como nodo normal con todos los campos |
| **Flujo** | Mover "Get a row" antes de "Validar Límite" |

---

## ❓ **¿Necesitas Ayuda?**

Si tienes dudas sobre cómo aplicar algún cambio en n8n:
1. Abre el nodo en cuestión
2. Busca la sección "Parameters" o "Fields"
3. Modifica los valores según esta guía
4. Guarda el workflow

¡Cualquier duda me avisas! 🚀


