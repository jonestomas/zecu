// Script para crear usuario de prueba en Supabase
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pguikxzntrotsrqrzwuh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlreHpudHJvdHNycXJ6d3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzY0MjYsImV4cCI6MjA3MzgxMjQyNn0.6v5WHxszVkaUXSm6kcEvBvk7XTRCZ9SrDib1pzPEJng'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: 'usuario.prueba@zecubot.com',
          name: 'Usuario de Prueba',
          phone: '+1234567890',
          subscription_status: 'active',
          plan_type: 'free',
          subscription_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días desde ahora
          metadata: {
            source: 'test',
            created_by: 'admin',
            notes: 'Usuario de prueba para testing'
          }
        }
      ])
      .select()

    if (error) {
      console.error('Error creando usuario:', error)
      return
    }

    console.log('✅ Usuario de prueba creado exitosamente:')
    console.log(JSON.stringify(data[0], null, 2))
  } catch (error) {
    console.error('Error:', error)
  }
}

// Ejecutar el script
createTestUser()
