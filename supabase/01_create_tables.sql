-- =====================================================
-- ZECU DATABASE SCHEMA - SUPABASE
-- =====================================================
-- Este script crea todas las tablas necesarias para el sistema Zecu
-- Incluye: usuarios, suscripciones, análisis, features y logs

-- =====================================================
-- 1. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_number TEXT NOT NULL UNIQUE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    country_code TEXT DEFAULT 'AR',
    timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
    language TEXT DEFAULT 'es',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT valid_whatsapp_number CHECK (whatsapp_number ~ '^\+[1-9]\d{1,14}$'),
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT valid_country_code CHECK (char_length(country_code) = 2)
);

-- =====================================================
-- 2. TABLA DE SUSCRIPCIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'basic', 'premium')),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'suspended')),
    
    -- Fechas
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    activated_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Información de pago (para planes pagos)
    payment_id TEXT,
    payment_provider TEXT CHECK (payment_provider IN ('mercadopago', 'stripe', 'manual')),
    payment_status TEXT CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
    
    -- Límites de uso
    usage_limits JSONB DEFAULT '{}'::jsonb,
    current_usage JSONB DEFAULT '{}'::jsonb,
    
    -- Metadatos
    source TEXT DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'admin', 'api')),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referral_code TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date),
    CONSTRAINT valid_activation CHECK (activated_at IS NULL OR start_date IS NULL OR activated_at >= start_date)
);

-- =====================================================
-- 3. TABLA DE ANÁLISIS DE MENSAJES
-- =====================================================
CREATE TABLE IF NOT EXISTS message_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Información del mensaje
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'link')),
    sender_number TEXT,
    sender_name TEXT,
    
    -- Resultado del análisis
    is_phishing BOOLEAN NOT NULL DEFAULT false,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Detalles del análisis
    analysis_result JSONB DEFAULT '{}'::jsonb,
    detected_patterns TEXT[],
    suggested_actions TEXT[],
    
    -- Metadatos
    processing_time_ms INTEGER,
    model_version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_confidence_score CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- =====================================================
-- 4. TABLA DE FEATURES Y LÍMITES
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    
    -- Feature específica
    feature_name TEXT NOT NULL,
    feature_type TEXT NOT NULL CHECK (feature_type IN ('analysis', 'notification', 'export', 'api', 'custom')),
    
    -- Uso
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    reset_period TEXT CHECK (reset_period IN ('daily', 'weekly', 'monthly', 'yearly', 'lifetime')),
    last_reset_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_usage_count CHECK (usage_count >= 0),
    CONSTRAINT valid_usage_limit CHECK (usage_limit IS NULL OR usage_limit >= 0),
    CONSTRAINT unique_user_feature UNIQUE (user_id, feature_name)
);

-- =====================================================
-- 5. TABLA DE LOGS DEL SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Información del evento
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL CHECK (event_category IN ('user', 'subscription', 'payment', 'analysis', 'system', 'error')),
    event_action TEXT NOT NULL,
    
    -- Contexto
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    session_id TEXT,
    
    -- Datos del evento
    event_data JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    error_code TEXT,
    
    -- Metadatos técnicos
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    source TEXT DEFAULT 'api' CHECK (source IN ('api', 'webhook', 'cron', 'admin', 'n8n')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_event_type CHECK (char_length(event_type) > 0),
    CONSTRAINT valid_event_action CHECK (char_length(event_action) > 0)
);

-- =====================================================
-- 6. TABLA DE CONFIGURACIÓN DEL SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Configuración
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    config_type TEXT NOT NULL CHECK (config_type IN ('string', 'number', 'boolean', 'json', 'array')),
    
    -- Metadatos
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_editable BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT valid_config_key CHECK (char_length(config_key) > 0)
);

-- =====================================================
-- 7. TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Contenido de la notificación
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'promotion')),
    
    -- Canales de envío
    channels TEXT[] DEFAULT '{}' CHECK (array_length(channels, 1) > 0),
    sent_channels TEXT[] DEFAULT '{}',
    
    -- Estado
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    action_url TEXT,
    action_text TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_title CHECK (char_length(title) > 0),
    CONSTRAINT valid_message CHECK (char_length(message) > 0),
    CONSTRAINT valid_channels CHECK (array_length(channels, 1) > 0)
);

-- =====================================================
-- 8. TABLA DE SESIONES DE USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Información de la sesión
    session_token TEXT NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    
    -- Estado de la sesión
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_session_token CHECK (char_length(session_token) > 0),
    CONSTRAINT valid_expires_at CHECK (expires_at > created_at)
);

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================
COMMENT ON TABLE users IS 'Información de usuarios registrados en Zecu';
COMMENT ON TABLE subscriptions IS 'Suscripciones de usuarios a planes de Zecu';
COMMENT ON TABLE message_analyses IS 'Análisis de mensajes de WhatsApp realizados por usuarios';
COMMENT ON TABLE feature_usage IS 'Uso de features por usuario con límites';
COMMENT ON TABLE system_logs IS 'Logs del sistema para auditoría y debugging';
COMMENT ON TABLE system_config IS 'Configuración del sistema';
COMMENT ON TABLE notifications IS 'Notificaciones enviadas a usuarios';
COMMENT ON TABLE user_sessions IS 'Sesiones activas de usuarios';




