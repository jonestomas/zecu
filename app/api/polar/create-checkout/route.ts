import { NextRequest, NextResponse } from 'next/server';
import { polar, POLAR_PRODUCTS, getSuccessUrl, PolarPlan } from '@/lib/polar-config';
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
    // Verificar autenticación
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

    // Obtener el plan del body
    const { plan } = await request.json();

    if (!plan || plan !== 'plus') {
      return NextResponse.json({
        success: false,
        error: 'Plan inválido. Solo está disponible el plan Plus.'
      }, { status: 400 });
    }

    const selectedPlan = POLAR_PRODUCTS[plan as PolarPlan];

    if (!selectedPlan.priceId) {
      return NextResponse.json({
        success: false,
        error: 'Price ID no configurado para este plan'
      }, { status: 500 });
    }

    // Crear checkout session en Polar
    const checkout = await polar.checkouts.create({
      productPriceId: selectedPlan.priceId,
      successUrl: getSuccessUrl('{CHECKOUT_ID}'),
      customerEmail: session.phone + '@zecu.app', // Usar phone como identificador único
      metadata: {
        userId: session.userId,
        phone: session.phone,
        plan: plan
      }
    });

    console.log(`✅ Checkout de Polar.sh creado para usuario ${session.userId} - Plan: ${plan}`);

    return NextResponse.json({
      success: true,
      checkoutId: checkout.id,
      checkoutUrl: checkout.url
    });

  } catch (error: any) {
    console.error('Error creando checkout de Polar.sh:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}
