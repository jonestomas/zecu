-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS - ZECU
-- =====================================================
-- Este script crea todos los índices necesarios para optimizar
-- el rendimiento de las consultas en la base de datos

-- =====================================================
-- ÍNDICES PARA TABLA USERS
-- =====================================================

-- Índice único para búsqueda por número de WhatsApp
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp_number 
ON users(whatsapp_number);

-- Índice para búsqueda por email
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email) WHERE email IS NOT NULL;

-- Índice para usuarios activos
CREATE INDEX IF NOT EXISTS idx_users_active 
ON users(is_active) WHERE is_active = true;

-- Índice para usuarios verificados
CREATE INDEX IF NOT EXISTS idx_users_verified 
ON users(is_verified) WHERE is_verified = true;

-- Índice para búsqueda por país
CREATE INDEX IF NOT EXISTS idx_users_country 
ON users(country_code);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON users(created_at DESC);

-- Índice para última actividad
CREATE INDEX IF NOT EXISTS idx_users_last_activity 
ON users(last_activity_at DESC) WHERE last_activity_at IS NOT NULL;

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_users_active_verified 
ON users(is_active, is_verified) WHERE is_active = true;

-- =====================================================
-- ÍNDICES PARA TABLA SUBSCRIPTIONS
-- =====================================================

-- Índice para búsqueda por usuario
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON subscriptions(user_id);

-- Índice para búsqueda por plan
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id 
ON subscriptions(plan_id);

-- Índice para búsqueda por estado
CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
ON subscriptions(status);

-- Índice para suscripciones activas
CREATE INDEX IF NOT EXISTS idx_subscriptions_active 
ON subscriptions(user_id, status) WHERE status = 'active';

-- Índice para búsqueda por fechas
CREATE INDEX IF NOT EXISTS idx_subscriptions_dates 
ON subscriptions(start_date, end_date) WHERE start_date IS NOT NULL;

-- Índice para suscripciones que expiran pronto
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring 
ON subscriptions(end_date) WHERE status = 'active' AND end_date IS NOT NULL;

-- Índice para búsqueda por proveedor de pago
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_provider 
ON subscriptions(payment_provider) WHERE payment_provider IS NOT NULL;

-- Índice para búsqueda por estado de pago
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_status 
ON subscriptions(payment_status) WHERE payment_status IS NOT NULL;

-- Índice compuesto para consultas complejas
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_plan 
ON subscriptions(user_id, status, plan_id);

-- Índice para búsqueda por fuente
CREATE INDEX IF NOT EXISTS idx_subscriptions_source 
ON subscriptions(source);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at 
ON subscriptions(created_at DESC);

-- =====================================================
-- ÍNDICES PARA TABLA MESSAGE_ANALYSES
-- =====================================================

-- Índice para búsqueda por usuario
CREATE INDEX IF NOT EXISTS idx_analyses_user_id 
ON message_analyses(user_id);

-- Índice para búsqueda por suscripción
CREATE INDEX IF NOT EXISTS idx_analyses_subscription_id 
ON message_analyses(subscription_id) WHERE subscription_id IS NOT NULL;

-- Índice para análisis de phishing
CREATE INDEX IF NOT EXISTS idx_analyses_phishing 
ON message_analyses(is_phishing) WHERE is_phishing = true;

-- Índice para nivel de riesgo
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level 
ON message_analyses(risk_level) WHERE risk_level IS NOT NULL;

-- Índice para score de confianza
CREATE INDEX IF NOT EXISTS idx_analyses_confidence 
ON message_analyses(confidence_score DESC) WHERE confidence_score IS NOT NULL;

-- Índice para búsqueda por fecha
CREATE INDEX IF NOT EXISTS idx_analyses_created_at 
ON message_analyses(created_at DESC);

-- Índice para búsqueda por tipo de mensaje
CREATE INDEX IF NOT EXISTS idx_analyses_message_type 
ON message_analyses(message_type);

-- Índice compuesto para consultas de usuario y fecha
CREATE INDEX IF NOT EXISTS idx_analyses_user_created 
ON message_analyses(user_id, created_at DESC);

-- Índice para búsqueda por número de teléfono del remitente
CREATE INDEX IF NOT EXISTS idx_analyses_sender_number 
ON message_analyses(sender_number) WHERE sender_number IS NOT NULL;

-- Índice para análisis recientes (últimos 30 días)
CREATE INDEX IF NOT EXISTS idx_analyses_recent 
ON message_analyses(created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- =====================================================
-- ÍNDICES PARA TABLA FEATURE_USAGE
-- =====================================================

-- Índice para búsqueda por usuario
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id 
ON feature_usage(user_id);

-- Índice para búsqueda por suscripción
CREATE INDEX IF NOT EXISTS idx_feature_usage_subscription_id 
ON feature_analyses(subscription_id) WHERE subscription_id IS NOT NULL;

-- Índice para búsqueda por feature
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_name 
ON feature_usage(feature_name);

-- Índice para búsqueda por tipo de feature
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_type 
ON feature_usage(feature_type);

-- Índice compuesto para usuario y feature
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature 
ON feature_usage(user_id, feature_name);

-- Índice para features con límite alcanzado
CREATE INDEX IF NOT EXISTS idx_feature_usage_limit_reached 
ON feature_usage(user_id, feature_name) 
WHERE usage_limit IS NOT NULL AND usage_count >= usage_limit;

-- Índice para ordenamiento por fecha de actualización
CREATE INDEX IF NOT EXISTS idx_feature_usage_updated_at 
ON feature_usage(updated_at DESC);

-- =====================================================
-- ÍNDICES PARA TABLA SYSTEM_LOGS
-- =====================================================

-- Índice para búsqueda por tipo de evento
CREATE INDEX IF NOT EXISTS idx_logs_event_type 
ON system_logs(event_type);

-- Índice para búsqueda por categoría
CREATE INDEX IF NOT EXISTS idx_logs_event_category 
ON system_logs(event_category);

-- Índice para búsqueda por usuario
CREATE INDEX IF NOT EXISTS idx_logs_user_id 
ON system_logs(user_id) WHERE user_id IS NOT NULL;

-- Índice para búsqueda por suscripción
CREATE INDEX IF NOT EXISTS idx_logs_subscription_id 
ON system_logs(subscription_id) WHERE subscription_id IS NOT NULL;

-- Índice para búsqueda por fuente
CREATE INDEX IF NOT EXISTS idx_logs_source 
ON system_logs(source);

-- Índice para búsqueda por fecha
CREATE INDEX IF NOT EXISTS idx_logs_created_at 
ON system_logs(created_at DESC);

-- Índice para logs de error
CREATE INDEX IF NOT EXISTS idx_logs_errors 
ON system_logs(event_category, created_at DESC) 
WHERE event_category = 'error';

-- Índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_logs_type_category_date 
ON system_logs(event_type, event_category, created_at DESC);

-- Índice para búsqueda por IP
CREATE INDEX IF NOT EXISTS idx_logs_ip_address 
ON system_logs(ip_address) WHERE ip_address IS NOT NULL;

-- Índice para logs recientes (últimos 7 días)
CREATE INDEX IF NOT EXISTS idx_logs_recent 
ON system_logs(created_at DESC) 
WHERE created_at > NOW() - INTERVAL '7 days';

-- =====================================================
-- ÍNDICES PARA TABLA SYSTEM_CONFIG
-- =====================================================

-- Índice para búsqueda por clave
CREATE UNIQUE INDEX IF NOT EXISTS idx_config_key 
ON system_config(config_key);

-- Índice para configuraciones públicas
CREATE INDEX IF NOT EXISTS idx_config_public 
ON system_config(config_key) WHERE is_public = true;

-- Índice para configuraciones editables
CREATE INDEX IF NOT EXISTS idx_config_editable 
ON system_config(config_key) WHERE is_editable = true;

-- =====================================================
-- ÍNDICES PARA TABLA NOTIFICATIONS
-- =====================================================

-- Índice para búsqueda por usuario
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON notifications(user_id);

-- Índice para notificaciones no leídas
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, is_read) WHERE is_read = false;

-- Índice para búsqueda por tipo
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications(notification_type);

-- Índice para búsqueda por estado de envío
CREATE INDEX IF NOT EXISTS idx_notifications_sent 
ON notifications(is_sent) WHERE is_sent = true;

-- Índice para notificaciones por fecha
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON notifications(created_at DESC);

-- Índice para notificaciones expiradas
CREATE INDEX IF NOT EXISTS idx_notifications_expired 
ON notifications(expires_at) WHERE expires_at IS NOT NULL AND expires_at < NOW();

-- Índice compuesto para consultas de usuario
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- =====================================================
-- ÍNDICES PARA TABLA USER_SESSIONS
-- =====================================================

-- Índice para búsqueda por usuario
CREATE INDEX IF NOT EXISTS idx_sessions_user_id 
ON user_sessions(user_id);

-- Índice para búsqueda por token
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token 
ON user_sessions(session_token);

-- Índice para sesiones activas
CREATE INDEX IF NOT EXISTS idx_sessions_active 
ON user_sessions(user_id, is_active) WHERE is_active = true;

-- Índice para sesiones expiradas
CREATE INDEX IF NOT EXISTS idx_sessions_expired 
ON user_sessions(expires_at) WHERE expires_at < NOW();

-- Índice para última actividad
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity 
ON user_sessions(last_activity_at DESC) WHERE last_activity_at IS NOT NULL;

-- Índice para limpieza de sesiones expiradas
CREATE INDEX IF NOT EXISTS idx_sessions_cleanup 
ON user_sessions(expires_at) WHERE is_active = true;

-- =====================================================
-- ÍNDICES COMPUESTOS ADICIONALES
-- =====================================================

-- Índice para consultas de dashboard de usuario
CREATE INDEX IF NOT EXISTS idx_user_dashboard 
ON subscriptions(user_id, status, created_at DESC) 
WHERE status IN ('active', 'expired', 'cancelled');

-- Índice para métricas de uso
CREATE INDEX IF NOT EXISTS idx_usage_metrics 
ON message_analyses(user_id, created_at, is_phishing) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- Índice para reportes de administración
CREATE INDEX IF NOT EXISTS idx_admin_reports 
ON subscriptions(plan_id, status, created_at) 
WHERE created_at > NOW() - INTERVAL '90 days';

-- =====================================================
-- COMENTARIOS EN ÍNDICES
-- =====================================================
COMMENT ON INDEX idx_users_whatsapp_number IS 'Búsqueda rápida por número de WhatsApp';
COMMENT ON INDEX idx_subscriptions_active IS 'Suscripciones activas por usuario';
COMMENT ON INDEX idx_analyses_user_created IS 'Análisis de usuario ordenados por fecha';
COMMENT ON INDEX idx_logs_recent IS 'Logs recientes para debugging';
COMMENT ON INDEX idx_notifications_unread IS 'Notificaciones no leídas por usuario';
COMMENT ON INDEX idx_sessions_active IS 'Sesiones activas por usuario';




