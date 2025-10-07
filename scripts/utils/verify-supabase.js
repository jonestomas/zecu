// Script para verificar la conectividad con Supabase
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguikxzntrotsrqrzwuh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlreHpudHJvdHNycXJ6d3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzY0MjYsImV4cCI6MjA3MzgxMjQyNn0.6v5WHxszVkaUXSm6kcEvBvk7XTRCZ9SrDib1pzPEJng'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySupabaseConnection() {
  console.log('🔍 Verificando conexión con Supabase...')
  console.log('📡 URL:', supabaseUrl)
  
  try {
    // Verificar conexión básica consultando la tabla users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (usersError) {
      console.error('❌ Error al conectar con Supabase:', usersError.message)
      return false
    }

    console.log('✅ Conexión exitosa con Supabase')

    // Verificar tabla de usuarios
    const { data: usersData, error: usersDataError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    if (usersDataError) {
      console.error('❌ Error al consultar tabla users:', usersDataError.message)
      return false
    }

    console.log('✅ Tabla users accesible')
    console.log('👥 Usuarios encontrados:', usersData.length)
    
    if (usersData.length > 0) {
      console.log('📄 Primer usuario:', {
        id: usersData[0].id,
        email: usersData[0].email,
        name: usersData[0].name,
        plan_type: usersData[0].plan_type
      })
    }

    return true

  } catch (error) {
    console.error('❌ Error general:', error.message)
    return false
  }
}

// Ejecutar verificación
verifySupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Supabase está funcionando correctamente')
    } else {
      console.log('\n💥 Hay problemas con la conexión a Supabase')
    }
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error)
  })
