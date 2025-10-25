import { NextRequest, NextResponse } from 'next/server';
import { polar, POLAR_PRODUCTS, getSuccessUrl, PolarPlan } from '@/lib/polar-config';
import { jwtVerify } from 'jose';
import { withPaymentRateLimit } from '@/lib/rate-limit-middleware';

// Verificar token de sesión
async function verifySessionToken(
  token: string
): Promise<{ userId: string; phone: string } | null> {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET no está configurado en las variables de entorno');
      return null;
    }

    const secret = new global.TextEncoder().encode(jwtSecret);

    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      phone: payload.phone as string,
    };
  } catch (error) {
    return null;
  }
}

// Handler original sin rate limiting
async function createCheckoutHandler(_request: NextRequest) {
  try {
    // Verificar autenticación
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado',
        },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesión inválida',
        },
        { status: 401 }
      );
    }

    // Obtener el plan y email del body
    const { plan, email } = await request.json();

    if (!plan || !['plus'].includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan inválido. Solo está disponible el plan Plus.',
        },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email es requerido',
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email inválido',
        },
        { status: 400 }
      );
    }

    const selectedPlan = POLAR_PRODUCTS[plan as PolarPlan];

    if (!selectedPlan.productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID no configurado para este plan',
        },
        { status: 500 }
      );
    }

    // Crear checkout session en Polar
    const checkout = await polar.checkouts.create({
      products: [selectedPlan.productId], // Array de Product IDs
      successUrl: getSuccessUrl('{CHECKOUT_ID}'),
      customerEmail: email.trim(), // Email real del usuario
      metadata: {
        userId: session.userId,
        phone: session.phone,
        plan: plan,
        email: email.trim(),
      },
    });

    console.warn(`✅ Checkout de Polar.sh creado para usuario ${session.userId} - Plan: ${plan}`);

    return NextResponse.json({
      success: true,
      checkoutId: checkout.id,
      checkoutUrl: checkout.url,
    });
  } catch (error: any) {
    // Usar el sistema de manejo de errores seguro
    return handleError(error, _request, undefined, 'PAYMENT_ERROR');
  }
}

// Exportar función POST con rate limiting aplicado
export const _POST = withPaymentRateLimit(createCheckoutHandler);
