// Helper functions para el sistema de contabilización de consultas
import { supabase } from './supabase-client';

/**
 * Tipos de consulta disponibles
 */
export type TipoConsulta = 'analisis_estafa' | 'consulta_general' | 'reporte_estafa';

/**
 * Nivel de riesgo detectado
 */
export type NivelRiesgo = 'bajo' | 'medio' | 'alto';

/**
 * Interfaz para el resultado de validación
 */
export interface ValidacionConsulta {
  puede_consultar: boolean;
  plan: 'free' | 'plus';
  consultas_usadas: number;
  limite: number;
  consultas_restantes: number;
  razon?: string;
}

/**
 * Interfaz para una consulta
 */
export interface Consulta {
  id: string;
  user_id: string;
  mensaje: string;
  respuesta: string | null;
  tipo: TipoConsulta;
  riesgo_detectado: boolean;
  nivel_riesgo: NivelRiesgo | null;
  created_at: string;
  mes_periodo: string;
}

/**
 * Verifica si un usuario puede realizar una consulta según su plan
 * @param userId - ID del usuario
 * @returns Objeto con información de validación
 */
export async function puedeRealizarConsulta(userId: string): Promise<ValidacionConsulta> {
  try {
    const { data, error } = await supabase
      .rpc('puede_realizar_consulta', { p_user_id: userId });

    if (error) {
      console.error('Error validando consulta:', error);
      throw new Error('Error al validar límite de consultas');
    }

    return data as ValidacionConsulta;
  } catch (error) {
    console.error('Error en puedeRealizarConsulta:', error);
    throw error;
  }
}

/**
 * Registra una nueva consulta en la base de datos
 * @param params - Parámetros de la consulta
 * @returns La consulta creada
 */
export async function registrarConsulta(params: {
  userId: string;
  mensaje: string;
  tipo?: TipoConsulta;
}): Promise<Consulta> {
  const { userId, mensaje, tipo = 'analisis_estafa' } = params;

  try {
    // Obtener mes actual en formato YYYY-MM
    const now = new Date();
    const mesPeriodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('consultas')
      .insert({
        user_id: userId,
        mensaje,
        tipo,
        mes_periodo: mesPeriodo,
        riesgo_detectado: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error registrando consulta:', error);
      throw new Error('Error al registrar la consulta');
    }

    return data as Consulta;
  } catch (error) {
    console.error('Error en registrarConsulta:', error);
    throw error;
  }
}

/**
 * Actualiza una consulta con la respuesta y análisis de riesgo
 * @param consultaId - ID de la consulta
 * @param params - Parámetros de actualización
 */
export async function actualizarConsulta(
  consultaId: string,
  params: {
    respuesta: string;
    riesgoDetectado?: boolean;
    nivelRiesgo?: NivelRiesgo;
  }
): Promise<void> {
  const { respuesta, riesgoDetectado = false, nivelRiesgo } = params;

  try {
    const { error } = await supabase
      .from('consultas')
      .update({
        respuesta,
        riesgo_detectado: riesgoDetectado,
        nivel_riesgo: nivelRiesgo,
      })
      .eq('id', consultaId);

    if (error) {
      console.error('Error actualizando consulta:', error);
      throw new Error('Error al actualizar la consulta');
    }
  } catch (error) {
    console.error('Error en actualizarConsulta:', error);
    throw error;
  }
}

/**
 * Obtiene el conteo de consultas del mes actual para un usuario
 * @param userId - ID del usuario
 * @returns Número de consultas del mes
 */
export async function getConsultasMesActual(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('get_consultas_mes_actual', { p_user_id: userId });

    if (error) {
      console.error('Error obteniendo consultas del mes:', error);
      throw new Error('Error al obtener consultas del mes');
    }

    return data as number;
  } catch (error) {
    console.error('Error en getConsultasMesActual:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de consultas de un usuario
 * @param userId - ID del usuario
 * @param limit - Límite de resultados (default: 50)
 * @returns Array de consultas
 */
export async function getHistorialConsultas(
  userId: string,
  limit: number = 50
): Promise<Consulta[]> {
  try {
    const { data, error } = await supabase
      .from('consultas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error obteniendo historial:', error);
      throw new Error('Error al obtener historial de consultas');
    }

    return data as Consulta[];
  } catch (error) {
    console.error('Error en getHistorialConsultas:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de consultas de un usuario para el mes actual
 * @param userId - ID del usuario
 */
export async function getEstadisticasMes(userId: string): Promise<{
  total: number;
  con_riesgo: number;
  por_tipo: Record<TipoConsulta, number>;
}> {
  try {
    const now = new Date();
    const mesPeriodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('consultas')
      .select('tipo, riesgo_detectado')
      .eq('user_id', userId)
      .eq('mes_periodo', mesPeriodo);

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener estadísticas');
    }

    const total = data.length;
    const con_riesgo = data.filter((c) => c.riesgo_detectado).length;
    const por_tipo = data.reduce((acc, c) => {
      acc[c.tipo as TipoConsulta] = (acc[c.tipo as TipoConsulta] || 0) + 1;
      return acc;
    }, {} as Record<TipoConsulta, number>);

    return {
      total,
      con_riesgo,
      por_tipo,
    };
  } catch (error) {
    console.error('Error en getEstadisticasMes:', error);
    throw error;
  }
}

