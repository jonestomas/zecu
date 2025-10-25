import { NextRequest, NextResponse } from 'next/server';
import { validateOrigin } from '@/lib/security-headers';
import { createLogger } from '@/lib/secure-logging';

// API para obtener estadísticas de logging (solo para administradores)
export async function GET(request: NextRequest) {
  const logger = createLogger(request);
  
  try {
    // Validar origen
    if (!validateOrigin(request)) {
      logger.security.violation('Invalid origin for log stats request');
      return NextResponse.json(
        { success: false, error: 'Origen no autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || 'INFO';
    const category = searchParams.get('category');
    const hours = parseInt(searchParams.get('hours') || '24');

    // En un sistema real, aquí consultarías la base de datos de logs
    // Por ahora, devolvemos estadísticas simuladas
    const stats = {
      totalLogs: 0,
      logsByLevel: {
        DEBUG: 0,
        INFO: 0,
        WARN: 0,
        ERROR: 0,
        CRITICAL: 0
      },
      logsByCategory: {
        AUTH: 0,
        PAYMENT: 0,
        API: 0,
        SECURITY: 0,
        USER: 0,
        SYSTEM: 0,
        WEBHOOK: 0
      },
      recentErrors: [],
      securityEvents: 0,
      timeRange: `${hours} hours`
    };

    logger.info('SYSTEM', 'Log statistics requested', {
      level,
      category,
      hours,
      requestedBy: 'admin'
    });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    logger.error('SYSTEM', 'Error getting log statistics', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// API para configurar niveles de logging (solo para administradores)
export async function POST(request: NextRequest) {
  const logger = createLogger(request);
  
  try {
    // Validar origen
    if (!validateOrigin(request)) {
      logger.security.violation('Invalid origin for log config request');
      return NextResponse.json(
        { success: false, error: 'Origen no autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { level, category, enabled } = body;

    // Validar nivel de log
    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    if (level && !validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, error: 'Nivel de log inválido' },
        { status: 400 }
      );
    }

    // Validar categoría
    const validCategories = ['AUTH', 'PAYMENT', 'API', 'SECURITY', 'USER', 'SYSTEM', 'WEBHOOK'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Categoría inválida' },
        { status: 400 }
      );
    }

    // En un sistema real, aquí actualizarías la configuración de logging
    logger.info('SYSTEM', 'Log configuration updated', {
      level,
      category,
      enabled,
      updatedBy: 'admin'
    });

    return NextResponse.json({
      success: true,
      message: 'Configuración de logging actualizada',
      config: { level, category, enabled }
    });

  } catch (error: any) {
    logger.error('SYSTEM', 'Error updating log configuration', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
