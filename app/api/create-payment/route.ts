import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const { planId, userEmail } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID es requerido' },
        { status: 400 }
      );
    }

    // Validar que el plan sea básico o premium (no free)
    if (!['basic', 'premium'].includes(planId)) {
      return NextResponse.json(
        { error: 'Plan no válido para pago' },
        { status: 400 }
      );
    }

    const preference = await createPaymentPreference(planId, userEmail);

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point
    });

  } catch (error) {
    console.error('Error creating payment preference:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
