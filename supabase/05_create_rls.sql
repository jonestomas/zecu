-- =====================================================
-- ROW LEVEL SECURITY (RLS) - ZECU
-- =====================================================
-- Este script configura la seguridad a nivel de fila
-- para proteger los datos de los usuarios

-- =====================================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PARA TABLA USERS
-- =====================================================

-- Los usuarios solo pueden ver y modificar sus propios datos
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND metadata->>'role' = 'admin'
        )
    );

-- Permitir inserción de nuevos usuarios (para registro)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 3. POLÍTICAS PARA TABLA SUBSCRIPTIONS
-- =====================================================

-- Los usuarios solo pueden ver sus propias suscripciones
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Los usuarios pueden actualizar sus propias suscripciones (limitado)
CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (
        auth.uid()::text = user_id::text
        AND status IN ('pending', 'active')
    );

-- Permitir inserción de nuevas suscripciones
CREATE POLICY "Allow subscription creation" ON subscriptions
    FOR INSERT WITH CHECK (true);

-- Los administradores pueden ver todas las suscripciones
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND metadata->>'role' = 'admin'
        )
    );

-- =====================================================
-- 4. POLÍTICAS PARA TABLA MESSAGE_ANALYSES
-- =====================================================

-- Los usuarios solo pueden ver sus propios análisis
CREATE POLICY "Users can view own analyses" ON message_analyses
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Los usuarios pueden insertar sus propios análisis
CREATE POLICY "Users can insert own analyses" ON message_analyses
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Los administradores pueden ver todos los análisis
CREATE POLICY "Admins can view all analyses" ON message_analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND metadata->>'role' = 'admin'
        )
    );

-- Permitir inserción desde el sistema (n8n, webhooks)
CREATE POLICY "Allow system analysis insertion" ON message_analyses
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 5. POLÍTICAS PARA TABLA FEATURE_USAGE
-- =====================================================

-- Los usuarios solo pueden ver su propio uso de features
CREATE POLICY "Users can view own feature usage" ON feature_usage
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Los usuarios pueden actualizar su propio uso de features
CREATE POLICY "Users can update own feature usage" ON feature_usage
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Permitir inserción de uso de features
CREATE POLICY "Allow feature usage insertion" ON feature_usage
    FOR INSERT WITH CHECK (true);

-- Los administradores pueden ver todo el uso de features
CREATE POLICY "Admins can view all feature usage" ON feature_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND metadata->>'role' = 'admin'
        )
    );

-- =====================================================
-- 6. POLÍTICAS PARA TABLA SYSTEM_LOGS
-- =====================================================

-- Los usuarios solo pueden ver logs relacionados con ellos
CREATE POLICY "Users can view own logs" ON system_logs
    FOR SELECT USING (
        auth.uid()::text = user_id::text
        OR user_id IS NULL
    );

-- Solo el sistema puede insertar logs
CREATE POLICY "Allow system log insertion" ON system_logs
    FOR INSERT WITH CHECK (true);

-- Los administradores pueden ver todos los logs
CREATE POLICY "Admins can view all logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND metadata->>'role' = 'admin'
        )
    );

-- =====================================================
-- 7. POLÍTICAS PARA TABLA SYSTEM_CONFIG
-- =====================================================

-- Solo los administradores pueden ver y modificar la configuración
CREATE POLICY "Admins can manage system config" ON system_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND metadata->>'role' = 'admin'
        )
    );

-- Permitir lectura de configuraciones públicas
CREATE POLICY "Public config readable" ON system_config
    FOR SELECT USING (is_public = true);

-- =====================================================
-- 8. POLÍTICAS PARA TABLA NOTIFICATIONS
-- =====================================================

-- Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Los usuarios pueden marcar sus notificaciones como leídas
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Permitir inserción de notificaciones
CREATE POLICY "Allow notification insertion" ON notifications
    FOR INSERT WITH CHECK (true);

-- Los administradores pueden ver todas las notificaciones
CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND metadata->>'role' = 'admin'
        )
    );

-- =====================================================
-- 9. POLÍTICAS PARA TABLA USER_SESSIONS
-- =====================================================

-- Los usuarios solo pueden ver sus propias sesiones
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Los usuarios pueden actualizar sus propias sesiones
CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Permitir inserción de sesiones
CREATE POLICY "Allow session creation" ON user_sessions
    FOR INSERT WITH CHECK (true);

-- Los administradores pueden ver todas las sesiones
CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND metadata->>'role' = 'admin'
        )
    );

-- =====================================================
-- 10. FUNCIONES AUXILIARES PARA RLS
-- =====================================================

-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id::text = auth.uid()::text
        AND metadata->>'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario puede acceder a un recurso
CREATE OR REPLACE FUNCTION can_access_resource(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- El usuario puede acceder a sus propios recursos
    IF resource_user_id = auth.uid() THEN
        RETURN TRUE;
    END IF;
    
    -- Los administradores pueden acceder a todos los recursos
    IF is_admin() THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. POLÍTICAS ADICIONALES PARA SEGURIDAD
-- =====================================================

-- Política para prevenir eliminación accidental de usuarios
CREATE POLICY "Prevent user deletion" ON users
    FOR DELETE USING (false);

-- Política para prevenir eliminación de suscripciones activas
CREATE POLICY "Prevent active subscription deletion" ON subscriptions
    FOR DELETE USING (status = 'cancelled');

-- Política para prevenir eliminación de análisis
CREATE POLICY "Prevent analysis deletion" ON message_analyses
    FOR DELETE USING (false);

-- Política para prevenir eliminación de logs
CREATE POLICY "Prevent log deletion" ON system_logs
    FOR DELETE USING (false);

-- =====================================================
-- 12. CONFIGURACIÓN DE AUDITORÍA
-- =====================================================

-- Habilitar auditoría para tablas críticas
-- (Esto requiere la extensión pgaudit si está disponible)

-- Crear tabla de auditoría personalizada
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para registrar cambios de auditoría
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        old_values,
        new_values,
        user_id,
        ip_address,
        user_agent
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid(),
        inet_client_addr(),
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_subscriptions
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- COMENTARIOS EN RLS
-- =====================================================
COMMENT ON POLICY "Users can view own data" ON users IS 'Los usuarios solo pueden ver sus propios datos';
COMMENT ON POLICY "Admins can view all users" ON users IS 'Los administradores pueden ver todos los usuarios';
COMMENT ON POLICY "Users can view own subscriptions" ON subscriptions IS 'Los usuarios solo pueden ver sus propias suscripciones';
COMMENT ON POLICY "Users can view own analyses" ON message_analyses IS 'Los usuarios solo pueden ver sus propios análisis';
COMMENT ON FUNCTION is_admin() IS 'Verifica si el usuario actual es administrador';
COMMENT ON FUNCTION current_user_id() IS 'Obtiene el ID del usuario actual';
COMMENT ON FUNCTION can_access_resource(UUID) IS 'Verifica si un usuario puede acceder a un recurso';




