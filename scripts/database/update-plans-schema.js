// Script para actualizar el esquema de planes en la base de datos
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguikxzntrotsrqrzwuh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlreHpudHJvdHNycXJ6d3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzY0MjYsImV4cCI6MjA3MzgxMjQyNn0.6v5WHxszVkaUXSm6kcEvBvk7XTRCZ9SrDib1pzPEJng'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updatePlansSchema() {
  console.log('🔄 Actualizando esquema de planes a Free y Plus...')
  
  try {
    // 1. Actualizar constraint de plan_type
    console.log('\n1️⃣ Actualizando constraint de plan_type...')
    
    // Primero eliminar el constraint existente
    const { error: dropConstraintError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE users 
          DROP CONSTRAINT IF EXISTS users_plan_type_check;
        `
      })

    if (dropConstraintError) {
      console.log('⚠️ No se pudo eliminar constraint (normal si no existe):', dropConstraintError.message)
    } else {
      console.log('✅ Constraint anterior eliminado')
    }

    // Crear nuevo constraint con solo free y plus
    const { error: addConstraintError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE users 
          ADD CONSTRAINT users_plan_type_check 
          CHECK (plan_type IN ('free', 'plus'));
        `
      })

    if (addConstraintError) {
      console.log('⚠️ No se pudo crear nuevo constraint:', addConstraintError.message)
    } else {
      console.log('✅ Nuevo constraint creado (free, plus)')
    }

    // 2. Actualizar constraint de subscription_status
    console.log('\n2️⃣ Verificando constraint de subscription_status...')
    
    const { error: statusConstraintError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE users 
          DROP CONSTRAINT IF EXISTS users_subscription_status_check;
        `
      })

    if (statusConstraintError) {
      console.log('⚠️ No se pudo eliminar constraint de status:', statusConstraintError.message)
    }

    const { error: addStatusConstraintError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE users 
          ADD CONSTRAINT users_subscription_status_check 
          CHECK (subscription_status IN ('active', 'inactive', 'pending', 'cancelled', 'expired'));
        `
      })

    if (addStatusConstraintError) {
      console.log('⚠️ No se pudo crear constraint de status:', addStatusConstraintError.message)
    } else {
      console.log('✅ Constraint de status actualizado')
    }

    // 3. Actualizar valores por defecto
    console.log('\n3️⃣ Actualizando valores por defecto...')
    
    const { error: updateDefaultsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE users 
          ALTER COLUMN plan_type SET DEFAULT 'free';
        `
      })

    if (updateDefaultsError) {
      console.log('⚠️ No se pudo actualizar default:', updateDefaultsError.message)
    } else {
      console.log('✅ Valor por defecto actualizado a "free"')
    }

    // 4. Verificar estructura actual
    console.log('\n4️⃣ Verificando estructura actual...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default, is_nullable')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')
      .in('column_name', ['plan_type', 'subscription_status'])

    if (columnsError) {
      console.error('❌ Error al verificar columnas:', columnsError.message)
    } else {
      console.log('📋 Columnas actualizadas:')
      columns.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (default: ${col.column_default})`)
      })
    }

    // 5. Crear usuario de prueba con nuevo esquema
    console.log('\n5️⃣ Creando usuario de prueba con nuevo esquema...')
    
    const testUser = {
      email: 'test.plans@zecubot.com',
      name: 'Usuario Test Plans',
      subscription_status: 'active',
      plan_type: 'plus',
      metadata: { 
        test: true, 
        created_by: 'plans_update_script',
        plan_features: ['chat_ilimitado', 'soporte_prioritario']
      }
    }

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()

    if (insertError) {
      console.error('❌ Error al insertar usuario de prueba:', insertError.message)
    } else {
      console.log('✅ Usuario de prueba creado exitosamente')
      console.log('   ID:', insertData[0].id)
      console.log('   Plan:', insertData[0].plan_type)
      console.log('   Status:', insertData[0].subscription_status)
      
      // Limpiar usuario de prueba
      await supabase
        .from('users')
        .delete()
        .eq('id', insertData[0].id)
      
      console.log('🧹 Usuario de prueba eliminado')
    }

    console.log('\n🎉 Esquema de planes actualizado exitosamente!')
    console.log('\n📋 Planes disponibles:')
    console.log('   🆓 Free: Plan gratuito con limitaciones básicas')
    console.log('   ⭐ Plus: Plan premium con funcionalidades avanzadas')
    console.log('   🔮 Premium: TBD (To Be Determined)')

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar actualización
updatePlansSchema()
