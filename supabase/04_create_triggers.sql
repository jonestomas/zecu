-- =====================================================
-- TRIGGERS PARA AUTOMATIZACIÓN - ZECU
-- =====================================================
-- Este script crea todos los triggers necesarios para
-- automatizar tareas en la base de datos

-- =====================================================
-- 1. TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

-- Trigger para tabla users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabla subscriptions
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabla feature_usage
CREATE TRIGGER update_feature_usage_updated_at
    BEFORE UPDATE ON feature_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabla system_config
CREATE TRIGGER update_system_config_updated_at
    BEFORE UPDATE ON system_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabla notifications
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabla user_sessions
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TRIGGER PARA ACTUALIZAR ÚLTIMA ACTIVIDAD
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar última actividad del usuario cuando se crea un análisis
    UPDATE users
    SET 
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar actividad en análisis
CREATE TRIGGER update_activity_on_analysis
    AFTER INSERT ON message_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_activity();

-- =====================================================
-- 3. TRIGGER PARA REGISTRAR USO DE FEATURES
-- =====================================================
CREATE OR REPLACE FUNCTION auto_record_feature_usage()
RETURNS TRIGGER AS $$
DECLARE
    v_subscription_id UUID;
BEGIN
    -- Obtener suscripción activa del usuario
    SELECT id INTO v_subscription_id
    FROM subscriptions
    WHERE user_id = NEW.user_id
    AND status = 'active'
    AND (end_date IS NULL OR end_date > NOW())
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Registrar uso de análisis de mensaje
    INSERT INTO feature_usage (
        user_id,
        subscription_id,
        feature_name,
        feature_type,
        usage_count
    ) VALUES (
        NEW.user_id,
        v_subscription_id,
        'message_analysis',
        'analysis',
        1
    ) ON CONFLICT (user_id, feature_name)
    DO UPDATE SET
        usage_count = feature_usage.usage_count + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar uso automático
CREATE TRIGGER auto_record_analysis_usage
    AFTER INSERT ON message_analyses
    FOR EACH ROW
    EXECUTE FUNCTION auto_record_feature_usage();

-- =====================================================
-- 4. TRIGGER PARA LOGGING AUTOMÁTICO
-- =====================================================
CREATE OR REPLACE FUNCTION log_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar cambios en el estado
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO system_logs (
            event_type,
            event_category,
            event_action,
            user_id,
            subscription_id,
            event_data,
            source
        ) VALUES (
            'subscription_status_changed',
            'subscription',
            'status_update',
            NEW.user_id,
            NEW.id,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'plan_id', NEW.plan_id,
                'changed_at', NOW()
            ),
            'database_trigger'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para logging de cambios de suscripción
CREATE TRIGGER log_subscription_changes
    AFTER UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_changes();

-- =====================================================
-- 5. TRIGGER PARA VALIDACIÓN DE SUSCRIPCIONES
-- =====================================================
CREATE OR REPLACE FUNCTION validate_subscription_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id) THEN
        RAISE EXCEPTION 'El usuario con ID % no existe', NEW.user_id;
    END IF;
    
    -- Validar fechas
    IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
        IF NEW.end_date <= NEW.start_date THEN
            RAISE EXCEPTION 'La fecha de fin debe ser posterior a la fecha de inicio';
        END IF;
    END IF;
    
    -- Validar activación
    IF NEW.activated_at IS NOT NULL AND NEW.start_date IS NOT NULL THEN
        IF NEW.activated_at < NEW.start_date THEN
            RAISE EXCEPTION 'La fecha de activación no puede ser anterior a la fecha de inicio';
        END IF;
    END IF;
    
    -- Validar cancelación
    IF NEW.cancelled_at IS NOT NULL AND NEW.activated_at IS NOT NULL THEN
        IF NEW.cancelled_at < NEW.activated_at THEN
            RAISE EXCEPTION 'La fecha de cancelación no puede ser anterior a la fecha de activación';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de suscripciones
CREATE TRIGGER validate_subscription_data
    BEFORE INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION validate_subscription_data();

-- =====================================================
-- 6. TRIGGER PARA LIMPIAR SESIONES EXPIRADAS
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    -- Limpiar sesiones expiradas del mismo usuario
    DELETE FROM user_sessions
    WHERE user_id = NEW.user_id
    AND expires_at < NOW()
    AND id != NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpieza automática de sesiones
CREATE TRIGGER cleanup_expired_sessions
    AFTER INSERT ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_expired_sessions();

-- =====================================================
-- 7. TRIGGER PARA NOTIFICACIONES AUTOMÁTICAS
-- =====================================================
CREATE OR REPLACE FUNCTION create_subscription_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificación de suscripción creada
    IF TG_OP = 'INSERT' THEN
        INSERT INTO notifications (
            user_id,
            title,
            message,
            notification_type,
            channels,
            action_url,
            action_text
        ) VALUES (
            NEW.user_id,
            'Suscripción Creada',
            CASE NEW.plan_id
                WHEN 'free' THEN 'Tu plan gratuito de 7 días ha sido creado. ¡Actívalo enviando un mensaje a nuestro bot de WhatsApp!'
                WHEN 'basic' THEN 'Tu suscripción al plan básico ha sido creada. ¡Disfruta de todas las características!'
                WHEN 'premium' THEN 'Tu suscripción al plan premium ha sido creada. ¡Tienes acceso a todas las funciones avanzadas!'
            END,
            'success',
            ARRAY['whatsapp', 'email'],
            '/dashboard',
            'Ver Dashboard'
        );
    END IF;
    
    -- Notificación de cambio de estado
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'active' THEN
                INSERT INTO notifications (
                    user_id,
                    title,
                    message,
                    notification_type,
                    channels,
                    action_url,
                    action_text
                ) VALUES (
                    NEW.user_id,
                    'Suscripción Activada',
                    '¡Tu suscripción está ahora activa! Puedes comenzar a usar Zecu.',
                    'success',
                    ARRAY['whatsapp', 'email'],
                    '/dashboard',
                    'Comenzar'
                );
            WHEN 'expired' THEN
                INSERT INTO notifications (
                    user_id,
                    title,
                    message,
                    notification_type,
                    channels,
                    action_url,
                    action_text
                ) VALUES (
                    NEW.user_id,
                    'Suscripción Expirada',
                    'Tu suscripción ha expirado. ¡Renueva para seguir usando Zecu!',
                    'warning',
                    ARRAY['whatsapp', 'email'],
                    '/pricing',
                    'Renovar'
                );
            WHEN 'cancelled' THEN
                INSERT INTO notifications (
                    user_id,
                    title,
                    message,
                    notification_type,
                    channels
                ) VALUES (
                    NEW.user_id,
                    'Suscripción Cancelada',
                    'Tu suscripción ha sido cancelada. ¡Esperamos verte pronto!',
                    'info',
                    ARRAY['email']
                );
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificaciones automáticas
CREATE TRIGGER create_subscription_notifications
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION create_subscription_notifications();

-- =====================================================
-- 8. TRIGGER PARA ACTUALIZAR USO DE FEATURES
-- =====================================================
CREATE OR REPLACE FUNCTION update_feature_usage_on_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la suscripción se activa, actualizar límites de uso
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        -- Actualizar límites según el plan
        UPDATE feature_usage
        SET 
            usage_limit = CASE NEW.plan_id
                WHEN 'free' THEN 5
                WHEN 'basic' THEN 50
                WHEN 'premium' THEN -1
            END,
            reset_period = 'monthly',
            updated_at = NOW()
        WHERE user_id = NEW.user_id
        AND feature_name = 'message_analysis';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar límites de uso
CREATE TRIGGER update_feature_usage_on_subscription_change
    AFTER UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_usage_on_subscription_change();

-- =====================================================
-- COMENTARIOS EN TRIGGERS
-- =====================================================
COMMENT ON TRIGGER update_users_updated_at ON users IS 'Actualiza automáticamente el campo updated_at';
COMMENT ON TRIGGER update_activity_on_analysis ON message_analyses IS 'Actualiza la última actividad del usuario';
COMMENT ON TRIGGER auto_record_analysis_usage ON message_analyses IS 'Registra automáticamente el uso de análisis';
COMMENT ON TRIGGER log_subscription_changes ON subscriptions IS 'Registra cambios de estado de suscripciones';
COMMENT ON TRIGGER validate_subscription_data ON subscriptions IS 'Valida datos de suscripciones';
COMMENT ON TRIGGER cleanup_expired_sessions ON user_sessions IS 'Limpia sesiones expiradas automáticamente';
COMMENT ON TRIGGER create_subscription_notifications ON subscriptions IS 'Crea notificaciones automáticas para suscripciones';
COMMENT ON TRIGGER update_feature_usage_on_subscription_change ON subscriptions IS 'Actualiza límites de uso al cambiar suscripción';




