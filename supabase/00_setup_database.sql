-- =====================================================
-- SCRIPT PRINCIPAL DE CONFIGURACIÓN - ZECU SUPABASE
-- =====================================================
-- Este script ejecuta todos los scripts de configuración
-- en el orden correcto para configurar la base de datos

-- =====================================================
-- INFORMACIÓN DEL SCRIPT
-- =====================================================
-- Versión: 1.0.0
-- Fecha: 2024-01-01
-- Descripción: Configuración completa de la base de datos Zecu
-- Autor: Zecu Team

-- =====================================================
-- VERIFICACIÓN DE PREREQUISITOS
-- =====================================================

-- Verificar que estamos en Supabase
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'La extensión uuid-ossp no está instalada. Instálala primero.';
    END IF;
    
    RAISE NOTICE 'Prerequisitos verificados correctamente';
END;
$$;

-- =====================================================
-- EJECUTAR SCRIPTS EN ORDEN
-- =====================================================

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

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    policy_count INTEGER;
    config_count INTEGER;
    user_count INTEGER;
BEGIN
    -- Contar tablas creadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'users', 'subscriptions', 'message_analyses', 
        'feature_usage', 'system_logs', 'system_config',
        'notifications', 'user_sessions', 'audit_log'
    );
    
    -- Contar funciones creadas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'create_user_with_subscription', 'activate_subscription',
        'check_usage_limits', 'record_feature_usage',
        'get_user_stats', 'cleanup_expired_data',
        'get_system_metrics', 'is_admin', 'current_user_id'
    );
    
    -- Contar triggers creados
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%update_%' OR trigger_name LIKE '%audit_%';
    
    -- Contar políticas RLS
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    -- Contar configuraciones
    SELECT COUNT(*) INTO config_count FROM system_config;
    
    -- Contar usuarios
    SELECT COUNT(*) INTO user_count FROM users;
    
    -- Mostrar resumen
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CONFIGURACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas creadas: %', table_count;
    RAISE NOTICE 'Funciones creadas: %', function_count;
    RAISE NOTICE 'Triggers creados: %', trigger_count;
    RAISE NOTICE 'Políticas RLS: %', policy_count;
    RAISE NOTICE 'Configuraciones: %', config_count;
    RAISE NOTICE 'Usuarios: %', user_count;
    RAISE NOTICE '========================================';
    
    -- Verificar que todo esté correcto
    IF table_count < 8 THEN
        RAISE EXCEPTION 'No se crearon todas las tablas necesarias';
    END IF;
    
    IF function_count < 8 THEN
        RAISE EXCEPTION 'No se crearon todas las funciones necesarias';
    END IF;
    
    IF policy_count < 20 THEN
        RAISE EXCEPTION 'No se crearon todas las políticas RLS necesarias';
    END IF;
    
    IF config_count < 20 THEN
        RAISE EXCEPTION 'No se creó la configuración inicial';
    END IF;
    
    RAISE NOTICE 'Base de datos Zecu configurada correctamente';
    RAISE NOTICE 'Puedes comenzar a usar el sistema';
    
END;
$$;

-- =====================================================
-- INSTRUCCIONES POST-INSTALACIÓN
-- =====================================================

-- Mostrar instrucciones importantes
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INSTRUCCIONES POST-INSTALACIÓN';
    RAISE NOTICE '========================================';
    RAISE NOTICE '1. Configura las variables de entorno en tu aplicación';
    RAISE NOTICE '2. Actualiza la configuración del administrador en system_config';
    RAISE NOTICE '3. Configura las integraciones (Mercado Pago, WhatsApp, n8n)';
    RAISE NOTICE '4. Configura las tareas programadas para limpieza automática';
    RAISE NOTICE '5. Revisa y ajusta las políticas RLS según tus necesidades';
    RAISE NOTICE '6. Configura el sistema de notificaciones';
    RAISE NOTICE '7. Realiza pruebas de integración';
    RAISE NOTICE '========================================';
END;
$$;




