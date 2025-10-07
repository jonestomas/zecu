import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { z } from 'zod';
import { jwtVerify } from 'jose';

// Schema de validación
const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255)
});

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
    // Verificar sesión
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado'
        },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesión inválida'
        },
        { status: 401 }
      );
    }

    // Parsear y validar el body
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Actualizar el nombre del usuario
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ name: validatedData.name })
      .eq('id', session.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`✅ Perfil actualizado para usuario: ${session.phone}`);

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        plan: user.plan,
        plan_expires_at: user.plan_expires_at
      }
    });

  } catch (error) {
    console.error('Error en update-profile:', error);

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

