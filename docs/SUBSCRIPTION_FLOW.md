# 💳 Flujo de Suscripciones - Zecubot

## 🎯 Resumen del Sistema

Zecubot ahora maneja **2 planes principales** con un sistema automatizado de detección y routing:

- **🆓 Plan Free**: Funcionalidades básicas con limitaciones
- **⭐ Plan Plus**: Funcionalidades avanzadas con IA

## 🏗️ Arquitectura del Sistema

```
Usuario → N8N Webhook → Supabase Query → Switch Logic → Response
    ↓
[Free Plan] [Plus Plan] [No Data → Register]
```

## 📋 Planes Disponibles

### **🆓 Plan Free**
- **Precio**: $0 USD
- **Duración**: 7 días de prueba
- **Límites**:
  - 10 mensajes por día
  - 3 conversaciones simultáneas
  - Respuestas básicas
- **Características**:
  - Soporte comunitario
  - Acceso a tutoriales
  - Detección básica de phishing

### **⭐ Plan Plus**
- **Precio**: $19.99 USD/mes
- **Duración**: 30 días
- **Límites**:
  - 500 mensajes por día
  - 50 conversaciones simultáneas
  - Respuestas avanzadas con IA
- **Características**:
  - Soporte prioritario 24/7
  - Análisis de enlaces
  - Historial de conversaciones
  - Integraciones básicas
  - Análisis de uso

## 🔄 Flujo de Usuario

### **1. Usuario Nuevo (Sin Registro)**
```
Usuario envía mensaje → N8N detecta "no data" → Mensaje de registro
```

**Respuesta**:
```
¡Hola! Bienvenido a Zecubot 🤖

Parece que no tienes una cuenta registrada. Para comenzar:

1️⃣ Regístrate en: https://zecubot.com/register
2️⃣ O envía tu email a: registro@zecubot.com
3️⃣ Te activaremos el Plan Gratuito automáticamente

¿Necesitas ayuda? Responde con /ayuda
```

### **2. Usuario Free**
```
Usuario envía mensaje → N8N detecta plan "free" → Respuesta Free
```

**Respuesta**:
```
¡Hola! Tienes el Plan Gratuito de Zecubot 🆓

✅ Características incluidas:
• 10 mensajes por día
• 3 conversaciones simultáneas
• Respuestas básicas
• Soporte comunitario

💡 Para más funcionalidades, considera actualizar a Plan Plus: /upgrade
```

### **3. Usuario Plus**
```
Usuario envía mensaje → N8N detecta plan "plus" → Respuesta Plus
```

**Respuesta**:
```
¡Hola! Tienes el Plan Plus de Zecubot ⭐

🚀 Características incluidas:
• 500 mensajes por día
• 50 conversaciones simultáneas
• Respuestas avanzadas con IA
• Soporte prioritario 24/7
• Análisis de enlaces
• Historial de conversaciones

¡Disfruta de todas las funcionalidades premium!
```

## 🔧 Implementación Técnica

### **Base de Datos (Supabase)**
```sql
-- Tabla users con planes actualizados
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  plan_type VARCHAR(50) DEFAULT 'free' CHECK (plan_type IN ('free', 'plus')),
  -- ... otros campos
);
```

### **API Endpoints**

#### **Registro de Usuario**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "name": "Nombre Usuario",
  "whatsappNumber": "+1234567890"
}
```

#### **Login de Usuario**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

### **N8N Workflow**
- **Webhook Trigger**: Recibe mensajes de usuarios
- **HTTP Request**: Consulta usuario en Supabase
- **Switch Node**: Evalúa plan del usuario
- **Response Nodes**: Envía respuesta según plan

## 🧪 Testing y Validación

### **Scripts de Testing**
```bash
# Actualizar esquema de planes
npm run update-plans

# Probar flujo completo
npm run test-plans

# Verificar conexión Supabase
npm run verify-supabase
```

### **Casos de Prueba**
1. **Usuario no registrado** → Mensaje de registro
2. **Usuario Free** → Respuesta con limitaciones
3. **Usuario Plus** → Respuesta con funcionalidades completas
4. **Error de conexión** → Manejo de errores

## 🚀 Despliegue a Producción

### **1. Configuración de Variables**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima

# N8N
N8N_WEBHOOK_URL=tu_webhook_n8n

# MercadoPago (para futuras integraciones)
MERCADOPAGO_ACCESS_TOKEN=tu_token_mercadopago
```

### **2. Configuración de N8N**
1. Importar flujo desde `docs/N8N_PLANS_WORKFLOW.md`
2. Configurar webhook URL
3. Configurar variables de entorno
4. Activar workflow

### **3. Verificación Post-Despliegue**
1. Probar registro de usuarios
2. Probar login de usuarios
3. Probar flujo de N8N
4. Monitorear logs y métricas

## 📊 Monitoreo y Métricas

### **Métricas Clave**
- **Usuarios registrados** por día
- **Conversiones** de Free a Plus
- **Tiempo de respuesta** de N8N
- **Errores** en consultas a BD

### **Logs Importantes**
- Registros de usuario exitosos/fallidos
- Consultas a Supabase
- Respuestas de N8N
- Errores de webhook

## 🔮 Próximos Pasos

### **Corto Plazo**
1. ✅ Implementar planes Free y Plus
2. ✅ Crear flujo de N8N
3. ✅ Sistema de login/registro
4. ✅ Testing completo

### **Mediano Plazo**
1. 🔄 Integración con MercadoPago
2. 🔄 Panel de administración
3. 🔄 Analytics avanzados
4. 🔄 Notificaciones automáticas

### **Largo Plazo**
1. 🔮 Plan Premium (TBD)
2. 🔮 Plan Enterprise
3. 🔮 API pública
4. 🔮 Integraciones avanzadas

## ❓ Preguntas Frecuentes

### **¿Es necesario el login?**
**Sí**, para un sistema de suscripciones necesitas:
- Identificar usuarios únicos
- Gestionar suscripciones por usuario
- Personalizar experiencia según plan
- Mantener historial de conversaciones

### **¿Cómo probar antes de producción?**
1. **Entorno de desarrollo** con BD de prueba
2. **Scripts de testing** automatizados
3. **Sandbox de MercadoPago** para pagos
4. **N8N en modo desarrollo**

### **¿Qué pasa si falla la conexión a Supabase?**
- N8N maneja el error graciosamente
- Se envía mensaje de error al usuario
- Se registra el error en logs
- Se puede configurar retry automático

---

**📞 Soporte**: Para dudas técnicas, contacta al equipo de desarrollo.
