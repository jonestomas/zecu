import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { email, name, whatsappNumber } = await request.json();

    // Validar datos requeridos
    if (!email || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Email y número de WhatsApp son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, plan_type')
      .or(`email.eq.${email},metadata->>whatsapp_number.eq.${whatsappNumber}`)
      .single();

    if (existingUser && !checkError) {
      return NextResponse.json({
        success: true,
        message: 'Usuario ya registrado',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          plan_type: existingUser.plan_type
        }
      });
    }

    // Crear nuevo usuario con plan gratuito
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          name: name || null,
          phone: whatsappNumber,
          subscription_status: 'active',
          plan_type: 'free',
          subscription_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
          metadata: {
            whatsapp_number: whatsappNumber,
            source: 'api_register',
            created_at: new Date().toISOString()
          }
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error al crear usuario:', insertError);
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    // Enviar notificación a N8N (opcional)
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'user_registered',
            user_id: newUser.id,
            email: newUser.email,
            plan_type: newUser.plan_type,
            whatsapp_number: whatsappNumber
          })
        });
      } catch (n8nError) {
        console.warn('Error al notificar a N8N:', n8nError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        plan_type: newUser.plan_type,
        subscription_status: newUser.subscription_status
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
