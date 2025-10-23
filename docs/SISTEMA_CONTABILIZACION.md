# 🔢 Sistema de Contabilización de Consultas - Zecubot

Sistema completo para contar y limitar las consultas de usuarios según su plan (Free: 5/mes, Plus: 50/mes).

---

## 📋 Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Base de Datos](#base-de-datos)
3. [API Routes](#api-routes)
4. [Workflow n8n](#workflow-n8n)
5. [Configuración](#configuración)
6. [Pruebas](#pruebas)

---

## 🏗️ Arquitectura

### Flujo Completo

```
Usuario → WhatsApp → Twilio → n8n Webhook
                                    ↓
                         1. Validar Límite (API)
                                    ↓
                         2. ¿Puede consultar?
                                    ↓
                      ┌──────────────┴──────────────┐
                      │                             │
                   SÍ ↓                          NO ↓
            3. Registrar Consulta        Enviar "Límite Alcanzado"
                      ↓                             ↓
            4. Analizar con IA (OpenAI)          FIN
                      ↓
            5. Actualizar Consulta
                      ↓
            6. Enviar Respuesta
                      ↓
                    FIN
```

---

## 💾 Base de Datos

### Tabla `consultas`

```sql
CREATE TABLE consultas (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Datos de la consulta
  mensaje TEXT NOT NULL,
  respuesta TEXT,
  tipo VARCHAR(50) DEFAULT 'analisis_estafa',
  
  -- Análisis de riesgo
  riesgo_detectado BOOLEAN DEFAULT false,
  nivel_riesgo VARCHAR(20), -- 'bajo', 'medio', 'alto'
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mes_periodo VARCHAR(7) NOT NULL -- 'YYYY-MM'
);
```

### Funciones SQL

#### `puede_realizar_consulta(user_id)`

Valida si un usuario puede hacer una consulta.

**Entrada:** `user_id UUID`

**Salida:**
```json
{
  "puede_consultar": true,
  "plan": "plus",
  "consultas_usadas": 12,
  "limite": 50,
  "consultas_restantes": 38
}
```

#### `get_consultas_mes_actual(user_id)`

Obtiene el conteo de consultas del mes actual.

**Entrada:** `user_id UUID`

**Salida:** `INTEGER` (número de consultas)

---

## 🔌 API Routes

### 1. Validar Límite

**Endpoint:** `POST /api/consultas/validar`

**Request:**
```json
{
  "phone": "+5491134070204"
}
```

**Response:**
```json
{
  "puede_consultar": true,
  "plan": "plus",
  "consultas_usadas": 12,
  "limite": 50,
  "consultas_restantes": 38
}
```

**Uso en n8n:**
```javascript
// URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/consultas/validar
// Body: { "phone": "{{ $json.From.replace('whatsapp:', '') }}" }
```

---

### 2. Registrar Consulta

**Endpoint:** `POST /api/consultas/registrar`

**Request:**
```json
{
  "phone": "+5491134070204",
  "mensaje": "Texto del mensaje a analizar",
  "tipo": "analisis_estafa"
}
```

**Response:**
```json
{
  "success": true,
  "consulta_id": "uuid-de-la-consulta",
  "message": "Consulta registrada correctamente"
}
```

**Uso en n8n:**
```javascript
// URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/consultas/registrar
// Body: {
//   "phone": "{{ $node["Webhook WhatsApp"].json["From"].replace('whatsapp:', '') }}",
//   "mensaje": "{{ $node["Webhook WhatsApp"].json["Body"] }}",
//   "tipo": "analisis_estafa"
// }
```

---

### 3. Actualizar Consulta

**Endpoint:** `POST /api/consultas/actualizar`

**Request:**
```json
{
  "consulta_id": "uuid-de-la-consulta",
  "respuesta": "Texto de la respuesta del bot",
  "riesgo_detectado": true,
  "nivel_riesgo": "alto"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consulta actualizada correctamente"
}
```

**Uso en n8n:**
```javascript
// URL: {{$env.NEXT_PUBLIC_BASE_URL}}/api/consultas/actualizar
// Body: {
//   "consulta_id": "{{ $node["Registrar Consulta"].json["consulta_id"] }}",
//   "respuesta": "{{ $json.message.content }}",
//   "riesgo_detectado": true,
//   "nivel_riesgo": "alto"
// }
```

---

## 🤖 Workflow n8n

### Descripción de Nodos

**Archivo:** `zecu/docs/n8n-workflows/BOT_WHATSAPP_CON_CONTABILIZACION.json`

#### 1. **Webhook WhatsApp**
- Recibe mensajes de WhatsApp vía Twilio
- Extrae: `From` (número), `Body` (mensaje)

#### 2. **Validar Límite**
- Llama a `/api/consultas/validar`
- Verifica si el usuario puede hacer más consultas

#### 3. **¿Puede Consultar?** (Condicional)
- **TRUE:** Continúa al análisis
- **FALSE:** Envía mensaje de límite alcanzado

#### 4. **Registrar Consulta**
- Llama a `/api/consultas/registrar`
- Guarda el mensaje en la BD
- Obtiene `consulta_id` para actualizar después

#### 5. **Analizar con IA (OpenAI)**
- Usa GPT-4o-mini para analizar el mensaje
- Detecta: tipo de riesgo, nivel, recomendaciones

#### 6. **Actualizar Consulta**
- Llama a `/api/consultas/actualizar`
- Guarda la respuesta y análisis de riesgo

#### 7. **Enviar Respuesta (Twilio)**
- Envía el análisis al usuario por WhatsApp

#### 8. **Enviar Límite Alcanzado (Twilio)**
- Si no puede consultar, envía mensaje con opción de upgrade

---

## ⚙️ Configuración

### 1. Variables de Entorno

Asegúrate de tener en `.env.local`:

```env
# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# OpenAI (para n8n)
OPENAI_API_KEY=sk-xxx

# Twilio (para n8n)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_NUMBER=+12692562013
```

### 2. Aplicar Migración en Supabase

La migración ya está aplicada (`004_create_consultas_table.sql`), pero si necesitas verificar:

```bash
# Verifica en Supabase Dashboard → SQL Editor
SELECT * FROM consultas LIMIT 10;
SELECT * FROM pg_proc WHERE proname = 'puede_realizar_consulta';
```

### 3. Importar Workflow en n8n

1. Abre n8n.cloud
2. Click en "+ New Workflow"
3. Click en "..." → "Import from File"
4. Selecciona: `zecu/docs/n8n-workflows/BOT_WHATSAPP_CON_CONTABILIZACION.json`
5. Configura credenciales:
   - OpenAI API
   - Twilio API
6. Actualiza `NEXT_PUBLIC_BASE_URL` si es necesario
7. Activa el workflow

### 4. Configurar Twilio Webhook

1. Ve a Twilio Console → Messaging → WhatsApp → Sandbox
2. En "When a message comes in":
   - URL: `https://tu-n8n.app.n8n.cloud/webhook/zecubot-whatsapp`
   - Method: `POST`
3. Click "Save"

---

## 🧪 Pruebas

### Test 1: Validar Límite

```bash
curl -X POST http://localhost:3000/api/consultas/validar \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5491134070204"
  }'
```

**Respuesta Esperada:**
```json
{
  "puede_consultar": true,
  "plan": "plus",
  "consultas_usadas": 0,
  "limite": 50,
  "consultas_restantes": 50
}
```

---

### Test 2: Registrar Consulta

```bash
curl -X POST http://localhost:3000/api/consultas/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5491134070204",
    "mensaje": "Gané un premio! Haz click aquí para reclamar",
    "tipo": "analisis_estafa"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "consulta_id": "abc-123-def-456",
  "message": "Consulta registrada correctamente"
}
```

---

### Test 3: Flujo Completo vía WhatsApp

1. Envía un mensaje al número de WhatsApp de Twilio
2. Ejemplo: `"Me llegó este mensaje: Ganaste $10,000! Haz click aquí"`
3. Verifica en n8n:
   - Ejecución exitosa
   - Todos los nodos en verde
4. Verifica en WhatsApp:
   - Deberías recibir el análisis del bot
5. Verifica en Supabase:
   ```sql
   SELECT * FROM consultas ORDER BY created_at DESC LIMIT 1;
   ```

---

### Test 4: Límite Alcanzado

Para probar el límite, inserta consultas manualmente:

```sql
-- Insertar 5 consultas para un usuario Free
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE phone = '+5491134070204';
  
  FOR i IN 1..5 LOOP
    INSERT INTO consultas (user_id, mensaje, mes_periodo)
    VALUES (v_user_id, 'Test ' || i, TO_CHAR(NOW(), 'YYYY-MM'));
  END LOOP;
END $$;
```

Ahora envía un nuevo mensaje por WhatsApp y deberías recibir:
> 🚫 Límite Alcanzado
> 
> Has alcanzado el límite de consultas de tu plan FREE.
> ...

---

## 📊 Estadísticas y Monitoreo

### Ver Consultas por Usuario

```sql
SELECT 
  u.phone,
  u.name,
  u.plan,
  COUNT(c.id) as total_consultas,
  COUNT(c.id) FILTER (WHERE c.riesgo_detectado = true) as con_riesgo,
  c.mes_periodo
FROM users u
LEFT JOIN consultas c ON u.id = c.user_id
WHERE c.mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
GROUP BY u.id, c.mes_periodo
ORDER BY total_consultas DESC;
```

### Top Usuarios por Consultas

```sql
SELECT 
  u.phone,
  u.name,
  u.plan,
  COUNT(c.id) as total_consultas
FROM users u
LEFT JOIN consultas c ON u.id = c.user_id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id
ORDER BY total_consultas DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### Error: "Usuario no encontrado"

**Causa:** El número de teléfono no existe en la tabla `users`

**Solución:**
1. Verifica que el usuario esté registrado
2. Verifica el formato del número (+54 9 11...)

### Error: "Error al validar límite"

**Causa:** La función SQL no existe o hay un error

**Solución:**
```sql
-- Verificar que la función existe
SELECT * FROM pg_proc WHERE proname = 'puede_realizar_consulta';

-- Si no existe, re-aplicar migración
```

### El bot no responde

**Causa:** Webhook de Twilio no configurado o n8n inactivo

**Solución:**
1. Verifica que el workflow esté ACTIVO en n8n
2. Verifica la URL del webhook en Twilio
3. Revisa las ejecuciones en n8n para ver errores

---

## 📈 Próximas Mejoras

- [ ] Dashboard con estadísticas en tiempo real
- [ ] Notificaciones cuando un usuario alcanza el límite
- [ ] Sistema de "rollover" de consultas no usadas
- [ ] Reportes mensuales por email
- [ ] Panel de admin para ver consultas en tiempo real

---

**¡Sistema de Contabilización Completo!** 🎉

