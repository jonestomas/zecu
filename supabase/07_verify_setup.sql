-- =====================================================
-- SCRIPT DE VERIFICACIÓN - ZECU SUPABASE
-- =====================================================
-- Este script verifica que la configuración de la base de datos
-- esté completa y funcionando correctamente

-- =====================================================
-- 1. VERIFICAR TABLAS
-- =====================================================

DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'users', 'subscriptions', 'message_analyses', 
        'feature_usage', 'system_logs', 'system_config',
        'notifications', 'user_sessions', 'audit_log'
    ];
    actual_tables TEXT[];
    missing_tables TEXT[];
    i TEXT;
BEGIN
    -- Obtener tablas existentes
    SELECT ARRAY_AGG(table_name ORDER BY table_name) INTO actual_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = ANY(expected_tables);
    
    -- Encontrar tablas faltantes
    missing_tables := expected_tables - actual_tables;
    
    RAISE NOTICE '=== VERIFICACIÓN DE TABLAS ===';
    RAISE NOTICE 'Tablas esperadas: %', array_length(expected_tables, 1);
    RAISE NOTICE 'Tablas encontradas: %', array_length(actual_tables, 1);
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Tablas faltantes: %', array_to_string(missing_tables, ', ');
        RAISE EXCEPTION 'Faltan tablas en la configuración';
    ELSE
        RAISE NOTICE '✅ Todas las tablas están presentes';
    END IF;
END;
$$;

-- =====================================================
-- 2. VERIFICAR ÍNDICES
-- =====================================================

DO $$
DECLARE
    expected_indexes INTEGER := 50; -- Número aproximado de índices esperados
    actual_indexes INTEGER;
BEGIN
    SELECT COUNT(*) INTO actual_indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE '=== VERIFICACIÓN DE ÍNDICES ===';
    RAISE NOTICE 'Índices esperados: ~%', expected_indexes;
    RAISE NOTICE 'Índices encontrados: %', actual_indexes;
    
    IF actual_indexes < expected_indexes * 0.8 THEN
        RAISE EXCEPTION 'Faltan índices importantes en la configuración';
    ELSE
        RAISE NOTICE '✅ Índices configurados correctamente';
    END IF;
END;
$$;

-- =====================================================
-- 3. VERIFICAR FUNCIONES
-- =====================================================

DO $$
DECLARE
    expected_functions TEXT[] := ARRAY[
        'create_user_with_subscription', 'activate_subscription',
        'check_usage_limits', 'record_feature_usage',
        'get_user_stats', 'cleanup_expired_data',
        'get_system_metrics', 'is_admin', 'current_user_id',
        'can_access_resource', 'update_updated_at_column'
    ];
    actual_functions TEXT[];
    missing_functions TEXT[];
BEGIN
    -- Obtener funciones existentes
    SELECT ARRAY_AGG(routine_name ORDER BY routine_name) INTO actual_functions
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = ANY(expected_functions);
    
    -- Encontrar funciones faltantes
    missing_functions := expected_functions - actual_functions;
    
    RAISE NOTICE '=== VERIFICACIÓN DE FUNCIONES ===';
    RAISE NOTICE 'Funciones esperadas: %', array_length(expected_functions, 1);
    RAISE NOTICE 'Funciones encontradas: %', array_length(actual_functions, 1);
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE NOTICE 'Funciones faltantes: %', array_to_string(missing_functions, ', ');
        RAISE EXCEPTION 'Faltan funciones importantes en la configuración';
    ELSE
        RAISE NOTICE '✅ Todas las funciones están presentes';
    END IF;
END;
$$;

-- =====================================================
-- 4. VERIFICAR TRIGGERS
-- =====================================================

DO $$
DECLARE
    expected_triggers INTEGER := 15; -- Número aproximado de triggers esperados
    actual_triggers INTEGER;
BEGIN
    SELECT COUNT(*) INTO actual_triggers
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND (trigger_name LIKE 'update_%' OR trigger_name LIKE 'audit_%' OR trigger_name LIKE 'auto_%');
    
    RAISE NOTICE '=== VERIFICACIÓN DE TRIGGERS ===';
    RAISE NOTICE 'Triggers esperados: ~%', expected_triggers;
    RAISE NOTICE 'Triggers encontrados: %', actual_triggers;
    
    IF actual_triggers < expected_triggers * 0.8 THEN
        RAISE EXCEPTION 'Faltan triggers importantes en la configuración';
    ELSE
        RAISE NOTICE '✅ Triggers configurados correctamente';
    END IF;
END;
$$;

-- =====================================================
-- 5. VERIFICAR POLÍTICAS RLS
-- =====================================================

DO $$
DECLARE
    expected_policies INTEGER := 25; -- Número aproximado de políticas esperadas
    actual_policies INTEGER;
    tables_with_rls INTEGER;
    total_tables INTEGER;
BEGIN
    -- Contar políticas
    SELECT COUNT(*) INTO actual_policies
    FROM pg_policies
    WHERE schemaname = 'public';
    
    -- Contar tablas con RLS habilitado
    SELECT COUNT(*) INTO tables_with_rls
    FROM pg_class
    WHERE relrowsecurity = true
    AND relkind = 'r'
    AND schemaname = 'public';
    
    -- Contar tablas totales
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'users', 'subscriptions', 'message_analyses', 
        'feature_usage', 'system_logs', 'notifications', 'user_sessions'
    );
    
    RAISE NOTICE '=== VERIFICACIÓN DE RLS ===';
    RAISE NOTICE 'Políticas esperadas: ~%', expected_policies;
    RAISE NOTICE 'Políticas encontradas: %', actual_policies;
    RAISE NOTICE 'Tablas con RLS: %/%', tables_with_rls, total_tables;
    
    IF actual_policies < expected_policies * 0.8 THEN
        RAISE EXCEPTION 'Faltan políticas RLS importantes';
    END IF;
    
    IF tables_with_rls < total_tables THEN
        RAISE EXCEPTION 'No todas las tablas tienen RLS habilitado';
    END IF;
    
    RAISE NOTICE '✅ RLS configurado correctamente';
END;
$$;

-- =====================================================
-- 6. VERIFICAR CONFIGURACIÓN INICIAL
-- =====================================================

DO $$
DECLARE
    config_count INTEGER;
    admin_count INTEGER;
    test_user_count INTEGER;
    expected_configs INTEGER := 20;
BEGIN
    -- Contar configuraciones
    SELECT COUNT(*) INTO config_count FROM system_config;
    
    -- Contar administradores
    SELECT COUNT(*) INTO admin_count 
    FROM users 
    WHERE metadata->>'role' = 'admin';
    
    -- Contar usuarios de prueba
    SELECT COUNT(*) INTO test_user_count 
    FROM users 
    WHERE metadata->>'test_user' = 'true';
    
    RAISE NOTICE '=== VERIFICACIÓN DE CONFIGURACIÓN ===';
    RAISE NOTICE 'Configuraciones: %/%', config_count, expected_configs;
    RAISE NOTICE 'Administradores: %', admin_count;
    RAISE NOTICE 'Usuarios de prueba: %', test_user_count;
    
    IF config_count < expected_configs THEN
        RAISE EXCEPTION 'Falta configuración inicial del sistema';
    END IF;
    
    IF admin_count = 0 THEN
        RAISE EXCEPTION 'No se creó usuario administrador';
    END IF;
    
    RAISE NOTICE '✅ Configuración inicial completa';
END;
$$;

-- =====================================================
-- 7. VERIFICAR VISTAS
-- =====================================================

DO $$
DECLARE
    expected_views TEXT[] := ARRAY[
        'user_stats_view', 'system_metrics_view', 'expiring_subscriptions_view'
    ];
    actual_views TEXT[];
    missing_views TEXT[];
BEGIN
    -- Obtener vistas existentes
    SELECT ARRAY_AGG(table_name ORDER BY table_name) INTO actual_views
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = ANY(expected_views);
    
    -- Encontrar vistas faltantes
    missing_views := expected_views - actual_views;
    
    RAISE NOTICE '=== VERIFICACIÓN DE VISTAS ===';
    RAISE NOTICE 'Vistas esperadas: %', array_length(expected_views, 1);
    RAISE NOTICE 'Vistas encontradas: %', array_length(actual_views, 1);
    
    IF array_length(missing_views, 1) > 0 THEN
        RAISE NOTICE 'Vistas faltantes: %', array_to_string(missing_views, ', ');
        RAISE EXCEPTION 'Faltan vistas importantes';
    ELSE
        RAISE NOTICE '✅ Todas las vistas están presentes';
    END IF;
END;
$$;

-- =====================================================
-- 8. PRUEBAS FUNCIONALES
-- =====================================================

DO $$
DECLARE
    test_user_id UUID;
    test_subscription_id UUID;
    test_result RECORD;
BEGIN
    RAISE NOTICE '=== PRUEBAS FUNCIONALES ===';
    
    -- Probar creación de usuario
    BEGIN
        SELECT * INTO test_result
        FROM create_user_with_subscription(
            '+5491199999999',
            'test@verification.com',
            'Test',
            'Verification',
            'free',
            'test'
        );
        
        test_user_id := test_result.user_id;
        test_subscription_id := test_result.subscription_id;
        
        RAISE NOTICE '✅ Creación de usuario: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error en creación de usuario: %', SQLERRM;
    END;
    
    -- Probar activación de suscripción
    BEGIN
        SELECT * INTO test_result
        FROM activate_subscription(test_subscription_id);
        
        IF NOT test_result.success THEN
            RAISE EXCEPTION 'Error en activación de suscripción: %', test_result.message;
        END IF;
        
        RAISE NOTICE '✅ Activación de suscripción: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error en activación: %', SQLERRM;
    END;
    
    -- Probar verificación de límites
    BEGIN
        SELECT * INTO test_result
        FROM check_usage_limits(test_user_id, 'message_analysis');
        
        IF NOT test_result.can_use THEN
            RAISE EXCEPTION 'Error en verificación de límites';
        END IF;
        
        RAISE NOTICE '✅ Verificación de límites: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error en verificación de límites: %', SQLERRM;
    END;
    
    -- Probar registro de uso
    BEGIN
        SELECT * INTO test_result
        FROM record_feature_usage(test_user_id, 'message_analysis');
        
        IF NOT test_result.success THEN
            RAISE EXCEPTION 'Error en registro de uso: %', test_result.message;
        END IF;
        
        RAISE NOTICE '✅ Registro de uso: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error en registro de uso: %', SQLERRM;
    END;
    
    -- Probar estadísticas de usuario
    BEGIN
        SELECT * INTO test_result
        FROM get_user_stats(test_user_id);
        
        RAISE NOTICE '✅ Estadísticas de usuario: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error en estadísticas: %', SQLERRM;
    END;
    
    -- Probar métricas del sistema
    BEGIN
        SELECT * INTO test_result
        FROM get_system_metrics(7);
        
        RAISE NOTICE '✅ Métricas del sistema: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error en métricas: %', SQLERRM;
    END;
    
    -- Limpiar datos de prueba
    DELETE FROM users WHERE id = test_user_id;
    
    RAISE NOTICE '✅ Pruebas funcionales completadas';
END;
$$;

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Todas las tablas están presentes';
    RAISE NOTICE '✅ Índices configurados correctamente';
    RAISE NOTICE '✅ Funciones funcionando correctamente';
    RAISE NOTICE '✅ Triggers configurados correctamente';
    RAISE NOTICE '✅ RLS configurado correctamente';
    RAISE NOTICE '✅ Configuración inicial completa';
    RAISE NOTICE '✅ Vistas funcionando correctamente';
    RAISE NOTICE '✅ Pruebas funcionales exitosas';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'La base de datos Zecu está lista para usar';
    RAISE NOTICE '========================================';
END;
$$;




