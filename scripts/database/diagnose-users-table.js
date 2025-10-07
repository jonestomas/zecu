// Script para diagnosticar la tabla users
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguikxzntrotsrqrzwuh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlreHpudHJvdHNycXJ6d3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzY0MjYsImV4cCI6MjA3MzgxMjQyNn0.6v5WHxszVkaUXSm6kcEvBvk7XTRCZ9SrDib1pzPEJng'

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseUsersTable() {
  console.log('🔍 Diagnosticando tabla users...')
  
  try {
    // 1. Verificar si la tabla existe y es accesible
    console.log('\n1️⃣ Verificando acceso a la tabla...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Error de acceso:', testError.message)
      console.error('   Código:', testError.code)
      console.error('   Detalles:', testError.details)
      console.error('   Hint:', testError.hint)
      return
    }

    console.log('✅ Tabla accesible')

    // 2. Intentar obtener el conteo total
    console.log('\n2️⃣ Obteniendo conteo total...')
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error en conteo:', countError.message)
    } else {
      console.log(`📊 Total de registros: ${count}`)
    }

    // 3. Intentar obtener todos los usuarios
    console.log('\n3️⃣ Obteniendo todos los usuarios...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')

    if (usersError) {
      console.error('❌ Error al obtener usuarios:', usersError.message)
      console.error('   Código:', usersError.code)
      console.error('   Detalles:', usersError.details)
    } else {
      console.log(`✅ Usuarios obtenidos: ${users.length}`)
      
      if (users.length > 0) {
        console.log('\n📋 Datos de usuarios:')
        users.forEach((user, index) => {
          console.log(`\n👤 Usuario ${index + 1}:`)
          console.log(`   🆔 ID: ${user.id}`)
          console.log(`   📧 Email: ${user.email}`)
          console.log(`   👤 Nombre: ${user.name || 'No especificado'}`)
          console.log(`   📊 Estado: ${user.subscription_status}`)
          console.log(`   💎 Plan: ${user.plan_type}`)
          console.log(`   🕐 Creado: ${user.created_at}`)
        })
      }
    }

    // 4. Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas RLS...')
    const { data: rlsData, error: rlsError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users')

    if (rlsError) {
      console.log('ℹ️ No se pudo verificar RLS (normal con clave anónima)')
    } else {
      console.log(`📋 Políticas RLS encontradas: ${rlsData.length}`)
      rlsData.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`)
      })
    }

    // 5. Intentar insertar un usuario de prueba
    console.log('\n5️⃣ Intentando insertar usuario de prueba...')
    const testUser = {
      email: 'test.diagnostico@zecubot.com',
      name: 'Usuario Diagnóstico',
      subscription_status: 'active',
      plan_type: 'free',
      metadata: { test: true, created_by: 'diagnostic_script' }
    }

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()

    if (insertError) {
      console.error('❌ Error al insertar:', insertError.message)
      console.error('   Código:', insertError.code)
      console.error('   Detalles:', insertError.details)
    } else {
      console.log('✅ Usuario de prueba insertado exitosamente')
      console.log('   ID:', insertData[0].id)
      
      // Limpiar el usuario de prueba
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertData[0].id)
      
      if (deleteError) {
        console.log('⚠️ No se pudo eliminar el usuario de prueba')
      } else {
        console.log('🧹 Usuario de prueba eliminado')
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar diagnóstico
diagnoseUsersTable()
