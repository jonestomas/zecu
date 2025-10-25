import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { z } from 'zod';
import { jwtVerify } from 'jose';

// Schema de validación
const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  country: z.string().optional(),
  city: z.string().optional()
});

// Verificar token de sesión
async function verifySessionToken(token: string): Promise<{ userId: string; phone: string } | null> {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET no está configurado en las variables de entorno');
      return null;
    }

    const secret = new TextEncoder().encode(jwtSecret);

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

    // Preparar datos a actualizar (solo los que vienen en el body)
    const updateData: Record<string, string> = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.country) updateData.country = validatedData.country;
    if (validatedData.city) updateData.city = validatedData.city;

    // Actualizar el perfil del usuario
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', session.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`✅ Perfil actualizado para usuario: ${session.phone}`, updateData);

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        country: user.country,
        city: user.city,
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
