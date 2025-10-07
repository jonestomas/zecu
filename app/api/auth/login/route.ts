import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { email, whatsappNumber } = await request.json();

    // Validar datos requeridos
    if (!email && !whatsappNumber) {
      return NextResponse.json(
        { error: 'Email o número de WhatsApp es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario por email o WhatsApp
    const { data: user, error: searchError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},metadata->>whatsapp_number.eq.${whatsappNumber}`)
      .single();

    if (searchError || !user) {
      return NextResponse.json(
        { 
          error: 'Usuario no encontrado',
          suggestion: 'Regístrate primero en /api/auth/register'
        },
        { status: 404 }
      );
    }

    // Actualizar último login
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.warn('Error al actualizar último login:', updateError);
    }

    // Verificar si la suscripción está activa
    const isActive = user.subscription_status === 'active';
    const isExpired = user.subscription_end_date && new Date() > new Date(user.subscription_end_date);

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan_type: user.plan_type,
        subscription_status: user.subscription_status,
        is_active: isActive && !isExpired,
        is_expired: isExpired,
        trial_end_date: user.trial_end_date,
        subscription_end_date: user.subscription_end_date
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
