# Configuración de Supabase para Zecu

## 🎯 **Resumen**

Esta documentación te guía paso a paso para configurar la base de datos de Supabase para el sistema Zecu, incluyendo todas las tablas, funciones, triggers y políticas de seguridad necesarias.

## 📋 **Prerequisitos**

- Cuenta de Supabase activa
- Proyecto de Supabase creado
- Acceso de administrador al proyecto
- Conocimientos básicos de SQL y PostgreSQL

## 🚀 **Configuración Rápida**

### **Opción 1: Script Automático (Recomendado)**

1. **Conecta a tu proyecto de Supabase**
2. **Ve a SQL Editor**
3. **Ejecuta el script principal:**
   ```sql
   \i 00_setup_database.sql
   ```

### **Opción 2: Scripts Individuales**

Si prefieres ejecutar los scripts uno por uno:

```sql
-- 1. Crear tablas
\i 01_create_tables.sql

-- 2. Crear índices
\i 02_create_indexes.sql

-- 3. Crear funciones
\i 03_create_functions.sql

-- 4. Crear triggers
\i 04_create_triggers.sql

-- 5. Configurar RLS
\i 05_create_rls.sql

-- 6. Insertar datos iniciales
\i 06_seed_data.sql
```

## 🏗️ **Estructura de la Base de Datos**

### **Tablas Principales**

| Tabla | Descripción | Relaciones |
|-------|-------------|------------|
| `users` | Información de usuarios | - |
| `subscriptions` | Suscripciones de usuarios | → users |
| `message_analyses` | Análisis de mensajes | → users, subscriptions |
| `feature_usage` | Uso de features | → users, subscriptions |
| `system_logs` | Logs del sistema | → users, subscriptions |
| `system_config` | Configuración del sistema | - |
| `notifications` | Notificaciones | → users |
| `user_sessions` | Sesiones de usuario | → users |
| `audit_log` | Log de auditoría | - |

### **Características Principales**

- ✅ **Identificación por WhatsApp** - Sin contraseñas
- ✅ **Suscripciones flexibles** - Free, Basic, Premium
- ✅ **Límites de uso** - Control por plan
- ✅ **Auditoría completa** - Log de todos los cambios
- ✅ **Seguridad RLS** - Datos protegidos por usuario
- ✅ **Triggers automáticos** - Actualizaciones automáticas
- ✅ **Funciones útiles** - Operaciones complejas simplificadas

## 🔧 **Configuración Post-Instalación**

### **1. Variables de Entorno**

Configura estas variables en tu aplicación:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# n8n Integration
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/zecu
N8N_API_KEY=tu_api_key

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_PUBLIC_KEY=tu_public_key
```

### **2. Configuración del Administrador**

Actualiza la información del administrador:

```sql
UPDATE users 
SET 
    whatsapp_number = '+5491112345678', -- Tu número
    email = 'tu-email@ejemplo.com',     -- Tu email
    first_name = 'Tu Nombre',
    last_name = 'Tu Apellido'
WHERE metadata->>'role' = 'admin';
```

### **3. Configuración de Integraciones**

Habilita/deshabilita integraciones según necesites:

```sql
-- Habilitar Mercado Pago
UPDATE system_config 
SET config_value = 'true' 
WHERE config_key = 'integrations.mercadopago.enabled';

-- Habilitar WhatsApp
UPDATE system_config 
SET config_value = 'true' 
WHERE config_key = 'integrations.whatsapp.enabled';

-- Habilitar n8n
UPDATE system_config 
SET config_value = 'true' 
WHERE config_key = 'integrations.n8n.enabled';
```

## 📊 **Funciones Principales**

### **Crear Usuario con Suscripción**
```sql
SELECT * FROM create_user_with_subscription(
    '+5491112345678',  -- WhatsApp
    'usuario@ejemplo.com',  -- Email
    'Juan',  -- Nombre
    'Pérez',  -- Apellido
    'free',  -- Plan
    'website'  -- Fuente
);
```

### **Activar Suscripción**
```sql
SELECT * FROM activate_subscription('subscription_id_here');
```

### **Verificar Límites de Uso**
```sql
SELECT * FROM check_usage_limits('user_id_here', 'message_analysis');
```

### **Registrar Uso de Feature**
```sql
SELECT * FROM record_feature_usage('user_id_here', 'message_analysis');
```

### **Obtener Estadísticas de Usuario**
```sql
SELECT * FROM get_user_stats('user_id_here');
```

### **Obtener Métricas del Sistema**
```sql
SELECT * FROM get_system_metrics(30); -- Últimos 30 días
```

## 🔒 **Seguridad (RLS)**

### **Políticas Implementadas**

- **Usuarios**: Solo pueden ver/modificar sus propios datos
- **Suscripciones**: Solo pueden ver sus propias suscripciones
- **Análisis**: Solo pueden ver sus propios análisis
- **Administradores**: Acceso completo a todos los datos
- **Sistema**: Puede insertar logs y notificaciones

### **Funciones de Seguridad**

```sql
-- Verificar si es administrador
SELECT is_admin();

-- Obtener ID del usuario actual
SELECT current_user_id();

-- Verificar acceso a recurso
SELECT can_access_resource('user_id_here');
```

## 📈 **Vistas Útiles**

### **Estadísticas de Usuarios**
```sql
SELECT * FROM user_stats_view;
```

### **Métricas del Sistema**
```sql
SELECT * FROM system_metrics_view;
```

### **Suscripciones que Expiran**
```sql
SELECT * FROM expiring_subscriptions_view;
```

## 🔄 **Tareas Programadas**

### **Limpieza Automática**
```sql
-- Ejecutar limpieza manual
SELECT * FROM cleanup_expired_data();

-- Programar limpieza diaria (usar pg_cron si está disponible)
SELECT cron.schedule('daily-cleanup', '0 2 * * *', 'SELECT cleanup_expired_data();');
```

## 🧪 **Testing**

### **Verificar Configuración**
```sql
-- Verificar que todas las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar que todas las funciones existen
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### **Datos de Prueba**
```sql
-- Crear usuario de prueba
SELECT * FROM create_user_with_subscription(
    '+5491198765432',
    'test@ejemplo.com',
    'Test',
    'User',
    'free',
    'website'
);

-- Activar suscripción
SELECT * FROM activate_subscription(
    (SELECT id FROM subscriptions WHERE user_id = (
        SELECT id FROM users WHERE whatsapp_number = '+5491198765432'
    ))
);
```

## 🚨 **Solución de Problemas**

### **Errores Comunes**

1. **"Extensión uuid-ossp no encontrada"**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **"Política RLS no encontrada"**
   - Verificar que RLS esté habilitado en la tabla
   - Verificar que las políticas estén creadas

3. **"Función no encontrada"**
   - Verificar que el script de funciones se ejecutó correctamente
   - Verificar permisos de ejecución

4. **"Usuario no autorizado"**
   - Verificar que el usuario esté autenticado
   - Verificar políticas RLS

### **Logs de Debugging**

```sql
-- Ver logs del sistema
SELECT * FROM system_logs 
ORDER BY created_at DESC 
LIMIT 100;

-- Ver logs de auditoría
SELECT * FROM audit_log 
ORDER BY created_at DESC 
LIMIT 100;
```

## 📚 **Documentación Adicional**

### **Scripts Incluidos**

- `00_setup_database.sql` - Script principal
- `01_create_tables.sql` - Creación de tablas
- `02_create_indexes.sql` - Índices de optimización
- `03_create_functions.sql` - Funciones de base de datos
- `04_create_triggers.sql` - Triggers automáticos
- `05_create_rls.sql` - Políticas de seguridad
- `06_seed_data.sql` - Datos iniciales

### **Recursos Útiles**

- [Documentación de Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## 🆘 **Soporte**

Si encuentras problemas:

1. Revisa los logs del sistema
2. Verifica la configuración de RLS
3. Consulta la documentación de Supabase
4. Contacta al equipo de desarrollo

---

**Nota**: Esta configuración está optimizada para el sistema Zecu. Ajusta según tus necesidades específicas.



