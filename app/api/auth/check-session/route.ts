import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserByPhone } from '@/lib/supabase-client';

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

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false
      });
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json({
        authenticated: false
      });
    }

    // Obtener datos completos del usuario desde la base de datos
    const user = await getUserByPhone(session.phone);

    if (!user) {
      return NextResponse.json({
        authenticated: false
      });
    }

    // Verificar si el plan Plus está expirado
    let isPlanExpired = false;
    if (user.plan === 'plus' && user.plan_expires_at) {
      const expiresAt = new Date(user.plan_expires_at);
      isPlanExpired = expiresAt <= new Date();
    }

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      country: user.country,
      city: user.city,
      plan: isPlanExpired ? 'free' : user.plan, // Si el plan expiró, retornar 'free'
      plan_expires_at: user.plan_expires_at,
      isPlanExpired
    });

  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({
      authenticated: false
    });
  }
}
