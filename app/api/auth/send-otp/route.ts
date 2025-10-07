import { NextRequest, NextResponse } from 'next/server';
import { generateOTP } from '@/lib/auth-passwordless';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const result = await generateOTP(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Te hemos enviado un código de 6 dígitos. Revisa tu email y WhatsApp.'
    });

  } catch (error) {
    console.error('Error en send-otp:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
