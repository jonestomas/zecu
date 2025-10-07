# Workflow de n8n para Plan Gratuito - Zecu

## 🎯 Objetivo

Este documento describe cómo configurar el workflow en n8n para manejar el registro y activación del plan gratuito de Zecu.

## 📋 Flujo Completo

### 1. **Usuario hace clic en "Prueba Gratuita"**
- Se abre el modal de onboarding
- Usuario ingresa su número de WhatsApp
- Se valida el número y se formatea

### 2. **Se envía solicitud a Zecu API**
```
POST /api/subscriptions/free-plan
{
  "whatsappNumber": "+5491112345678",
  "email": "usuario@ejemplo.com",
  "source": "website",
  "metadata": {
    "utmSource": "landing_page",
    "utmMedium": "free_trial_button"
  }
}
```

### 3. **Zecu crea suscripción y envía evento a n8n**
```json
{
  "event": "subscription_event",
  "data": {
    "event": "subscription_created",
    "userId": "sub_1234567890_abc123",
    "whatsappNumber": "+5491112345678",
    "planId": "free",
    "planType": "free",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "metadata": {
      "source": "website",
      "utmSource": "landing_page"
    }
  },
  "source": "zecu-subscription-service",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4. **Usuario es redirigido a WhatsApp**
- Se abre WhatsApp con mensaje predefinido
- Usuario envía mensaje al bot de Zecu
- Bot procesa el mensaje y activa la suscripción

## 🔧 Configuración en n8n

### Workflow 1: Procesar Registro de Plan Gratuito

```
Webhook → Switch (por evento) → Procesar Suscripción → Actualizar Supabase → Enviar WhatsApp
```

#### Nodos Necesarios:

1. **Webhook Node**
   - **Path**: `/zecu-subscription`
   - **Method**: POST
   - **Authentication**: Bearer Token (opcional)

2. **Switch Node** (por tipo de evento)
   - **Rules**:
     - `$json.data.event === "subscription_created"`
     - `$json.data.event === "subscription_activated"`
     - `$json.data.event === "subscription_expired"`

3. **Supabase Node** (para subscription_created)
   - **Operation**: Insert
   - **Table**: `subscriptions`
   - **Data**:
     ```json
     {
       "id": "{{ $json.data.userId }}",
       "whatsapp_number": "{{ $json.data.whatsappNumber }}",
       "plan_id": "{{ $json.data.planId }}",
       "plan_type": "{{ $json.data.planType }}",
       "status": "pending",
       "start_date": "{{ $json.data.timestamp }}",
       "end_date": "{{ $now.plus({days: 7}) }}",
       "created_at": "{{ $now }}",
       "updated_at": "{{ $now }}",
       "metadata": "{{ $json.data.metadata }}"
     }
     ```

4. **WhatsApp Node** (enviar mensaje de bienvenida)
   - **To**: `{{ $json.data.whatsappNumber }}`
   - **Message**: 
     ```
     🎉 ¡Bienvenido a Zecu!
     
     Tu plan gratuito de 7 días está listo para activarse.
     
     Para activarlo, simplemente responde a este mensaje con:
     ✅ ACTIVAR
     
     O envía cualquier mensaje y te ayudaré a detectar si es una estafa.
     
     ¡Protege tu WhatsApp con Zecu! 🛡️
     ```

### Workflow 2: Procesar Activación por WhatsApp

```
Webhook WhatsApp → Verificar Usuario → Activar Suscripción → Confirmar Activación
```

#### Nodos Necesarios:

1. **Webhook Node** (desde WhatsApp)
   - **Path**: `/zecu-whatsapp`
   - **Method**: POST

2. **Supabase Node** (buscar suscripción)
   - **Operation**: Select
   - **Table**: `subscriptions`
   - **Filter**: `whatsapp_number = {{ $json.from }}`

3. **Switch Node** (verificar estado)
   - **Rules**:
     - `{{ $json.subscription.status === "pending" }}`
     - `{{ $json.subscription.status === "active" }}`
     - `{{ $json.subscription.status === "expired" }}`

4. **Supabase Node** (activar suscripción)
   - **Operation**: Update
   - **Table**: `subscriptions`
   - **Filter**: `id = {{ $json.subscription.id }}`
   - **Data**:
     ```json
     {
       "status": "active",
       "activated_at": "{{ $now }}",
       "updated_at": "{{ $now }}"
     }
     ```

5. **WhatsApp Node** (confirmar activación)
   - **To**: `{{ $json.from }}`
   - **Message**:
     ```
     ✅ ¡Plan gratuito activado!
     
     🎉 Tu suscripción de 7 días está ahora activa.
     
     Características incluidas:
     • 5 análisis de mensajes
     • Detección básica de phishing
     • Soporte por WhatsApp
     • Acceso a tutoriales
     
     ¡Comienza a enviarme mensajes para analizarlos! 🛡️
     ```

## 📊 Estructura de Base de Datos en Supabase

### Tabla: `subscriptions`
```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  whatsapp_number TEXT NOT NULL UNIQUE,
  email TEXT,
  plan_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  activated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Índices
CREATE INDEX idx_subscriptions_whatsapp ON subscriptions(whatsapp_number);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
```

### Tabla: `user_analyses` (para tracking de uso)
```sql
CREATE TABLE user_analyses (
  id TEXT PRIMARY KEY,
  subscription_id TEXT REFERENCES subscriptions(id),
  whatsapp_number TEXT NOT NULL,
  message_text TEXT,
  analysis_result JSONB,
  is_phishing BOOLEAN,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_analyses_subscription ON user_analyses(subscription_id);
CREATE INDEX idx_user_analyses_whatsapp ON user_analyses(whatsapp_number);
CREATE INDEX idx_user_analyses_created_at ON user_analyses(created_at);
```

## 🔄 Eventos de Suscripción

### Eventos Enviados a n8n:

1. **`subscription_created`** - Nueva suscripción creada
2. **`subscription_activated`** - Suscripción activada por WhatsApp
3. **`subscription_expired`** - Suscripción expirada
4. **`subscription_cancelled`** - Suscripción cancelada
5. **`subscription_upgraded`** - Suscripción actualizada a plan superior
6. **`subscription_downgraded`** - Suscripción reducida a plan inferior

### Estructura de Evento:
```json
{
  "event": "subscription_event",
  "data": {
    "event": "subscription_created|subscription_activated|...",
    "userId": "sub_1234567890_abc123",
    "whatsappNumber": "+5491112345678",
    "planId": "free|basic|premium",
    "planType": "free|basic|premium",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "metadata": {
      "source": "website|whatsapp|admin",
      "utmSource": "landing_page",
      "utmMedium": "free_trial_button"
    }
  },
  "source": "zecu-subscription-service",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🚨 Manejo de Errores

### Casos de Error Comunes:

1. **Número de WhatsApp ya registrado**
   - Respuesta: "Ya tienes una suscripción activa"
   - Acción: No crear nueva suscripción

2. **Número de WhatsApp inválido**
   - Respuesta: "Número de WhatsApp inválido"
   - Acción: Solicitar número válido

3. **Suscripción expirada**
   - Respuesta: "Tu plan gratuito ha expirado"
   - Acción: Ofrecer planes de pago

4. **Error en Supabase**
   - Log del error
   - Reintento automático
   - Notificación al administrador

## 📈 Métricas y Analytics

### Métricas a Trackear:

1. **Conversión de Plan Gratuito**
   - Registros vs Activaciones
   - Tiempo de activación promedio
   - Fuentes de tráfico más efectivas

2. **Uso del Plan Gratuito**
   - Análisis realizados por usuario
   - Tasa de detección de phishing
   - Satisfacción del usuario

3. **Conversión a Planes Pagos**
   - Usuarios que se actualizan
   - Tiempo hasta la actualización
   - Planes más populares

## 🔧 Testing

### Probar el Workflow:

1. **Crear suscripción de prueba:**
   ```bash
   curl -X POST http://localhost:3000/api/subscriptions/free-plan \
     -H "Content-Type: application/json" \
     -d '{
       "whatsappNumber": "+5491112345678",
       "email": "test@ejemplo.com",
       "source": "website"
     }'
   ```

2. **Verificar en Supabase:**
   - Revisar tabla `subscriptions`
   - Verificar que el estado sea `pending`

3. **Simular activación por WhatsApp:**
   - Enviar mensaje al bot
   - Verificar que el estado cambie a `active`

## 📞 Soporte

Para problemas con el workflow:
1. Revisar logs en n8n
2. Verificar configuración de Supabase
3. Probar endpoints de Zecu
4. Contactar al equipo de desarrollo

---

**Nota**: Este workflow está diseñado para ser robusto y manejar errores gracefully. Si algún paso falla, el sistema continúa funcionando y notifica los errores.



