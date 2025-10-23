import { NextRequest, NextResponse } from 'next/server';
import { actualizarConsulta, NivelRiesgo } from '@/lib/consultas-client';
import { z } from 'zod';

// Schema de validación
const actualizarConsultaSchema = z.object({
  consulta_id: z.string().uuid('ID de consulta inválido'),
  respuesta: z.string().min(1, 'La respuesta no puede estar vacía'),
  riesgo_detectado: z.boolean().optional(),
  nivel_riesgo: z.enum(['bajo', 'medio', 'alto']).optional(),
});

/**
 * POST /api/consultas/actualizar
 * Actualiza una consulta con la respuesta del bot y análisis de riesgo
 * 
 * Body:
 * {
 *   "consulta_id": "uuid",
 *   "respuesta": "Texto de la respuesta del bot",
 *   "riesgo_detectado": true, // opcional
 *   "nivel_riesgo": "alto" // opcional: "bajo", "medio", "alto"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Consulta actualizada correctamente"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parsear y validar el body
    const body = await request.json();
    const validatedData = actualizarConsultaSchema.parse(body);

    const { consulta_id, respuesta, riesgo_detectado, nivel_riesgo } = validatedData;

    // Actualizar consulta
    await actualizarConsulta(consulta_id, {
      respuesta,
      riesgoDetectado: riesgo_detectado,
      nivelRiesgo: nivel_riesgo as NivelRiesgo,
    });

    console.log(`✅ Consulta actualizada: ${consulta_id}`, {
      riesgo: riesgo_detectado,
      nivel: nivel_riesgo,
    });

    return NextResponse.json({
      success: true,
      message: 'Consulta actualizada correctamente',
    });

  } catch (error) {
    console.error('Error en actualizar consulta:', error);

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

