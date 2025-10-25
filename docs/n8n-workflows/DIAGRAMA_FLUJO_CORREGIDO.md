# 📊 Diagrama Visual del Flujo Corregido

## 🎯 Vista General

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│ INICIO: Usuario envía mensaje │
│ por WhatsApp │
└────────────────────────────┬────────────────────────────────────┘
↓
┌────────────────┐
│ Twilio Trigger │
│ (Recepción) │
└────────┬───────┘
↓
┌──────────────────────────┐
│ Code in JavaScript │
│ (Limpia "whatsapp:") │
└──────────┬───────────────┘
↓
┌──────────────────────┐
│ data_extraction │
│ (Extrae campos) │
└──────────┬───────────┘
↓
┌────────────────────────────────────────────────────────────────┐
│ SISTEMA DE CONTABILIZACIÓN │
│ ⚡ EMPIEZA AQUÍ ⚡ │
└────────────────────────────────────────────────────────────────┘
↓
┌──────────────────────┐
│ Get a row │◄─── ✅ AGREGAR ESTA CONEXIÓN
│ (Obtener user_id │
│ de Supabase) │
└──────────┬───────────┘
↓
┌──────────────────────┐
│ Validar Límite │
│ POST /validar │
│ {userId} │◄─── ✅ CAMBIAR phone → userId
└──────────┬───────────┘
↓
┌──────────────────────┐
│ ¿Puede Consultar? │
│ (if node) │
└────┬──────────────┬──┘
│ │
❌ NO │ │ ✅ SÍ
↓ ↓
┌──────────────────┐ ┌──────────────────┐
│ Enviar Límite │ │ Registrar │
│ Alcanzado │ │ Consulta │
│ (Twilio) │ │ POST /registrar │◄─── ✅ CAMBIAR phone → userId
└────────┬─────────┘ │ {userId, mensaje}│
│ └────────┬─────────┘
↓ ↓
[FIN] ┌──────────────────┐
│ Plan │
│ (Switch) │
└────────┬─────────┘
↓
(Continúa con el
flujo de análisis)
\`\`\`

---

## 🔍 Detalle: Nodo "Validar Límite"

\`\`\`
┌─────────────────────────────────────────────────────┐
│ NODO: Validar Límite │
├─────────────────────────────────────────────────────┤
│ Type: HTTP Request │
│ Method: POST ◄─── ✅ IMPORTANTE: Debe ser POST │
│ URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/ │
│ consultas/validar │
│ │
│ Headers: │
│ Content-Type: application/json │
│ │
│ Body (JSON): │
│ { │
│ "userId": "{{ $('Get a row').item.json.id }}" │◄── ✅ Desde Supabase
│ } │
└─────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────┐
│ RESPUESTA ESPERADA │
├─────────────────────────────────────────────────────┤
│ { │
│ "puede_consultar": true, │
│ "plan": "free", │
│ "consultas_usadas": 2, │
│ "limite": 5, │
│ "consultas_restantes": 3 │
│ } │
└─────────────────────────────────────────────────────┘
\`\`\`

---

## 🔍 Detalle: Nodo "Registrar Consulta"

\`\`\`
┌─────────────────────────────────────────────────────┐
│ NODO: Registrar Consulta │
├─────────────────────────────────────────────────────┤
│ Type: HTTP Request │
│ Method: POST │
│ URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/ │
│ consultas/registrar │
│ │
│ Headers: │
│ Content-Type: application/json │
│ │
│ Body (JSON): │
│ { │
│ "userId": "{{ $('Get a row').item.json.id }}", │
│ "mensaje": "{{ $('data_extraction').           │
│                      item.json.body }}", │
│ "tipo": "analisis_estafa" │
│ } │
└─────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────┐
│ RESPUESTA ESPERADA │
├─────────────────────────────────────────────────────┤
│ { │
│ "success": true, │
│ "consultaId": "uuid-aquí", ◄─── ✅ GUARDAR ESTE ID
│ "message": "Consulta registrada correctamente" │
│ } │
└─────────────────────────────────────────────────────┘
\`\`\`

---

## 🔍 Detalle: Nodo "Actualizar Consulta" (NUEVO)

\`\`\`
┌─────────────────────────────────────────────────────┐
│ UBICACIÓN: Entre AI Agent1 y envío de respuesta │
└─────────────────────────────────────────────────────┘
↓
┌──────────────────────┐
│ AI Agent1 │
│ (Análisis IA) │
└──────────┬───────────┘
↓
┌─────────────────────────────────────────────────────┐
│ NODO: Actualizar Consulta (NUEVO) │
├─────────────────────────────────────────────────────┤
│ Type: HTTP Request (NO httpRequestTool) │
│ Method: POST │
│ URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/ │
│ consultas/actualizar │
│ │
│ Body (JSON): │
│ { │
│ "consultaId": "{{ $('Registrar Consulta').      │
│                      json.consultaId }}", │
│ "respuesta": "{{ $('AI Agent1').json.output }}",│
│ "riesgo_detectado": {{                           │
│      $('AI Agent1').json.output.toLowerCase()       │
│        .includes('riesgo: sí') ||                   │
│      $('AI Agent1').json.output.toLowerCase()       │
│        .includes('riesgo: si')                      │
│    }}, │
│ "nivel_riesgo": "{{                              │
│      $('AI Agent1').json.output.toLowerCase()       │
│        .includes('alto') ? 'alto' :                 │
│      ($('AI Agent1').json.output.toLowerCase()      │
│        .includes('medio') ? 'medio' : 'bajo')       │
│    }}" │
│ } │
└─────────────────────────────────────────────────────┘
↓
┌──────────────────────┐
│ Send SMS/WhatsApp │
│ (Respuesta final) │
└──────────────────────┘
\`\`\`

---

## 🚦 Estados del Flujo

### ✅ Caso 1: Usuario PUEDE consultar (plan vigente)

\`\`\`
Usuario → Validar → puede_consultar: true → Registrar → Análisis → Actualizar → Respuesta
\`\`\`

### ❌ Caso 2: Usuario NO puede consultar (límite alcanzado)

\`\`\`
Usuario → Validar → puede_consultar: false → Mensaje de límite → [FIN]
\`\`\`

---

## 📝 Checklist de Correcciones

### Antes de continuar, verifica que hayas aplicado TODOS estos cambios:

- [ ] **1. Nodo "Validar Límite"**
  - [ ] Método cambiado a POST
  - [ ] Body usa `userId` en vez de `phone`
  - [ ] `userId` proviene de `$('Get a row').item.json.id`

- [ ] **2. Nodo "Registrar Consulta"**
  - [ ] Método es POST
  - [ ] Body usa `userId` en vez de `phone`
  - [ ] Referencias corregidas: `data_extraction` y `Get a row`

- [ ] **3. Nodo "Enviar Límite Alcanzado"**
  - [ ] Campo `to` completado con `$('data_extraction').item.json.from`

- [ ] **4. Nodo "Actualizar Consulta"**
  - [ ] Nodo viejo eliminado
  - [ ] Nodo nuevo creado (HTTP Request normal, NO tool)
  - [ ] Ubicado entre AI Agent1 y envío de respuesta
  - [ ] Envía: consultaId, respuesta, riesgo_detectado, nivel_riesgo

- [ ] **5. Conexiones del Flujo**
  - [ ] `data_extraction` → `Get a row`
  - [ ] `Get a row` → `Validar Límite`
  - [ ] `AI Agent1` → `Actualizar Consulta` → `Send SMS`

---

## 🎯 Próximo Paso

Después de aplicar TODAS las correcciones:

1. **Guarda** el workflow en n8n
2. **Actívalo**
3. **Prueba** enviando un mensaje de WhatsApp
4. **Verifica** los logs de cada nodo
5. **Confirma** que se registró en Supabase

¿Todo listo para aplicar los cambios? 🚀
