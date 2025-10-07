-- =====================================================
-- DATOS INICIALES Y CONFIGURACIÓN - ZECU
-- =====================================================
-- Este script inserta datos iniciales y configuración
-- necesaria para el funcionamiento del sistema

-- =====================================================
-- 1. CONFIGURACIÓN INICIAL DEL SISTEMA
-- =====================================================

-- Configuración de planes
INSERT INTO system_config (config_key, config_value, config_type, description, is_public, is_editable) VALUES
('plans.free.duration_days', '7', 'number', 'Duración del plan gratuito en días', true, true),
('plans.free.analysis_limit', '5', 'number', 'Límite de análisis para plan gratuito', true, true),
('plans.free.whatsapp_limit', '10', 'number', 'Límite de notificaciones WhatsApp para plan gratuito', true, true),
('plans.basic.price', '1999', 'number', 'Precio del plan básico en ARS', true, true),
('plans.basic.duration_days', '30', 'number', 'Duración del plan básico en días', true, true),
('plans.basic.analysis_limit', '50', 'number', 'Límite de análisis para plan básico', true, true),
('plans.basic.whatsapp_limit', '100', 'number', 'Límite de notificaciones WhatsApp para plan básico', true, true),
('plans.premium.price', '5999', 'number', 'Precio del plan premium en ARS', true, true),
('plans.premium.duration_days', '30', 'number', 'Duración del plan premium en días', true, true),
('plans.premium.analysis_limit', '-1', 'number', 'Límite de análisis para plan premium (ilimitado)', true, true),
('plans.premium.whatsapp_limit', '-1', 'number', 'Límite de notificaciones WhatsApp para plan premium (ilimitado)', true, true);

-- Configuración de features
INSERT INTO system_config (config_key, config_value, config_type, description, is_public, is_editable) VALUES
('features.message_analysis.enabled', 'true', 'boolean', 'Habilitar análisis de mensajes', true, true),
('features.whatsapp_notifications.enabled', 'true', 'boolean', 'Habilitar notificaciones por WhatsApp', true, true),
('features.email_notifications.enabled', 'true', 'boolean', 'Habilitar notificaciones por email', true, true),
('features.export_data.enabled', 'false', 'boolean', 'Habilitar exportación de datos', true, true),
('features.api_access.enabled', 'false', 'boolean', 'Habilitar acceso a API', true, true);

-- Configuración de límites del sistema
INSERT INTO system_config (config_key, config_value, config_type, description, is_public, is_editable) VALUES
('limits.max_analysis_length', '10000', 'number', 'Longitud máxima de mensaje para análisis', true, true),
('limits.max_file_size_mb', '10', 'number', 'Tamaño máximo de archivo en MB', true, true),
('limits.session_timeout_hours', '24', 'number', 'Timeout de sesión en horas', true, true),
('limits.max_sessions_per_user', '5', 'number', 'Máximo de sesiones simultáneas por usuario', true, true);

-- Configuración de notificaciones
INSERT INTO system_config (config_key, config_value, config_type, description, is_public, is_editable) VALUES
('notifications.welcome.enabled', 'true', 'boolean', 'Habilitar notificación de bienvenida', true, true),
('notifications.subscription_reminder.enabled', 'true', 'boolean', 'Habilitar recordatorios de suscripción', true, true),
('notifications.subscription_reminder.days_before', '3', 'number', 'Días antes de expirar para enviar recordatorio', true, true),
('notifications.limit_warning.enabled', 'true', 'boolean', 'Habilitar advertencias de límite', true, true),
('notifications.limit_warning.threshold', '0.8', 'number', 'Umbral para advertencia de límite (0.8 = 80%)', true, true);

-- Configuración de seguridad
INSERT INTO system_config (config_key, config_value, config_type, description, is_public, is_editable) VALUES
('security.max_login_attempts', '5', 'number', 'Máximo de intentos de login', false, true),
('security.lockout_duration_minutes', '30', 'number', 'Duración del bloqueo en minutos', false, true),
('security.password_min_length', '8', 'number', 'Longitud mínima de contraseña', false, true),
('security.session_secret', 'your-secret-key-here', 'string', 'Clave secreta para sesiones', false, true);

-- Configuración de integraciones
INSERT INTO system_config (config_key, config_value, config_type, description, is_public, is_editable) VALUES
('integrations.mercadopago.enabled', 'true', 'boolean', 'Habilitar integración con Mercado Pago', false, true),
('integrations.whatsapp.enabled', 'true', 'boolean', 'Habilitar integración con WhatsApp', false, true),
('integrations.email.enabled', 'true', 'boolean', 'Habilitar integración con email', false, true),
('integrations.n8n.enabled', 'true', 'boolean', 'Habilitar integración con n8n', false, true);

-- =====================================================
-- 2. USUARIO ADMINISTRADOR INICIAL
-- =====================================================

-- Crear usuario administrador (cambiar datos según necesidad)
INSERT INTO users (
    whatsapp_number,
    email,
    first_name,
    last_name,
    is_active,
    is_verified,
    metadata
) VALUES (
    '+5491112345678', -- Cambiar por tu número
    'admin@zecu.com', -- Cambiar por tu email
    'Admin',
    'Zecu',
    true,
    true,
    '{"role": "admin", "permissions": ["all"], "created_by": "system"}'::jsonb
);

-- Crear suscripción premium para el administrador
INSERT INTO subscriptions (
    user_id,
    plan_id,
    plan_type,
    status,
    start_date,
    end_date,
    activated_at,
    source,
    metadata
) VALUES (
    (SELECT id FROM users WHERE whatsapp_number = '+5491112345678'),
    'premium',
    'premium',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW(),
    'admin',
    '{"created_by": "system", "is_admin": true}'::jsonb
);

-- =====================================================
-- 3. CONFIGURACIÓN DE FEATURES INICIALES
-- =====================================================

-- Crear registros de uso de features para el administrador
INSERT INTO feature_usage (
    user_id,
    subscription_id,
    feature_name,
    feature_type,
    usage_count,
    usage_limit,
    reset_period
) VALUES
(
    (SELECT id FROM users WHERE whatsapp_number = '+5491112345678'),
    (SELECT id FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE whatsapp_number = '+5491112345678')),
    'message_analysis',
    'analysis',
    0,
    -1, -- Ilimitado para admin
    'monthly'
),
(
    (SELECT id FROM users WHERE whatsapp_number = '+5491112345678'),
    (SELECT id FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE whatsapp_number = '+5491112345678')),
    'whatsapp_notifications',
    'notification',
    0,
    -1, -- Ilimitado para admin
    'monthly'
),
(
    (SELECT id FROM users WHERE whatsapp_number = '+5491112345678'),
    (SELECT id FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE whatsapp_number = '+5491112345678')),
    'email_notifications',
    'notification',
    0,
    -1, -- Ilimitado para admin
    'monthly'
),
(
    (SELECT id FROM users WHERE whatsapp_number = '+5491112345678'),
    (SELECT id FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE whatsapp_number = '+5491112345678')),
    'export_data',
    'export',
    0,
    -1, -- Ilimitado para admin
    'monthly'
),
(
    (SELECT id FROM users WHERE whatsapp_number = '+5491112345678'),
    (SELECT id FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE whatsapp_number = '+5491112345678')),
    'api_access',
    'api',
    0,
    -1, -- Ilimitado para admin
    'monthly'
);

-- =====================================================
-- 4. NOTIFICACIONES INICIALES
-- =====================================================

-- Notificación de bienvenida para el administrador
INSERT INTO notifications (
    user_id,
    title,
    message,
    notification_type,
    channels,
    is_sent,
    sent_at
) VALUES (
    (SELECT id FROM users WHERE whatsapp_number = '+5491112345678'),
    '¡Bienvenido a Zecu!',
    'El sistema ha sido configurado exitosamente. Tu cuenta de administrador está lista para usar.',
    'success',
    ARRAY['email'],
    true,
    NOW()
);

-- =====================================================
-- 5. DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Solo crear datos de prueba si estamos en desarrollo
-- (Esto se puede comentar en producción)

-- Usuario de prueba
INSERT INTO users (
    whatsapp_number,
    email,
    first_name,
    last_name,
    is_active,
    is_verified,
    metadata
) VALUES (
    '+5491198765432',
    'test@zecu.com',
    'Usuario',
    'Prueba',
    true,
    true,
    '{"role": "user", "test_user": true}'::jsonb
);

-- Suscripción de prueba (plan gratuito)
INSERT INTO subscriptions (
    user_id,
    plan_id,
    plan_type,
    status,
    start_date,
    end_date,
    source,
    metadata
) VALUES (
    (SELECT id FROM users WHERE whatsapp_number = '+5491198765432'),
    'free',
    'free',
    'pending',
    NOW(),
    NOW() + INTERVAL '7 days',
    'website',
    '{"test_subscription": true}'::jsonb
);

-- =====================================================
-- 6. CONFIGURACIÓN DE TAREAS PROGRAMADAS
-- =====================================================

-- Crear función para tareas programadas
CREATE OR REPLACE FUNCTION schedule_cleanup_tasks()
RETURNS void AS $$
BEGIN
    -- Esta función se ejecutará diariamente para limpiar datos expirados
    PERFORM cleanup_expired_data();
    
    -- Log de la tarea
    INSERT INTO system_logs (
        event_type,
        event_category,
        event_action,
        event_data,
        source
    ) VALUES (
        'cleanup_task',
        'system',
        'daily_cleanup',
        '{"cleaned_at": "' || NOW() || '"}',
        'cron'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista para estadísticas de usuarios
CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
    u.id,
    u.whatsapp_number,
    u.email,
    u.first_name,
    u.last_name,
    u.is_active,
    u.is_verified,
    u.created_at,
    u.last_activity_at,
    s.plan_id,
    s.status as subscription_status,
    s.start_date,
    s.end_date,
    COALESCE(ma.total_analyses, 0) as total_analyses,
    COALESCE(ma.phishing_detected, 0) as phishing_detected
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_analyses,
        COUNT(*) FILTER (WHERE is_phishing = true) as phishing_detected
    FROM message_analyses
    GROUP BY user_id
) ma ON u.id = ma.user_id;

-- Vista para métricas del sistema
CREATE OR REPLACE VIEW system_metrics_view AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = true) as active_users,
    COUNT(DISTINCT s.id) as total_subscriptions,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_subscriptions,
    COUNT(DISTINCT ma.id) as total_analyses,
    COUNT(DISTINCT ma.id) FILTER (WHERE ma.is_phishing = true) as phishing_detected,
    COUNT(DISTINCT s.id) FILTER (WHERE s.plan_id = 'basic') * 1999 + 
    COUNT(DISTINCT s.id) FILTER (WHERE s.plan_id = 'premium') * 5999 as estimated_revenue
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN message_analyses ma ON u.id = ma.user_id;

-- Vista para suscripciones que expiran pronto
CREATE OR REPLACE VIEW expiring_subscriptions_view AS
SELECT 
    u.whatsapp_number,
    u.email,
    s.plan_id,
    s.end_date,
    EXTRACT(DAYS FROM (s.end_date - NOW())) as days_until_expiry
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'active'
AND s.end_date IS NOT NULL
AND s.end_date > NOW()
AND s.end_date <= NOW() + INTERVAL '7 days'
ORDER BY s.end_date ASC;

-- =====================================================
-- 8. COMENTARIOS FINALES
-- =====================================================

-- Comentarios en vistas
COMMENT ON VIEW user_stats_view IS 'Estadísticas completas de usuarios con suscripciones y análisis';
COMMENT ON VIEW system_metrics_view IS 'Métricas generales del sistema';
COMMENT ON VIEW expiring_subscriptions_view IS 'Suscripciones que expiran en los próximos 7 días';

-- Comentarios en configuración
COMMENT ON TABLE system_config IS 'Configuración del sistema Zecu';
COMMENT ON FUNCTION schedule_cleanup_tasks() IS 'Tarea programada para limpieza diaria de datos expirados';

-- =====================================================
-- 9. VERIFICACIÓN DE DATOS INICIALES
-- =====================================================

-- Verificar que los datos se insertaron correctamente
DO $$
DECLARE
    user_count INTEGER;
    config_count INTEGER;
    admin_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO config_count FROM system_config;
    SELECT EXISTS(SELECT 1 FROM users WHERE metadata->>'role' = 'admin') INTO admin_exists;
    
    RAISE NOTICE 'Usuarios creados: %', user_count;
    RAISE NOTICE 'Configuraciones creadas: %', config_count;
    RAISE NOTICE 'Administrador existe: %', admin_exists;
    
    IF user_count = 0 THEN
        RAISE EXCEPTION 'No se crearon usuarios';
    END IF;
    
    IF config_count = 0 THEN
        RAISE EXCEPTION 'No se creó configuración';
    END IF;
    
    IF NOT admin_exists THEN
        RAISE EXCEPTION 'No se creó usuario administrador';
    END IF;
    
    RAISE NOTICE 'Datos iniciales creados exitosamente';
END;
$$;




