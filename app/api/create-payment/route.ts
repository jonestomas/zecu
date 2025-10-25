import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/mercadopago';
import { jwtVerify } from 'jose';
import { getUserByPhone } from '@/lib/supabase-client';

// Verificar token JWT de sesión
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

export async function POST(_request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No estás autenticado. Por favor inicia sesión.' },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada. Por favor inicia sesión nuevamente.' },
        { status: 401 }
      );
    }

    // 2. Obtener datos del usuario
    const user = await getUserByPhone(session.phone);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    // 3. Validar el plan del request
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID es requerido' }, { status: 400 });
    }

    // Validar que el plan sea plus (no free)
    if (!['plus'].includes(planId)) {
      return NextResponse.json({ error: 'Plan no válido para pago' }, { status: 400 });
    }

    // 4. Verificar que el usuario no tenga ya un plan Plus activo
    if (user.plan === 'plus' && user.plan_expires_at) {
      const expiresAt = new Date(user.plan_expires_at);
      if (expiresAt > new Date()) {
        return NextResponse.json(
          {
            error: 'Ya tienes un plan Plus activo',
            expiresAt: user.plan_expires_at,
          },
          { status: 400 }
        );
      }
    }

    // 5. Crear preferencia de pago con datos del usuario
    const preference = await createPaymentPreference(planId, user.email || undefined, {
      userId: user.id,
      phone: user.phone,
      name: user.name,
    });

    console.warn(`✅ Preferencia de pago creada para usuario ${user.phone} (${user.id})`);

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error('Error creating payment preference:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
