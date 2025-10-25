import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase-client';
import { polar } from '@/lib/polar-config';

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
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'No autenticado'
      }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Sesión inválida'
      }, { status: 401 });
    }

    // Obtener información del usuario para encontrar la suscripción de Polar
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, plan, polar_subscription_id')
      .eq('id', session.userId)
      .single();

    if (userError) {
      console.error('Error obteniendo usuario:', userError);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener información del usuario'
      }, { status: 500 });
    }

    // Cancelar suscripción en Polar.sh si existe
    if (user.polar_subscription_id) {
      try {
        console.log(`🔄 Cancelando suscripción en Polar.sh: ${user.polar_subscription_id}`);
        
        await polar.subscriptions.cancel({
          id: user.polar_subscription_id
        });
        
        console.log(`✅ Suscripción cancelada en Polar.sh: ${user.polar_subscription_id}`);
      } catch (polarError) {
        console.error('Error cancelando en Polar.sh:', polarError);
        // Continuamos con la cancelación local aunque falle Polar.sh
      }
    }

    // Actualizar usuario a plan free
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        plan: 'free',
        plan_expires_at: null,
        polar_subscription_id: null, // Limpiar ID de suscripción
        // Mantener el contador de consultas del mes actual
        // Solo cambiamos el plan
      })
      .eq('id', session.userId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelando suscripción:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al cancelar la suscripción'
      }, { status: 500 });
    }

    console.log(`✅ Suscripción cancelada completamente para usuario ${session.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      newPlan: 'free'
    });

  } catch (error) {
    console.error('Error en cancel-subscription:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
