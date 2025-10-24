# 🚀 Implementación SUPER Simple - Contador en Tabla Users

## 🎯 Estrategia

**Idea**: En lugar de una tabla separada de `consultas`, agregamos una columna `consultas_mes` directamente en la tabla `users`. Cada mes se resetea automáticamente.

**Ventajas**:
- ✅ Una sola query para obtener usuario Y contador
- ✅ No necesitas contar registros
- ✅ Súper rápido y simple
- ✅ Perfecto para MVP

---

## 📋 Checklist de Implementación

### ✅ Paso 1: Aplicar Migración en Supabase (2 min)

1. **Abre** Supabase Dashboard → Tu proyecto → SQL Editor
2. **Copia y pega** el contenido de: `zecu/supabase/migrations/005_add_consultas_counter.sql`
3. **Ejecuta** (RUN)
4. **Verifica** que veas: "✅ Migración 005 completada"

**Resultado**: La tabla `users` ahora tiene:
- `consultas_mes` (INTEGER) - Contador de consultas del mes
- `mes_periodo` (VARCHAR) - Mes actual (ej: "2025-10")

---

### ✅ Paso 2: Nodo "Get a row" (Ya lo tienes)

**Configuración actual (verificar)**:
\`\`\`
Type: Supabase → Get Rows
Table: users
Filter:
  - Field: phone
  - Operator: Equal
  - Value: {{ $('data_extraction').item.json.from.replace('whatsapp:', '') }}
\`\`\`

**Output esperado** (ahora con las nuevas columnas):
\`\`\`json
{
  "id": "uuid-usuario",
  "phone": "+5491134070204",
  "name": "Tomás",
  "plan": "free",
  "consultas_mes": 3,
  "mes_periodo": "2025-10"
}
\`\`\`

---

### ✅ Paso 3: Agregar IF en Rama FREE (5 min)

**Ubicación**: Después del Switch "Plan", en la rama `free`, **ANTES** de procesar con el bot

\`\`\`
Plan Switch
    ↓
  [free] ──→ 🆕 IF: Validar Límite FREE
                ↓
              ¿consultas_mes < 5?
                ├─ NO → Mensaje límite → FIN
                └─ SÍ → Bot responde
\`\`\`

#### Configuración del IF:

\`\`\`
Nombre del nodo: "¿Puede Consultar? (FREE)"
Type: IF

Conditions:
  Mode: Simple
  
  Condition 1:
    Value 1: {{ $('Get a row').item.json.consultas_mes }}
    Operation: Smaller (<)
    Value 2: 5
\`\`\`

**Conexiones**:
- **TRUE** (Verde) → Conectar al flujo actual de FREE (Text Classifier, etc.)
- **FALSE** (Rojo) → Conectar a nuevo nodo "Enviar Límite FREE"

---

### ✅ Paso 4: Nodo "Enviar Límite FREE" (3 min)

**Solo se ejecuta si consultas_mes >= 5**

\`\`\`
Type: Twilio → Send an SMS/MMS/WhatsApp message

From: whatsapp:+12692562013
To: {{ $('data_extraction').item.json.from }}

Message:
🚫 *Límite Alcanzado*

Hola {{ $('Get a row').item.json.name || 'Usuario' }}, has usado tus *5 consultas gratuitas* de este mes.

📊 Plan actual: *FREE*
📈 Consultas: {{ $('Get a row').item.json.consultas_mes }}/5

💎 *Actualiza a Plan Plus*
✅ 20 consultas al mes
✅ Análisis más profundos
✅ Soporte prioritario

👉 Mejora aquí: {{$env.NEXT_PUBLIC_BASE_URL}}/checkout
\`\`\`

---

### ✅ Paso 5: Agregar IF en Rama PLUS (5 min)

**Ubicación**: Después del Switch "Plan", en la rama `plus`/`premium`, **ANTES** de procesar

\`\`\`
Plan Switch
    ↓
  [plus] ──→ 🆕 IF: Validar Límite PLUS
                ↓
              ¿consultas_mes < 20?
                ├─ NO → Mensaje límite → FIN
                └─ SÍ → AI Agent
\`\`\`

#### Configuración del IF:

\`\`\`
Nombre del nodo: "¿Puede Consultar? (PLUS)"
Type: IF

Conditions:
  Mode: Simple
  
  Condition 1:
    Value 1: {{ $('Get a row').item.json.consultas_mes }}
    Operation: Smaller (<)
    Value 2: 20
\`\`\`

**Conexiones**:
- **TRUE** → Flujo actual PLUS (Switch multimedia, AI Agent, etc.)
- **FALSE** → "Enviar Límite PLUS"

---

### ✅ Paso 6: Nodo "Enviar Límite PLUS" (3 min)

\`\`\`
Type: Twilio → Send an SMS/MMS/WhatsApp message

From: whatsapp:+12692562013
To: {{ $('data_extraction').item.json.from }}

Message:
🚫 *Límite Alcanzado*

Hola {{ $('Get a row').item.json.name || 'Usuario' }}, has usado tus *20 consultas* de este mes.

📊 Plan actual: *PLUS*
📈 Consultas: {{ $('Get a row').item.json.consultas_mes }}/20

💎 *Actualiza a Plan Premium*
✅ 50 consultas al mes
✅ Análisis avanzados
✅ Prioridad máxima

👉 Mejora aquí: {{$env.NEXT_PUBLIC_BASE_URL}}/checkout
\`\`\`

---

### ✅ Paso 7: Incrementar Contador (Al Final) (5 min)

**Ubicación**: **DESPUÉS** de que el bot responda (antes del último Send WhatsApp)

#### Opción A: Nodo Supabase Update (Recomendado)

\`\`\`
Nombre: "Incrementar Consultas"
Type: Supabase → Update a Row
Table: users

Filter (para encontrar el usuario):
  - Field: id
  - Operator: Equal
  - Value: {{ $('Get a row').item.json.id }}

Columns to Update:
  consultas_mes: {{ $('Get a row').item.json.consultas_mes + 1 }}
\`\`\`

#### Opción B: Llamar a la Función SQL (Más Robusto)

\`\`\`
Nombre: "Incrementar Consultas"
Type: Supabase → Execute SQL

Query:
SELECT incrementar_consultas('{{ $('Get a row').item.json.id }}'::UUID);
\`\`\`

**Nota**: La Opción B es mejor porque la función `incrementar_consultas()` ya maneja el reset automático del mes.

---

## 🔄 Flujo Completo Final

\`\`\`
Usuario envía mensaje
    ↓
Twilio Trigger
    ↓
Code JavaScript
    ↓
data_extraction
    ↓
Get a row (Supabase)
    ↓
Plan Switch
    ├─ [FREE]
    │   ↓
    │   ¿consultas_mes < 5? (IF)
    │   ├─ NO → Enviar Límite FREE → FIN
    │   └─ SÍ → Text Classifier → Bot → Incrementar → Send → FIN
    │
    └─ [PLUS/PREMIUM]
        ↓
        ¿consultas_mes < 20? (IF)
        ├─ NO → Enviar Límite PLUS → FIN
        └─ SÍ → AI Agent → Incrementar → Send → FIN
\`\`\`

---

## 📊 Estructura de Tabla Users (Actualizada)

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone VARCHAR UNIQUE,
  name VARCHAR,
  plan VARCHAR DEFAULT 'free',
  email VARCHAR,
  consultas_mes INTEGER DEFAULT 0,        -- 🆕 NUEVO
  mes_periodo VARCHAR(7) DEFAULT '2025-10', -- 🆕 NUEVO
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

## 🧪 Pruebas

### Test 1: Usuario FREE con 2 consultas ✅

1. **Simula** en Supabase:
   \`\`\`sql
   UPDATE users 
   SET consultas_mes = 2, mes_periodo = '2025-10'
   WHERE phone = '+5491134070204';
   \`\`\`

2. **Envía** mensaje al bot
3. **Verifica**:
   - ✅ IF permite pasar (2 < 5)
   - ✅ Bot responde
   - ✅ `consultas_mes` ahora es 3

### Test 2: Usuario FREE con 5 consultas ❌

1. **Simula**:
   \`\`\`sql
   UPDATE users 
   SET consultas_mes = 5
   WHERE phone = '+5491134070204';
   \`\`\`

2. **Envía** mensaje
3. **Verifica**:
   - ✅ IF bloquea (5 >= 5)
   - ✅ Recibes mensaje de límite
   - ✅ `consultas_mes` NO se incrementa

### Test 3: Reset automático de mes 🔄

1. **Simula** mes anterior:
   \`\`\`sql
   UPDATE users 
   SET consultas_mes = 5, mes_periodo = '2024-09'
   WHERE phone = '+5491134070204';
   \`\`\`

2. **Envía** mensaje
3. **Verifica**:
   - ✅ La función `incrementar_consultas()` detecta mes diferente
   - ✅ Resetea a 1 (no a 0, porque ya contó esta consulta)
   - ✅ Actualiza `mes_periodo` a '2025-10'

---

## 🎯 Límites Configurables

Si quieres cambiar los límites, edita los nodos IF:

| Plan | Límite Actual | Dónde Cambiar |
|------|---------------|---------------|
| **FREE** | 5 consultas | Nodo "¿Puede Consultar? (FREE)" → Value 2 |
| **PLUS** | 20 consultas | Nodo "¿Puede Consultar? (PLUS)" → Value 2 |
| **PREMIUM** | 20 consultas | Mismo nodo que PLUS (o crear uno separado) |

---

## 🔍 Verificación en Supabase

Para ver el estado de tus usuarios:

\`\`\`sql
-- Ver contador de todos los usuarios
SELECT 
  name,
  phone,
  plan,
  consultas_mes,
  mes_periodo,
  created_at
FROM users
ORDER BY consultas_mes DESC;

-- Resetear manualmente un usuario (para testing)
UPDATE users
SET consultas_mes = 0, mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
WHERE phone = '+5491134070204';

-- Ver quién alcanzó el límite
SELECT name, plan, consultas_mes
FROM users
WHERE (plan = 'free' AND consultas_mes >= 5)
   OR (plan = 'plus' AND consultas_mes >= 20);
\`\`\`

---

## 🚨 Solución de Problemas

### ❌ Error: "column consultas_mes does not exist"
**Solución**: No aplicaste la migración 005. Ve al Paso 1.

### ⚠️ El contador no se incrementa
**Causa**: El nodo "Incrementar Consultas" está mal ubicado o no conectado
**Solución**: Debe estar DESPUÉS del AI Agent/Bot, ANTES del Send final

### ⚠️ El contador no se resetea cada mes
**Causa**: Estás usando la Opción A (Update simple) en lugar de la Opción B
**Solución**: Usa la función `incrementar_consultas()` (Opción B)

### ❌ IF no funciona correctamente
**Causa**: Sintaxis incorrecta en la expresión
**Solución**: Asegúrate de usar exactamente:
\`\`\`
{{ $('Get a row').item.json.consultas_mes }}
\`\`\`

---

## 📈 Próximas Mejoras (Post-MVP)

Una vez que valides con usuarios reales:

- [ ] Separar límite PLUS (20) de PREMIUM (50)
- [ ] Tabla `consultas` separada para analytics
- [ ] Dashboard de estadísticas
- [ ] Notificaciones cuando quedan 2 consultas
- [ ] Sistema de "rollover" de consultas no usadas

---

## ✅ Resumen de Cambios

| Qué | Dónde | Qué Hace |
|-----|-------|----------|
| **Migración SQL** | `005_add_consultas_counter.sql` | Agrega columnas a users |
| **IF FREE** | Rama free del Plan Switch | Valida límite de 5 |
| **IF PLUS** | Rama plus del Plan Switch | Valida límite de 20 |
| **Incrementar** | Después de AI Agent/Bot | +1 al contador |
| **Mensajes Límite** | Cuando IF = FALSE | Notifica y ofrece upgrade |

---

## 🎉 ¡Listo!

**Total de tiempo**: ~20 minutos  
**Archivos modificados**: 0 (solo n8n)  
**Archivos nuevos**: 1 migración SQL  
**Complejidad**: ⭐ Baja (perfecto para MVP)

**¿Dudas? Avísame en qué paso estás y te ayudo.** 🚀
