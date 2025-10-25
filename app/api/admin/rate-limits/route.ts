import { NextRequest, NextResponse } from 'next/server';
import { getRateLimitStats, clearUserRateLimits } from '@/lib/rate-limiting';
import { validateOrigin, logSecurityEvent } from '@/lib/security-headers';

// API para obtener estadísticas de rate limiting (solo para administradores)
export async function GET(request: NextRequest) {
  try {
    // Validar origen
    if (!validateOrigin(request)) {
      logSecurityEvent('INVALID_ORIGIN_RATE_LIMIT_STATS', request);
      return NextResponse.json(
        { success: false, error: 'Origen no autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Identificador requerido' },
        { status: 400 }
      );
    }

    const stats = await getRateLimitStats(identifier);

    logSecurityEvent('RATE_LIMIT_STATS_REQUESTED', request, { identifier });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Error obteniendo estadísticas de rate limiting:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// API para limpiar rate limits de un usuario (solo para administradores)
export async function DELETE(request: NextRequest) {
  try {
    // Validar origen
    if (!validateOrigin(request)) {
      logSecurityEvent('INVALID_ORIGIN_CLEAR_RATE_LIMITS', request);
      return NextResponse.json(
        { success: false, error: 'Origen no autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId requerido' },
        { status: 400 }
      );
    }

    const success = await clearUserRateLimits(userId);

    if (success) {
      logSecurityEvent('RATE_LIMITS_CLEARED', request, { userId });
      return NextResponse.json({
        success: true,
        message: `Rate limits limpiados para usuario ${userId}`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Error limpiando rate limits'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error limpiando rate limits:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
