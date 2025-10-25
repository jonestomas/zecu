// Configuración segura de variables de entorno
import { z } from 'zod';

// Schema de validación para variables de entorno
const envSchema = z.object({
  // Mercado Pago
  MERCADOPAGO_ACCESS_TOKEN: z.string().min(1, 'Access token de Mercado Pago requerido'),
  MERCADOPAGO_PUBLIC_KEY: z.string().min(1, 'Public key de Mercado Pago requerido'),

  // URLs
  NEXT_PUBLIC_BASE_URL: z.string().url('URL base debe ser válida'),

  // Opcional: Webhook secret para validación
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),

  // Ambiente
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validar variables de entorno al cargar
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Error en variables de entorno:', error);
    throw new Error('Configuración de entorno inválida');
  }
}

// Exportar configuración validada
export const envConfig = validateEnv();

// Función para verificar si estamos en producción
export const isProduction = () => envConfig.NODE_ENV === 'production';
export const _isDevelopment = () => envConfig.NODE_ENV === 'development';

// Función para verificar credenciales de Mercado Pago
export const _validateMercadoPagoCredentials = () => {
  const { MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PUBLIC_KEY } = envConfig;

  if (isProduction()) {
    // En producción, NO deben ser credenciales de prueba
    if (
      MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-') ||
      MERCADOPAGO_PUBLIC_KEY.startsWith('TEST-')
    ) {
      throw new Error('🚨 SEGURIDAD: Usando credenciales de prueba en producción');
    }
  } else {
    // En desarrollo, DEBEN ser credenciales de prueba
    if (
      !MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-') ||
      !MERCADOPAGO_PUBLIC_KEY.startsWith('TEST-')
    ) {
      console.warn('⚠️ ADVERTENCIA: Usando credenciales de producción en desarrollo');
    }
  }

  return true;
};

// Función para logs seguros (sin exponer credenciales)
export const _logSafeEnv = () => {
  console.warn('🔧 Configuración del entorno:', {
    NODE_ENV: envConfig.NODE_ENV,
    BASE_URL: envConfig.NEXT_PUBLIC_BASE_URL,
    MP_TOKEN_TYPE: `${envConfig.MERCADOPAGO_ACCESS_TOKEN.split('-')[0]}-****`,
    MP_KEY_TYPE: `${envConfig.MERCADOPAGO_PUBLIC_KEY.split('-')[0]}-****`,
    WEBHOOK_SECRET: envConfig.MERCADOPAGO_WEBHOOK_SECRET ? 'Configurado' : 'No configurado',
  });
};
