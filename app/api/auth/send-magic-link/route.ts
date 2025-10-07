import { NextRequest, NextResponse } from 'next/server';
import { generateMagicLink } from '@/lib/auth-passwordless';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const result = await generateMagicLink(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Te hemos enviado un link de acceso a tu email. Revisa tu bandeja de entrada.'
    });

  } catch (error) {
    console.error('Error en send-magic-link:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
