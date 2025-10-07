import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, createSession } from '@/lib/auth-passwordless';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email y código son requeridos' },
        { status: 400 }
      );
    }

    const result = await verifyOTP(email, otp);

    if (!result.success || !result.userId) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Obtener datos completos del usuario
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', result.userId)
      .single();

    // Crear sesión
    const sessionToken = createSession(result.userId, email);

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      message: 'Acceso exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan_type: user.plan_type,
        subscription_status: user.subscription_status
      }
    });

    // Establecer cookie de sesión
    response.cookies.set('auth_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

    return response;

  } catch (error) {
    console.error('Error en verify-otp:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
