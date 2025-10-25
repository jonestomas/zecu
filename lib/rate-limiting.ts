import { supabaseAdmin } from '@/lib/supabase-client';

// Configuraciones de rate limiting por endpoint
export const RATE_LIMITS = {
  // Autenticación - muy restrictivo
  'auth-send-otp': { requests: 3, window: 300 }, // 3 requests por 5 minutos
  'auth-verify-otp': { requests: 5, window: 300 }, // 5 requests por 5 minutos
  'auth-check-session': { requests: 30, window: 60 }, // 30 requests por minuto

  // APIs de pago - restrictivo
  'polar-create-checkout': { requests: 5, window: 300 }, // 5 requests por 5 minutos
  'polar-verify-payment': { requests: 10, window: 300 }, // 10 requests por 5 minutos

  // APIs generales - moderado
  'general-api': { requests: 60, window: 60 }, // 60 requests por minuto

  // Webhooks - más permisivo pero controlado
  'webhook-polar': { requests: 100, window: 60 }, // 100 requests por minuto

  // APIs de usuario - moderado
  'user-profile': { requests: 20, window: 60 }, // 20 requests por minuto
  'user-cancel-subscription': { requests: 3, window: 300 }, // 3 requests por 5 minutos
};

// Tipos de rate limiting
export type RateLimitType = keyof typeof RATE_LIMITS;

// Estructura de datos para rate limiting
interface RateLimitRecord {
  id: string;
  identifier: string; // IP, userId, etc.
  endpoint: string;
  requests_count: number;
  window_start: string;
  created_at: string;
  updated_at: string;
}

// Función para generar identificador único
function generateIdentifier(_request: Request, userId?: string): string {
  // Priorizar userId si está disponible
  if (userId) {
    return `user:${userId}`;
  }

  // Usar IP como fallback
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

// Función para obtener el tipo de rate limit basado en la URL
function getRateLimitType(pathname: string): RateLimitType {
  if (pathname.includes('/api/auth/send-otp')) return 'auth-send-otp';
  if (pathname.includes('/api/auth/verify-otp')) return 'auth-verify-otp';
  if (pathname.includes('/api/auth/check-session')) return 'auth-check-session';
  if (pathname.includes('/api/polar/create-checkout')) return 'polar-create-checkout';
  if (pathname.includes('/api/polar/verify-payment')) return 'polar-verify-payment';
  if (pathname.includes('/api/webhooks/polar')) return 'webhook-polar';
  if (pathname.includes('/api/auth/update-profile')) return 'user-profile';
  if (pathname.includes('/api/auth/cancel-subscription')) return 'user-cancel-subscription';

  return 'general-api';
}

// Función principal de rate limiting
export async function checkRateLimit(
  _request: Request,
  userId?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number; error?: string }> {
  try {
    const pathname = new URL(_request.url).pathname;
    const rateLimitType = getRateLimitType(pathname);
    const config = RATE_LIMITS[rateLimitType];

    if (!config) {
      return { allowed: true, remaining: 999, resetTime: Date.now() + 60000 };
    }

    const identifier = generateIdentifier(_request, userId);
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.window * 1000);

    // Buscar registros existentes en la ventana de tiempo
    const { data: existingRecords, error: fetchError } = await supabaseAdmin
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('endpoint', rateLimitType)
      .gte('window_start', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching rate limit records:', fetchError);
      // En caso de error de DB, permitir pero loggear
      return { allowed: true, remaining: 999, resetTime: Date.now() + 60000 };
    }

    // Calcular requests en la ventana actual
    const currentRequests = existingRecords?.length || 0;

    // Verificar si excede el límite
    if (currentRequests >= config._requests) {
      const oldestRecord = existingRecords?.[existingRecords.length - 1];
      const resetTime = oldestRecord
        ? new Date(oldestRecord.window_start).getTime() + config.window * 1000
        : now.getTime() + config.window * 1000;

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        error: `Rate limit exceeded. Try again in ${Math.ceil((resetTime - now.getTime()) / 1000)} seconds.`,
      };
    }

    // Registrar nueva request
    const { error: insertError } = await supabaseAdmin.from('rate_limits').insert({
      identifier,
      endpoint: rateLimitType,
      _requests_count: currentRequests + 1,
      window_start: now.toISOString(),
    });

    if (insertError) {
      console.error('Error inserting rate limit record:', insertError);
      // En caso de error de inserción, permitir pero loggear
      return {
        allowed: true,
        remaining: config.requests - currentRequests - 1,
        resetTime: now.getTime() + config.window * 1000,
      };
    }

    // Limpiar registros antiguos (mantener solo los últimos 24 horas)
    const cleanupTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await supabaseAdmin.from('rate_limits').delete().lt('created_at', cleanupTime.toISOString());

    return {
      allowed: true,
      remaining: config.requests - currentRequests - 1,
      resetTime: now.getTime() + config.window * 1000,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // En caso de error general, permitir pero loggear
    return { allowed: true, remaining: 999, resetTime: Date.now() + 60000 };
  }
}

// Función para obtener estadísticas de rate limiting
export async function getRateLimitStats(identifier: string): Promise<{
  totalRequests: number;
  endpoints: Record<string, number>;
  lastRequest?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('rate_limits')
      .select('endpoint, created_at')
      .eq('identifier', identifier)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rate limit stats:', error);
      return { totalRequests: 0, endpoints: {} };
    }

    const endpoints: Record<string, number> = {};
    let lastRequest: string | undefined;

    data?.forEach(record => {
      endpoints[record.endpoint] = (endpoints[record.endpoint] || 0) + 1;
      if (!lastRequest) lastRequest = record.created_at;
    });

    return {
      totalRequests: data?.length || 0,
      endpoints,
      lastRequest,
    };
  } catch (error) {
    console.error('Rate limit stats error:', error);
    return { totalRequests: 0, endpoints: {} };
  }
}

// Función para limpiar rate limits de un usuario específico (útil para admin)
export async function clearUserRateLimits(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('rate_limits')
      .delete()
      .eq('identifier', `user:${userId}`);

    if (error) {
      console.error('Error clearing user rate limits:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Clear rate limits error:', error);
    return false;
  }
}
