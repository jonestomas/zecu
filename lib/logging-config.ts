// Configuración de logging por entorno
export const LOGGING_CONFIG = {
  development: {
    level: 'DEBUG',
    format: 'console',
    includeStack: true,
    includeMetadata: true,
    sensitiveDataRedaction: true,
  },

  production: {
    level: 'INFO',
    format: 'json',
    includeStack: false,
    includeMetadata: true,
    sensitiveDataRedaction: true,
    // En producción, aquí configurarías servicios externos
    externalServices: {
      // datadog: { apiKey: process.env.DATADOG_API_KEY },
      // cloudwatch: { region: process.env.AWS_REGION },
      // sentry: { dsn: process.env.SENTRY_DSN }
    },
  },

  test: {
    level: 'ERROR',
    format: 'json',
    includeStack: false,
    includeMetadata: false,
    sensitiveDataRedaction: true,
  },
};

// Función para obtener configuración actual
export function getLoggingConfig() {
  const env = process.env.NODE_ENV || 'development';
  return LOGGING_CONFIG[env as keyof typeof LOGGING_CONFIG] || LOGGING_CONFIG.development;
}

// Función para verificar si un nivel debe ser loggeado
export function shouldLog(level: string): boolean {
  const config = getLoggingConfig();
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
  const currentLevelIndex = levels.indexOf(config.level);
  const requestedLevelIndex = levels.indexOf(level);

  return requestedLevelIndex >= currentLevelIndex;
}

// Función para formatear logs según configuración
export function formatLog(event: any): string {
  const config = getLoggingConfig();

  if (config.format === 'json') {
    return JSON.stringify(event);
  }

  // Formato de consola para desarrollo
  const timestamp = new Date(event.timestamp).toLocaleTimeString();
  const level = event.level.padEnd(8);
  const category = event.category.padEnd(8);
  const requestId = event.requestId ? `[${event.requestId}]` : '';

  let logLine = `${timestamp} ${level} ${category} ${requestId} ${event.message}`;

  if (config.includeMetadata && event.metadata) {
    logLine += `\n  Metadata: ${JSON.stringify(event.metadata, null, 2)}`;
  }

  if (config.includeStack && event.error?.stack) {
    logLine += `\n  Stack: ${event.error.stack}`;
  }

  return logLine;
}
