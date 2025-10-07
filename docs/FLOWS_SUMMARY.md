# Resumen Ejecutivo - Flujos de Usuario Zecu

## 🎯 **Flujos Principales Identificados**

### **1. FLUJO DE REGISTRO - PLAN GRATUITO**
```
Usuario → Modal Onboarding → Ingresa WhatsApp → API Zecu → n8n → Supabase → WhatsApp Bot → Activación
```

**Componentes involucrados:**
- Frontend: Modal de onboarding
- API: `/api/subscriptions/free-plan`
- n8n: Workflow de suscripción
- Supabase: Almacenamiento
- WhatsApp: Bot de activación

**Estados:** PENDING → ACTIVE

---

### **2. FLUJO DE PAGO - PLANES PAGOS**
```
Usuario → Botón Pago → Mercado Pago → Webhook → API Zecu → n8n → Supabase → Email
```

**Componentes involucrados:**
- Frontend: Botones de pago
- Mercado Pago: Procesamiento
- API: `/api/webhooks/mercadopago`
- n8n: Workflow de pago
- Supabase: Actualización
- Email: Confirmación

**Estados:** PENDING → ACTIVE (inmediato)

---

### **3. FLUJO DE GESTIÓN - DASHBOARD**
```
Usuario → Dashboard → Acción → API Zecu → n8n → Supabase → Notificación
```

**Acciones disponibles:**
- **Upgrade:** Cambio a plan superior
- **Downgrade:** Cambio a plan inferior  
- **Cancelación:** Terminar suscripción
- **Renovación:** Extender suscripción

---

### **4. FLUJO DE EXPIRACIÓN**
```
Cron Job → API Zecu → n8n → Supabase → Email → Usuario
```

**Componentes involucrados:**
- Cron Job: Verificación automática
- API: Procesamiento de expiraciones
- n8n: Workflow de notificación
- Email: Recordatorio de renovación

---

## 🔄 **Estados de Suscripción**

| Estado | Descripción | Transiciones Posibles |
|--------|-------------|----------------------|
| **PENDING** | Creada, esperando activación | → ACTIVE, → CANCELLED |
| **ACTIVE** | Activa, en uso | → EXPIRED, → CANCELLED, → UPGRADED, → DOWNGRADED |
| **EXPIRED** | Expirada, sin acceso | → ACTIVE (renovación), → CANCELLED |
| **CANCELLED** | Cancelada, finalizada | → [END] |
| **UPGRADED** | Actualizada a plan superior | → ACTIVE |
| **DOWNGRADED** | Reducida a plan inferior | → ACTIVE |

---

## 🏗️ **Arquitectura de Integración**

### **Frontend → Backend**
- Landing Page → API Routes
- Dashboard → API Routes  
- Admin Panel → API Routes

### **Backend → n8n**
- Eventos de suscripción
- Webhooks de pago
- Comandos de WhatsApp

### **n8n → Servicios Externos**
- Supabase (base de datos)
- WhatsApp (notificaciones)
- Email (confirmaciones)
- SMS (opcional)

---

## 📊 **Eventos del Sistema**

### **Eventos de Suscripción**
```json
{
  "subscription_created": "Nueva suscripción creada",
  "subscription_activated": "Suscripción activada por WhatsApp",
  "subscription_expired": "Suscripción expirada",
  "subscription_cancelled": "Suscripción cancelada",
  "subscription_upgraded": "Plan actualizado a superior",
  "subscription_downgraded": "Plan reducido a inferior"
}
```

### **Eventos de Pago**
```json
{
  "payment_approved": "Pago aprobado por Mercado Pago",
  "payment_rejected": "Pago rechazado",
  "payment_pending": "Pago pendiente de confirmación",
  "payment_cancelled": "Pago cancelado"
}
```

### **Eventos de Uso**
```json
{
  "analysis_created": "Análisis de mensaje realizado",
  "limit_reached": "Límite de uso alcanzado",
  "feature_used": "Feature específica utilizada"
}
```

---

## 🎯 **Puntos de Integración con n8n**

### **1. Webhook de Suscripciones** (`/zecu-subscription`)
- **Recibe:** Eventos de suscripción
- **Procesa:** Cambios de estado
- **Actualiza:** Supabase
- **Envía:** Notificaciones WhatsApp/Email

### **2. Webhook de Pagos** (`/zecu-mercadopago`)
- **Recibe:** Webhooks de Mercado Pago
- **Procesa:** Estados de pago
- **Actualiza:** Suscripciones en Supabase
- **Envía:** Confirmaciones

### **3. Webhook de WhatsApp** (`/zecu-whatsapp`)
- **Recibe:** Mensajes del bot
- **Procesa:** Comandos de usuario
- **Actualiza:** Estados en Supabase
- **Envía:** Respuestas automáticas

---

## 🚨 **Manejo de Errores**

### **Estrategias por Componente**

| Componente | Estrategia de Error |
|------------|-------------------|
| **Frontend** | Validación en tiempo real, mensajes claros |
| **API Zecu** | Validación de entrada, respuestas HTTP apropiadas |
| **n8n** | Reintentos automáticos, logging detallado |
| **Supabase** | Transacciones, rollback automático |
| **WhatsApp** | Fallback a email, reintentos |
| **Email** | Cola de reintentos, notificaciones de fallo |

### **Flujo de Recuperación**
```
Error Detectado → Logging → Notificación → Reintento → Fallback → Resolución
```

---

## 📈 **Métricas Clave**

### **Conversión**
- Registros → Activaciones (Plan Gratuito)
- Activaciones → Pagos (Conversión a planes pagos)
- Retención por plan
- Churn rate

### **Uso**
- Análisis por usuario
- Features más utilizadas
- Tiempo de respuesta del sistema
- Satisfacción del usuario

### **Técnicas**
- Tiempo de respuesta de APIs
- Disponibilidad de servicios
- Errores por endpoint
- Performance de n8n

---

## 🔧 **Configuración Requerida**

### **Variables de Entorno**
```env
# Zecu API
NEXT_PUBLIC_BASE_URL=https://zecu.vercel.app
NODE_ENV=production

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_PUBLIC_KEY=tu_public_key

# n8n Integration
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/zecu
N8N_API_KEY=tu_api_key

# Supabase (si se usa directamente)
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_key
```

### **Webhooks a Configurar**
- **Mercado Pago:** `https://zecu.vercel.app/api/webhooks/mercadopago`
- **n8n Suscripciones:** `https://tu-n8n.com/webhook/zecu-subscription`
- **n8n Pagos:** `https://tu-n8n.com/webhook/zecu-mercadopago`
- **n8n WhatsApp:** `https://tu-n8n.com/webhook/zecu-whatsapp`

---

## 🎯 **Próximos Pasos de Implementación**

### **Fase 1: Configuración Base**
1. ✅ Definir estructura de planes
2. ✅ Crear componentes de onboarding
3. ✅ Implementar API de suscripciones
4. ✅ Configurar integración con n8n

### **Fase 2: Integración Completa**
1. 🔄 Configurar workflows en n8n
2. 🔄 Configurar Supabase
3. 🔄 Implementar bot de WhatsApp
4. 🔄 Configurar sistema de emails

### **Fase 3: Testing y Optimización**
1. ⏳ Testing end-to-end
2. ⏳ Optimización de performance
3. ⏳ Monitoreo y alertas
4. ⏳ Documentación de usuario

### **Fase 4: Features Avanzadas**
1. ⏳ Dashboard de administración
2. ⏳ Analytics avanzados
3. ⏳ Feature flags
4. ⏳ A/B testing

---

**Nota**: Este resumen proporciona una visión completa de todos los flujos del sistema Zecu, facilitando la implementación y el mantenimiento del sistema.



