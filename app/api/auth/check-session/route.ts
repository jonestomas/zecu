import { NextRequest, NextResponse } from 'next/server';
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

    return NextResponse.json({
      authenticated: true,
      userId: session.userId,
      phone: session.phone
    });

  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({
      authenticated: false
    });
  }
}
