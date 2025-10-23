import { NextRequest, NextResponse } from 'next/server';
import { getUserByPhone } from '@/lib/supabase-client';
import { puedeRealizarConsulta } from '@/lib/consultas-client';
import { z } from 'zod';

// Schema de validación
const validarConsultaSchema = z.object({
  phone: z.string().min(10, 'Número de teléfono inválido'),
});

/**
 * POST /api/consultas/validar
 * Valida si un usuario puede realizar una consulta según su plan
 * 
 * Body:
 * {
 *   "phone": "+5491134070204"
 * }
 * 
 * Response:
 * {
 *   "puede_consultar": true,
 *   "plan": "plus",
 *   "consultas_usadas": 12,
 *   "limite": 50,
 *   "consultas_restantes": 38
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parsear y validar el body
    const body = await request.json();
    const validatedData = validarConsultaSchema.parse(body);

    const { phone } = validatedData;

    // Buscar usuario por teléfono
    const user = await getUserByPhone(phone);

    if (!user) {
      return NextResponse.json(
        {
          puede_consultar: false,
          razon: 'Usuario no encontrado',
          consultas_usadas: 0,
          limite: 0,
          consultas_restantes: 0,
        },
        { status: 404 }
      );
    }

    // Validar si puede realizar consulta
    const validacion = await puedeRealizarConsulta(user.id);

    console.log(`📊 Validación para ${phone}:`, {
      plan: validacion.plan,
      usadas: validacion.consultas_usadas,
      limite: validacion.limite,
      puede: validacion.puede_consultar,
    });

    return NextResponse.json(validacion);

  } catch (error) {
    console.error('Error en validar consulta:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

