# 🚀 Sistema de Contabilización MVP - Versión Simplificada

## 🎯 Objetivo

Implementar un sistema de conteo de consultas **sin APIs intermedias**, usando solo nodos de Supabase directamente en n8n.

**Perfecto para**: MVP, prototipo rápido, menos mantenimiento

---

## 📊 Flujo Simplificado

\`\`\`
Usuario envía mensaje
    ↓
🗄️ Get User (Supabase)
    ↓
📊 Count Consultas (Supabase SQL)
    ↓
🧮 Calcular Límite (Code)
    ↓
🤔 ¿Puede consultar? (IF)
    ├─ NO → 📵 Mensaje límite → FIN
    └─ SÍ → 🤖 AI Agent
           ↓
        💾 Insert Consulta (Supabase)
           ↓
        📤 Enviar respuesta → FIN
\`\`\`

---

## 🛠️ Configuración en n8n (Paso a Paso)

### **Paso 1: Agregar Nodo "Get User"** 🗄️

**Ubicación**: Después de `data_extraction`, antes del flujo actual

\`\`\`
Type: Supabase → Get All Rows
Credentials: Tu conexión de Supabase
Table: users

Filters:
  - Field: phone
  - Operator: Equal
  - Value: {{ $('data_extraction').item.json.from.replace('whatsapp:', '') }}

Options:
  - Select: * (todos los campos)
\`\`\`

**Output esperado**:
\`\`\`json
{
  "id": "uuid-del-usuario",
  "phone": "+5491134070204",
  "name": "Tomás Jones",
  "plan": "free",
  "created_at": "2024-10-23T..."
}
\`\`\`

---

### **Paso 2: Agregar Nodo "Count Consultas"** 📊

**Ubicación**: Después de `Get User`

\`\`\`
Type: Supabase → Execute a SQL Query
Credentials: Tu conexión de Supabase

Query (copiar exactamente):
SELECT COUNT(*) as total
FROM consultas
WHERE user_id = '{{ $('Get User').first().json.id }}'
  AND mes_periodo = TO_CHAR(NOW(), 'YYYY-MM');
\`\`\`

**Output esperado**:
\`\`\`json
{
  "total": 3
}
\`\`\`

---

### **Paso 3: Agregar Nodo "Calcular Límite"** 🧮

**Ubicación**: Después de `Count Consultas`

\`\`\`
Type: Code → Run Once for All Items

JavaScript:
// Obtener plan del usuario y consultas usadas
const user = $('Get User').first().json;
const consultasUsadas = $('Count Consultas').first().json.total;

// Definir límites por plan
const limites = {
  free: 5,
  plus: 50,
  premium: 100
};

const limite = limites[user.plan] || 5;
const puedeConsultar = consultasUsadas < limite;

// Retornar resultado
return [{
  json: {
    user_id: user.id,
    plan: user.plan,
    consultas_usadas: consultasUsadas,
    limite: limite,
    consultas_restantes: limite - consultasUsadas,
    puede_consultar: puedeConsultar
  }
}];
\`\`\`

**Output esperado**:
\`\`\`json
{
  "user_id": "uuid",
  "plan": "free",
  "consultas_usadas": 3,
  "limite": 5,
  "consultas_restantes": 2,
  "puede_consultar": true
}
\`\`\`

---

### **Paso 4: Agregar Nodo "¿Puede Consultar?"** 🤔

**Ubicación**: Después de `Calcular Límite`

\`\`\`
Type: IF

Conditions:
  Mode: Simple
  
  Condition 1:
    Field: {{ $json.puede_consultar }}
    Operation: Equal
    Value: true
\`\`\`

**Ramas**:
- **TRUE** → Continuar al AI Agent
- **FALSE** → Ir a "Enviar Límite Alcanzado"

---

### **Paso 5: Modificar Nodo "Enviar Límite Alcanzado"** 📵

**Ya existe en tu workflow**, solo actualizar el mensaje:

\`\`\`
Type: Twilio → Send an SMS/MMS/WhatsApp message

From: whatsapp:+12692562013
To: {{ $('data_extraction').item.json.from }}

Message:
🚫 *Límite Alcanzado*

Has alcanzado tu límite de consultas del mes.

📊 *Tu plan:* {{ $('Calcular Límite').item.json.plan.toUpperCase() }}
📈 *Consultas:* {{ $('Calcular Límite').item.json.consultas_usadas }}/{{ $('Calcular Límite').item.json.limite }}

💎 *Actualiza a Plan Plus*
✅ 50 consultas al mes
✅ Análisis más profundos
✅ Soporte prioritario

👉 Mejora aquí: {{$env.NEXT_PUBLIC_BASE_URL}}/checkout
\`\`\`

---

### **Paso 6: Agregar Nodo "Insert Consulta"** 💾

**Ubicación**: **Después del AI Agent**, antes de enviar la respuesta final

\`\`\`
Type: Supabase → Insert a Row
Credentials: Tu conexión de Supabase
Table: consultas

Columns:
  user_id: {{ $('Get User').first().json.id }}
  mensaje: {{ $('data_extraction').item.json.body }}
  respuesta: {{ $('AI Agent1').item.json.output }}
  tipo: analisis_estafa
  riesgo_detectado: false
  nivel_riesgo: bajo
  mes_periodo: {{ new Date().toISOString().slice(0, 7) }}
\`\`\`

**Tips**:
- Si el AI Agent puede detectar riesgos, puedes usar expresiones como:
  \`\`\`javascript
  {{ $('AI Agent1').item.json.output.toLowerCase().includes('riesgo alto') ? true : false }}
  \`\`\`

---

## 🔄 Flujo Completo Actualizado

\`\`\`
Twilio Trigger
    ↓
Code in JavaScript
    ↓
data_extraction
    ↓
🆕 Get User (Supabase)
    ↓
🆕 Count Consultas (Supabase SQL)
    ↓
🆕 Calcular Límite (Code)
    ↓
🆕 ¿Puede Consultar? (IF)
    ├─ NO → Enviar Límite Alcanzado → FIN
    └─ SÍ → (continúa con flujo actual)
             Plan Switch
             Text Classifier
             AI Agent
             🆕 Insert Consulta (Supabase)
             Send WhatsApp Respuesta
             FIN
\`\`\`

---

## 📝 Checklist de Implementación

### Preparación (5 min)
- [ ] La tabla `consultas` ya existe en Supabase (creada con migración 004)
- [ ] Credenciales de Supabase configuradas en n8n
- [ ] Workflow actual funcionando

### Agregar Nodos (15 min)
- [ ] 1. Nodo "Get User" agregado
- [ ] 2. Nodo "Count Consultas" agregado
- [ ] 3. Nodo "Calcular Límite" agregado
- [ ] 4. Nodo "¿Puede Consultar?" agregado
- [ ] 5. Nodo "Enviar Límite Alcanzado" actualizado
- [ ] 6. Nodo "Insert Consulta" agregado

### Conexiones (5 min)
- [ ] `data_extraction` → `Get User`
- [ ] `Get User` → `Count Consultas`
- [ ] `Count Consultas` → `Calcular Límite`
- [ ] `Calcular Límite` → `¿Puede Consultar?`
- [ ] `¿Puede Consultar?` (FALSE) → `Enviar Límite Alcanzado`
- [ ] `¿Puede Consultar?` (TRUE) → `Plan Switch` (flujo actual)
- [ ] `AI Agent1` → `Insert Consulta`
- [ ] `Insert Consulta` → `Send WhatsApp Respuesta`

---

## 🧪 Prueba del Sistema

### Test 1: Usuario con consultas disponibles ✅

1. **Envía** un mensaje al bot: `"Hola, necesito ayuda"`
2. **Verifica** en logs de n8n:
   - ✅ "Get User" encuentra al usuario
   - ✅ "Count Consultas" devuelve número correcto
   - ✅ "Calcular Límite" muestra `puede_consultar: true`
   - ✅ AI Agent responde
   - ✅ "Insert Consulta" guarda en BD
   - ✅ Recibes respuesta en WhatsApp
3. **Verifica** en Supabase:
   - Tabla `consultas` tiene un nuevo registro
   - Campo `mes_periodo` es correcto (ej: `2025-10`)

### Test 2: Usuario sin consultas disponibles ❌

1. **Ejecuta** en Supabase (para simular límite):
   \`\`\`sql
   -- Insertar 5 consultas del mes actual para un usuario FREE
   INSERT INTO consultas (user_id, mensaje, mes_periodo)
   SELECT 
     'tu-user-id-aqui',
     'Consulta de prueba ' || i,
     TO_CHAR(NOW(), 'YYYY-MM')
   FROM generate_series(1, 5) i;
   \`\`\`
2. **Envía** mensaje al bot
3. **Verifica**:
   - ✅ Recibes mensaje "🚫 Límite Alcanzado"
   - ✅ NO se ejecuta el AI Agent
   - ✅ NO se inserta nueva consulta

---

## 📊 Ventajas de Esta Solución MVP

| Ventaja | Descripción |
|---------|-------------|
| ✅ **Simplicidad** | Solo nodos de n8n, sin APIs |
| ✅ **Velocidad** | Menos latencia (acceso directo a BD) |
| ✅ **Menos código** | Sin archivos TypeScript adicionales |
| ✅ **Fácil debug** | Todo en un solo lugar (n8n) |
| ✅ **Menos mantenimiento** | Menos archivos = menos problemas |
| ✅ **Ideal para MVP** | Validar idea rápido |

---

## 🔧 Configuración de Credenciales Supabase en n8n

Si aún no tienes configuradas las credenciales de Supabase en n8n:

1. **En n8n**: Settings → Credentials → New
2. **Tipo**: Supabase API
3. **Nombre**: "Zecu Supabase"
4. **Host**: Tu `SUPABASE_URL` (sin https://)
5. **Service Role Key**: Tu `SUPABASE_SERVICE_ROLE_KEY`
6. **Save**

---

## 📈 Límites por Plan

| Plan | Consultas/Mes | Código |
|------|---------------|--------|
| **Free** | 5 | `free` |
| **Plus** | 50 | `plus` |
| **Premium** | 100 | `premium` |

Estos límites están en el nodo "Calcular Límite". Modifícalos ahí si necesitas cambiarlos.

---

## 🚨 Solución de Problemas

### ❌ Error: "user_id not found"
**Causa**: El nodo "Get User" no encontró al usuario
**Solución**: Verifica que el `phone` en la BD tenga el formato correcto (+549...)

### ❌ Error: "relation consultas does not exist"
**Causa**: La tabla `consultas` no existe
**Solución**: Ejecuta la migración 004:
\`\`\`bash
cd zecu
# Aplicar en Supabase desde el dashboard
\`\`\`

### ❌ Error en "Count Consultas"
**Causa**: Sintaxis SQL incorrecta
**Solución**: Copia el SQL exactamente como está en el Paso 2

### ⚠️ El contador no actualiza
**Causa**: El nodo "Insert Consulta" está mal conectado
**Solución**: Debe estar DESPUÉS del AI Agent, ANTES del envío final

---

## 🎯 Próximos Pasos

Después de implementar esto:

1. ✅ **Prueba** con usuario FREE (5 consultas)
2. ✅ **Simula** límite alcanzado
3. ✅ **Verifica** en Supabase que se guardan las consultas
4. 🚀 **Escala** a producción
5. 📊 **Monitorea** uso real de usuarios

Cuando tengas usuarios reales y necesites más control, puedes migrar a la solución con APIs.

---

## 📚 Archivos Relacionados

- **Migración**: `zecu/supabase/migrations/004_create_consultas_table.sql`
- **Documentación completa**: `zecu/docs/SISTEMA_CONTABILIZACION.md`

---

**¡Listo para implementar! 🚀**

¿Alguna duda sobre cómo configurar algún nodo?
