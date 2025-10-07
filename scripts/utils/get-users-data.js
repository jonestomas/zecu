// Script para obtener toda la información de la tabla users
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguikxzntrotsrqrzwuh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlreHpudHJvdHNycXJ6d3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzY0MjYsImV4cCI6MjA3MzgxMjQyNn0.6v5WHxszVkaUXSm6kcEvBvk7XTRCZ9SrDib1pzPEJng'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getUsersData() {
  console.log('🔍 Obteniendo información de la tabla users...')
  
  try {
    // Obtener todos los usuarios
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener usuarios:', error.message)
      return
    }

    console.log(`\n📊 Total de usuarios encontrados: ${users.length}`)
    console.log('=' * 60)

    if (users.length === 0) {
      console.log('📭 No hay usuarios en la tabla')
      return
    }

    // Mostrar cada usuario
    users.forEach((user, index) => {
      console.log(`\n👤 Usuario ${index + 1}:`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   👤 Nombre: ${user.name || 'No especificado'}`)
      console.log(`   📱 Teléfono: ${user.phone || 'No especificado'}`)
      console.log(`   📊 Estado de suscripción: ${user.subscription_status}`)
      console.log(`   💎 Tipo de plan: ${user.plan_type}`)
      console.log(`   🏪 Cliente MercadoPago: ${user.mercadopago_customer_id || 'No asignado'}`)
      console.log(`   🔗 Suscripción MercadoPago: ${user.mercadopago_subscription_id || 'No asignada'}`)
      console.log(`   📅 Inicio suscripción: ${user.subscription_start_date || 'No especificado'}`)
      console.log(`   📅 Fin suscripción: ${user.subscription_end_date || 'No especificado'}`)
      console.log(`   🆓 Fin período prueba: ${user.trial_end_date || 'No especificado'}`)
      console.log(`   📝 Metadatos: ${JSON.stringify(user.metadata, null, 2)}`)
      console.log(`   🕐 Creado: ${user.created_at}`)
      console.log(`   🔄 Actualizado: ${user.updated_at}`)
      console.log(`   🔐 Último login: ${user.last_login || 'Nunca'}`)
      console.log('   ' + '-'.repeat(50))
    })

    // Resumen estadístico
    console.log('\n📈 Resumen estadístico:')
    const statusCounts = users.reduce((acc, user) => {
      acc[user.subscription_status] = (acc[user.subscription_status] || 0) + 1
      return acc
    }, {})
    
    const planCounts = users.reduce((acc, user) => {
      acc[user.plan_type] = (acc[user.plan_type] || 0) + 1
      return acc
    }, {})

    console.log('   Estados de suscripción:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     ${status}: ${count} usuarios`)
    })

    console.log('   Tipos de plan:')
    Object.entries(planCounts).forEach(([plan, count]) => {
      console.log(`     ${plan}: ${count} usuarios`)
    })

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

// Ejecutar consulta
getUsersData()
