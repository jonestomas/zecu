import { NextRequest, NextResponse } from 'next/server';
import { polar } from '@/lib/polar-config';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const checkoutId = request.nextUrl.searchParams.get('checkout_id');

    if (!checkoutId) {
      return NextResponse.json({
        success: false,
        error: 'Checkout ID no proporcionado'
      }, { status: 400 });
    }

    // Obtener información del checkout desde Polar
    const checkout = await polar.checkouts.custom.get({
      id: checkoutId
    });

    if (!checkout) {
      return NextResponse.json({
        success: false,
        error: 'Checkout no encontrado'
      }, { status: 404 });
    }

    // Verificar si el pago fue exitoso
    if (checkout.status !== 'confirmed') {
      return NextResponse.json({
        success: false,
        error: 'Pago no confirmado'
      }, { status: 400 });
    }

    // Extraer metadata
    const metadata = checkout.metadata as Record<string, any>;
    const userId = metadata?.userId;
    const plan = metadata?.plan;

    if (!userId || !plan) {
      return NextResponse.json({
        success: false,
        error: 'Metadata incompleta'
      }, { status: 400 });
    }

    // Actualizar el plan del usuario en Supabase
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Plan mensual

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        plan: plan,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error actualizando usuario:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Error actualizando el plan del usuario'
      }, { status: 500 });
    }

    console.log(`✅ Plan ${plan} activado para usuario ${userId} vía Polar.sh`);

    return NextResponse.json({
      success: true,
      plan: plan,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error: any) {
    console.error('Error verificando pago de Polar.sh:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

