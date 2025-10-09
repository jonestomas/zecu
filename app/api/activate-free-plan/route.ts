import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { jwtVerify } from 'jose';

// Verificar token de sesión
async function verifySessionToken(token: string): Promise<{ userId: string; phone: string } | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      phone: payload.phone as string
    };
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar sesión
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado'
        },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesión inválida'
        },
        { status: 401 }
      );
    }

    // Obtener usuario actual
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single();

    if (fetchError || !currentUser) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que no tenga ya un plan Plus activo
    if (currentUser.plan === 'plus' && currentUser.plan_expires_at) {
      const expiresAt = new Date(currentUser.plan_expires_at);
      if (expiresAt > new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya tienes un plan Plus activo. No puedes activar el plan Free.'
          },
          { status: 400 }
        );
      }
    }

    // Activar plan Free
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ 
        plan: 'free',
        plan_expires_at: null // El plan free no expira
      })
      .eq('id', session.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`✅ Plan Free activado para usuario: ${session.phone} (${session.userId})`);

    return NextResponse.json({
      success: true,
      message: 'Plan Free activado exitosamente',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        country: user.country,
        city: user.city,
        plan: user.plan,
        plan_expires_at: user.plan_expires_at
      }
    });

  } catch (error) {
    console.error('Error en activate-free-plan:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}

