import { NextRequest, NextResponse } from 'next/server';
import { getUserByPhone } from '@/lib/supabase-client';
import { registrarConsulta, TipoConsulta } from '@/lib/consultas-client';
import { z } from 'zod';

// Schema de validación
const registrarConsultaSchema = z.object({
  phone: z.string().min(10, 'Número de teléfono inválido'),
  mensaje: z.string().min(1, 'El mensaje no puede estar vacío'),
  tipo: z.enum(['analisis_estafa', 'consulta_general', 'reporte_estafa']).optional(),
});

/**
 * POST /api/consultas/registrar
 * Registra una nueva consulta en el sistema
 * 
 * Body:
 * {
 *   "phone": "+5491134070204",
 *   "mensaje": "Texto del mensaje a analizar",
 *   "tipo": "analisis_estafa" // opcional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "consulta_id": "uuid",
 *   "message": "Consulta registrada correctamente"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parsear y validar el body
    const body = await request.json();
    const validatedData = registrarConsultaSchema.parse(body);

    const { phone, mensaje, tipo } = validatedData;

    // Buscar usuario por teléfono
    const user = await getUserByPhone(phone);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      );
    }

    // Registrar consulta
    const consulta = await registrarConsulta({
      userId: user.id,
      mensaje,
      tipo: tipo as TipoConsulta,
    });

    console.log(`✅ Consulta registrada para ${phone} (${user.name}):`, {
      id: consulta.id,
      tipo: consulta.tipo,
      mes: consulta.mes_periodo,
    });

    return NextResponse.json({
      success: true,
      consulta_id: consulta.id,
      message: 'Consulta registrada correctamente',
    });

  } catch (error) {
    console.error('Error en registrar consulta:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

