-- =====================================================
-- FUNCIONES DE BASE DE DATOS - ZECU
-- =====================================================
-- Este script crea todas las funciones necesarias para
-- el funcionamiento del sistema Zecu

-- =====================================================
-- 1. FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 2. FUNCIÓN PARA CREAR USUARIO CON SUSCRIPCIÓN
-- =====================================================
CREATE OR REPLACE FUNCTION create_user_with_subscription(
    p_whatsapp_number TEXT,
    p_email TEXT DEFAULT NULL,
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_plan_id TEXT DEFAULT 'free',
    p_source TEXT DEFAULT 'website',
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
    user_id UUID,
    subscription_id UUID,
    whatsapp_number TEXT,
    plan_id TEXT,
    status TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_subscription_id UUID;
    v_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Validar número de WhatsApp
    IF NOT (p_whatsapp_number ~ '^\+[1-9]\d{1,14}$') THEN
        RAISE EXCEPTION 'Número de WhatsApp inválido: %', p_whatsapp_number;
    END IF;
    
    -- Validar plan
    IF p_plan_id NOT IN ('free', 'basic', 'premium') THEN
        RAISE EXCEPTION 'Plan inválido: %', p_plan_id;
    END IF;
    
    -- Calcular fecha de fin según el plan
    CASE p_plan_id
        WHEN 'free' THEN v_end_date := NOW() + INTERVAL '7 days';
        WHEN 'basic' THEN v_end_date := NOW() + INTERVAL '30 days';
        WHEN 'premium' THEN v_end_date := NOW() + INTERVAL '30 days';
    END CASE;
    
    -- Crear usuario
    INSERT INTO users (
        whatsapp_number,
        email,
        first_name,
        last_name,
        metadata
    ) VALUES (
        p_whatsapp_number,
        p_email,
        p_first_name,
        p_last_name,
        p_metadata
    ) RETURNING id INTO v_user_id;
    
    -- Crear suscripción
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
        v_user_id,
        p_plan_id,
        p_plan_id,
        'pending',
        NOW(),
        v_end_date,
        p_source,
        p_metadata
    ) RETURNING id INTO v_subscription_id;
    
    -- Retornar resultado
    RETURN QUERY SELECT
        v_user_id,
        v_subscription_id,
        p_whatsapp_number,
        p_plan_id,
        'pending'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FUNCIÓN PARA ACTIVAR SUSCRIPCIÓN
-- =====================================================
CREATE OR REPLACE FUNCTION activate_subscription(
    p_subscription_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    subscription_id UUID,
    user_id UUID,
    plan_id TEXT
) AS $$
DECLARE
    v_subscription RECORD;
    v_user_id UUID;
BEGIN
    -- Obtener información de la suscripción
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE id = p_subscription_id;
    
    -- Verificar que existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT
            false,
            'Suscripción no encontrada',
            p_subscription_id,
            NULL::UUID,
            NULL::TEXT;
        RETURN;
    END IF;
    
    -- Verificar que no esté ya activa
    IF v_subscription.status = 'active' THEN
        RETURN QUERY SELECT
            false,
            'La suscripción ya está activa',
            p_subscription_id,
            v_subscription.user_id,
            v_subscription.plan_id;
        RETURN;
    END IF;
    
    -- Verificar que no esté expirada
    IF v_subscription.end_date < NOW() THEN
        UPDATE subscriptions
        SET status = 'expired', updated_at = NOW()
        WHERE id = p_subscription_id;
        
        RETURN QUERY SELECT
            false,
            'La suscripción ha expirado',
            p_subscription_id,
            v_subscription.user_id,
            v_subscription.plan_id;
        RETURN;
    END IF;
    
    -- Activar suscripción
    UPDATE subscriptions
    SET 
        status = 'active',
        activated_at = NOW(),
        updated_at = NOW()
    WHERE id = p_subscription_id;
    
    -- Actualizar última actividad del usuario
    UPDATE users
    SET 
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = v_subscription.user_id;
    
    RETURN QUERY SELECT
        true,
        'Suscripción activada exitosamente',
        p_subscription_id,
        v_subscription.user_id,
        v_subscription.plan_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCIÓN PARA VERIFICAR LÍMITES DE USO
-- =====================================================
CREATE OR REPLACE FUNCTION check_usage_limits(
    p_user_id UUID,
    p_feature_name TEXT
)
RETURNS TABLE(
    can_use BOOLEAN,
    current_usage INTEGER,
    usage_limit INTEGER,
    remaining_usage INTEGER,
    reset_period TEXT
) AS $$
DECLARE
    v_subscription RECORD;
    v_feature_usage RECORD;
    v_remaining INTEGER;
BEGIN
    -- Obtener suscripción activa
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND (end_date IS NULL OR end_date > NOW())
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Si no hay suscripción activa
    IF NOT FOUND THEN
        RETURN QUERY SELECT
            false,
            0,
            0,
            0,
            NULL::TEXT;
        RETURN;
    END IF;
    
    -- Obtener uso de la feature
    SELECT * INTO v_feature_usage
    FROM feature_usage
    WHERE user_id = p_user_id
    AND feature_name = p_feature_name;
    
    -- Si no hay registro de uso, crear uno
    IF NOT FOUND THEN
        INSERT INTO feature_usage (user_id, subscription_id, feature_name, feature_type)
        VALUES (p_user_id, v_subscription.id, p_feature_name, 'analysis')
        ON CONFLICT (user_id, feature_name) DO NOTHING;
        
        SELECT * INTO v_feature_usage
        FROM feature_usage
        WHERE user_id = p_user_id
        AND feature_name = p_feature_name;
    END IF;
    
    -- Calcular límite según el plan
    CASE v_subscription.plan_id
        WHEN 'free' THEN
            CASE p_feature_name
                WHEN 'message_analysis' THEN v_feature_usage.usage_limit := 5;
                WHEN 'whatsapp_notifications' THEN v_feature_usage.usage_limit := 10;
                ELSE v_feature_usage.usage_limit := 0;
            END CASE;
        WHEN 'basic' THEN
            CASE p_feature_name
                WHEN 'message_analysis' THEN v_feature_usage.usage_limit := 50;
                WHEN 'whatsapp_notifications' THEN v_feature_usage.usage_limit := 100;
                ELSE v_feature_usage.usage_limit := 10;
            END CASE;
        WHEN 'premium' THEN
            v_feature_usage.usage_limit := -1; -- Ilimitado
    END CASE;
    
    -- Calcular uso restante
    IF v_feature_usage.usage_limit = -1 THEN
        v_remaining := -1; -- Ilimitado
    ELSE
        v_remaining := GREATEST(0, v_feature_usage.usage_limit - v_feature_usage.usage_count);
    END IF;
    
    -- Verificar si puede usar
    RETURN QUERY SELECT
        (v_feature_usage.usage_limit = -1 OR v_feature_usage.usage_count < v_feature_usage.usage_limit),
        v_feature_usage.usage_count,
        v_feature_usage.usage_limit,
        v_remaining,
        v_feature_usage.reset_period;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNCIÓN PARA REGISTRAR USO DE FEATURE
-- =====================================================
CREATE OR REPLACE FUNCTION record_feature_usage(
    p_user_id UUID,
    p_feature_name TEXT,
    p_feature_type TEXT DEFAULT 'analysis',
    p_usage_count INTEGER DEFAULT 1
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    current_usage INTEGER,
    usage_limit INTEGER
) AS $$
DECLARE
    v_limits RECORD;
    v_new_usage INTEGER;
BEGIN
    -- Verificar límites
    SELECT * INTO v_limits
    FROM check_usage_limits(p_user_id, p_feature_name);
    
    -- Si no puede usar
    IF NOT v_limits.can_use THEN
        RETURN QUERY SELECT
            false,
            'Límite de uso alcanzado',
            v_limits.current_usage,
            v_limits.usage_limit;
        RETURN;
    END IF;
    
    -- Actualizar uso
    UPDATE feature_usage
    SET 
        usage_count = usage_count + p_usage_count,
        updated_at = NOW()
    WHERE user_id = p_user_id
    AND feature_name = p_feature_name;
    
    -- Obtener nuevo uso
    SELECT usage_count INTO v_new_usage
    FROM feature_usage
    WHERE user_id = p_user_id
    AND feature_name = p_feature_name;
    
    RETURN QUERY SELECT
        true,
        'Uso registrado exitosamente',
        v_new_usage,
        v_limits.usage_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCIÓN PARA OBTENER ESTADÍSTICAS DE USUARIO
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_stats(
    p_user_id UUID
)
RETURNS TABLE(
    total_analyses INTEGER,
    phishing_detected INTEGER,
    false_positives INTEGER,
    accuracy_rate DECIMAL(5,2),
    days_active INTEGER,
    current_plan TEXT,
    plan_status TEXT
) AS $$
DECLARE
    v_subscription RECORD;
    v_total_analyses INTEGER;
    v_phishing_detected INTEGER;
    v_false_positives INTEGER;
    v_accuracy_rate DECIMAL(5,2);
    v_days_active INTEGER;
BEGIN
    -- Obtener suscripción actual
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Contar análisis totales
    SELECT COUNT(*) INTO v_total_analyses
    FROM message_analyses
    WHERE user_id = p_user_id;
    
    -- Contar phishing detectado
    SELECT COUNT(*) INTO v_phishing_detected
    FROM message_analyses
    WHERE user_id = p_user_id
    AND is_phishing = true;
    
    -- Calcular falsos positivos (simplificado)
    SELECT COUNT(*) INTO v_false_positives
    FROM message_analyses
    WHERE user_id = p_user_id
    AND is_phishing = true
    AND confidence_score < 0.7;
    
    -- Calcular tasa de precisión
    IF v_total_analyses > 0 THEN
        v_accuracy_rate := ((v_total_analyses - v_false_positives)::DECIMAL / v_total_analyses) * 100;
    ELSE
        v_accuracy_rate := 0;
    END IF;
    
    -- Calcular días activos
    SELECT COALESCE(EXTRACT(DAYS FROM (NOW() - MIN(created_at))), 0)::INTEGER INTO v_days_active
    FROM message_analyses
    WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT
        v_total_analyses,
        v_phishing_detected,
        v_false_positives,
        v_accuracy_rate,
        v_days_active,
        COALESCE(v_subscription.plan_id, 'none'),
        COALESCE(v_subscription.status, 'none');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNCIÓN PARA LIMPIAR DATOS EXPIRADOS
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS TABLE(
    cleaned_sessions INTEGER,
    cleaned_notifications INTEGER,
    expired_subscriptions INTEGER
) AS $$
DECLARE
    v_cleaned_sessions INTEGER := 0;
    v_cleaned_notifications INTEGER := 0;
    v_expired_subscriptions INTEGER := 0;
BEGIN
    -- Limpiar sesiones expiradas
    DELETE FROM user_sessions
    WHERE expires_at < NOW();
    GET DIAGNOSTICS v_cleaned_sessions = ROW_COUNT;
    
    -- Limpiar notificaciones expiradas
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
    GET DIAGNOSTICS v_cleaned_notifications = ROW_COUNT;
    
    -- Marcar suscripciones expiradas
    UPDATE subscriptions
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE status = 'active'
    AND end_date IS NOT NULL
    AND end_date < NOW();
    GET DIAGNOSTICS v_expired_subscriptions = ROW_COUNT;
    
    RETURN QUERY SELECT
        v_cleaned_sessions,
        v_cleaned_notifications,
        v_expired_subscriptions;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. FUNCIÓN PARA OBTENER MÉTRICAS DEL SISTEMA
-- =====================================================
CREATE OR REPLACE FUNCTION get_system_metrics(
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
    total_users INTEGER,
    active_users INTEGER,
    total_subscriptions INTEGER,
    active_subscriptions INTEGER,
    total_analyses INTEGER,
    phishing_detected INTEGER,
    revenue DECIMAL(10,2),
    conversion_rate DECIMAL(5,2)
) AS $$
DECLARE
    v_start_date TIMESTAMP WITH TIME ZONE;
    v_total_users INTEGER;
    v_active_users INTEGER;
    v_total_subscriptions INTEGER;
    v_active_subscriptions INTEGER;
    v_total_analyses INTEGER;
    v_phishing_detected INTEGER;
    v_revenue DECIMAL(10,2);
    v_conversion_rate DECIMAL(5,2);
BEGIN
    v_start_date := NOW() - (p_days || ' days')::INTERVAL;
    
    -- Total de usuarios
    SELECT COUNT(*) INTO v_total_users
    FROM users
    WHERE created_at >= v_start_date;
    
    -- Usuarios activos
    SELECT COUNT(*) INTO v_active_users
    FROM users
    WHERE created_at >= v_start_date
    AND last_activity_at >= v_start_date;
    
    -- Total de suscripciones
    SELECT COUNT(*) INTO v_total_subscriptions
    FROM subscriptions
    WHERE created_at >= v_start_date;
    
    -- Suscripciones activas
    SELECT COUNT(*) INTO v_active_subscriptions
    FROM subscriptions
    WHERE created_at >= v_start_date
    AND status = 'active';
    
    -- Total de análisis
    SELECT COUNT(*) INTO v_total_analyses
    FROM message_analyses
    WHERE created_at >= v_start_date;
    
    -- Phishing detectado
    SELECT COUNT(*) INTO v_phishing_detected
    FROM message_analyses
    WHERE created_at >= v_start_date
    AND is_phishing = true;
    
    -- Ingresos (simplificado)
    SELECT COALESCE(SUM(
        CASE plan_id
            WHEN 'basic' THEN 1999
            WHEN 'premium' THEN 5999
            ELSE 0
        END
    ), 0) INTO v_revenue
    FROM subscriptions
    WHERE created_at >= v_start_date
    AND status = 'active';
    
    -- Tasa de conversión
    IF v_total_users > 0 THEN
        v_conversion_rate := (v_active_subscriptions::DECIMAL / v_total_users) * 100;
    ELSE
        v_conversion_rate := 0;
    END IF;
    
    RETURN QUERY SELECT
        v_total_users,
        v_active_users,
        v_total_subscriptions,
        v_active_subscriptions,
        v_total_analyses,
        v_phishing_detected,
        v_revenue,
        v_conversion_rate;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIOS EN FUNCIONES
-- =====================================================
COMMENT ON FUNCTION create_user_with_subscription IS 'Crea un usuario con su suscripción inicial';
COMMENT ON FUNCTION activate_subscription IS 'Activa una suscripción pendiente';
COMMENT ON FUNCTION check_usage_limits IS 'Verifica si un usuario puede usar una feature';
COMMENT ON FUNCTION record_feature_usage IS 'Registra el uso de una feature por un usuario';
COMMENT ON FUNCTION get_user_stats IS 'Obtiene estadísticas de un usuario';
COMMENT ON FUNCTION cleanup_expired_data IS 'Limpia datos expirados del sistema';
COMMENT ON FUNCTION get_system_metrics IS 'Obtiene métricas del sistema';




