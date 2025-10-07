// Script para arreglar las políticas RLS de la tabla users
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguikxzntrotsrqrzwuh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlreHpudHJvdHNycXJ6d3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzY0MjYsImV4cCI6MjA3MzgxMjQyNn0.6v5WHxszVkaUXSm6kcEvBvk7XTRCZ9SrDib1pzPEJng'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUsersRLS() {
  console.log('🔧 Arreglando políticas RLS para la tabla users...')
  
  try {
    // 1. Verificar estado actual de RLS
    console.log('\n1️⃣ Verificando estado actual de RLS...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_table_rls_status', { table_name: 'users' })

    if (rlsError) {
      console.log('ℹ️ No se pudo verificar RLS directamente')
    } else {
      console.log('📊 Estado RLS:', rlsStatus)
    }

    // 2. Intentar deshabilitar RLS temporalmente
    console.log('\n2️⃣ Intentando deshabilitar RLS...')
    const { error: disableError } = await supabase
      .rpc('disable_rls', { table_name: 'users' })

    if (disableError) {
      console.log('⚠️ No se pudo deshabilitar RLS (requiere permisos de admin)')
      console.log('   Error:', disableError.message)
    } else {
      console.log('✅ RLS deshabilitado temporalmente')
    }

    // 3. Crear políticas RLS permisivas
    console.log('\n3️⃣ Creando políticas RLS permisivas...')
    
    // Política para SELECT (lectura)
    const { error: selectPolicyError } = await supabase
      .rpc('create_policy', {
        table_name: 'users',
        policy_name: 'allow_all_select',
        command: 'SELECT',
        definition: 'true',
        check_expression: 'true'
      })

    if (selectPolicyError) {
      console.log('⚠️ No se pudo crear política SELECT:', selectPolicyError.message)
    } else {
      console.log('✅ Política SELECT creada')
    }

    // Política para INSERT (inserción)
    const { error: insertPolicyError } = await supabase
      .rpc('create_policy', {
        table_name: 'users',
        policy_name: 'allow_all_insert',
        command: 'INSERT',
        definition: 'true',
        check_expression: 'true'
      })

    if (insertPolicyError) {
      console.log('⚠️ No se pudo crear política INSERT:', insertPolicyError.message)
    } else {
      console.log('✅ Política INSERT creada')
    }

    // Política para UPDATE (actualización)
    const { error: updatePolicyError } = await supabase
      .rpc('create_policy', {
        table_name: 'users',
        policy_name: 'allow_all_update',
        command: 'UPDATE',
        definition: 'true',
        check_expression: 'true'
      })

    if (updatePolicyError) {
      console.log('⚠️ No se pudo crear política UPDATE:', updatePolicyError.message)
    } else {
      console.log('✅ Política UPDATE creada')
    }

    // Política para DELETE (eliminación)
    const { error: deletePolicyError } = await supabase
      .rpc('create_policy', {
        table_name: 'users',
        policy_name: 'allow_all_delete',
        command: 'DELETE',
        definition: 'true',
        check_expression: 'true'
      })

    if (deletePolicyError) {
      console.log('⚠️ No se pudo crear política DELETE:', deletePolicyError.message)
    } else {
      console.log('✅ Política DELETE creada')
    }

    // 4. Probar inserción después de crear políticas
    console.log('\n4️⃣ Probando inserción después de crear políticas...')
    const testUser = {
      email: 'test.rls.fix@zecubot.com',
      name: 'Usuario RLS Fix',
      subscription_status: 'active',
      plan_type: 'free',
      metadata: { test: true, created_by: 'rls_fix_script' }
    }

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()

    if (insertError) {
      console.error('❌ Error al insertar después de crear políticas:', insertError.message)
      console.error('   Código:', insertError.code)
    } else {
      console.log('✅ Usuario insertado exitosamente después de crear políticas')
      console.log('   ID:', insertData[0].id)
      
      // Limpiar
      await supabase
        .from('users')
        .delete()
        .eq('id', insertData[0].id)
      
      console.log('🧹 Usuario de prueba eliminado')
    }

    // 5. Mostrar instrucciones manuales
    console.log('\n📋 INSTRUCCIONES MANUALES:')
    console.log('Si las políticas automáticas no funcionaron, ejecuta esto en el SQL Editor de Supabase:')
    console.log(`
-- Deshabilitar RLS temporalmente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- O crear políticas permisivas
CREATE POLICY "Allow all operations" ON users
FOR ALL USING (true) WITH CHECK (true);

-- Habilitar RLS con las nuevas políticas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    `)

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar arreglo de RLS
fixUsersRLS()
