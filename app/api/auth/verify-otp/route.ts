import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByPhone, 
  createUser, 
  verifyOTPCode,
  invalidateAllOTPCodes
} from '@/lib/supabase-client';
import { z } from 'zod';
import { SignJWT } from 'jose';

// Schema de validación
const verifyOTPSchema = z.object({
  phone: z.string()
    .min(10, 'Número de teléfono inválido')
    .max(20, 'Número de teléfono inválido')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido'),
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo números'),
  name: z.string().optional()
});

// Crear JWT token para sesión
async function createSessionToken(userId: string, phone: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );

  const token = await new SignJWT({ userId, phone })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Token válido por 30 días
    .sign(secret);

  return token;
}

export async function POST(request: NextRequest) {
  try {
    // Parsear y validar el body
    const body = await request.json();
    const validatedData = verifyOTPSchema.parse(body);

    const { phone, code, name } = validatedData;

    // Verificar código OTP
    const { valid, otpRecord } = await verifyOTPCode(phone, code);

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código inválido o expirado'
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    let user = await getUserByPhone(phone);
    let isNewUser = false;

    if (!user) {
      // Crear nuevo usuario
      user = await createUser({
        phone,
        name: name || undefined,
        plan: 'free'
      });
      isNewUser = true;

      console.log(`✅ Nuevo usuario creado: ${phone}`);
    } else {
      console.log(`✅ Usuario existente verificado: ${phone}`);
    }

    // Invalidar todos los códigos OTP anteriores de este teléfono
    await invalidateAllOTPCodes(phone);

    // Crear token de sesión
    const sessionToken = await createSessionToken(user.id, user.phone);

    // Preparar respuesta con cookie de sesión
    const response = NextResponse.json({
      success: true,
      message: 'Verificación exitosa',
      isNewUser,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        plan: user.plan,
        plan_expires_at: user.plan_expires_at
      }
    });

    // Establecer cookie de sesión
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Error en verify-otp:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: error.errors
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
