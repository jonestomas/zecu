-- Migración: Crear tabla de rate limiting
-- Fecha: 2025-01-28
-- Descripción: Sistema de rate limiting persistente para prevenir ataques de fuerza bruta y DDoS

-- Crear tabla rate_limits
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- IP o userId
  endpoint VARCHAR(100) NOT NULL, -- Tipo de endpoint
  requests_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);

-- Índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, endpoint, window_start);

-- Comentarios para documentación
COMMENT ON TABLE rate_limits IS 'Registros de rate limiting para prevenir ataques de fuerza bruta y DDoS';
COMMENT ON COLUMN rate_limits.identifier IS 'Identificador único (IP o userId) para agrupar requests';
COMMENT ON COLUMN rate_limits.endpoint IS 'Tipo de endpoint para aplicar límites específicos';
COMMENT ON COLUMN rate_limits.requests_count IS 'Número de requests en la ventana de tiempo';
COMMENT ON COLUMN rate_limits.window_start IS 'Inicio de la ventana de tiempo para el rate limiting';

-- Función para limpiar registros antiguos automáticamente
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  -- Eliminar registros más antiguos de 24 horas
  DELETE FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limits_updated_at();

-- Política RLS (Row Level Security) - Solo el service role puede acceder
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Política que permite solo al service role acceder a todos los registros
CREATE POLICY "Service role can manage all rate limits" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Política que deniega acceso a usuarios anónimos y autenticados
CREATE POLICY "Deny access to authenticated and anon users" ON rate_limits
  FOR ALL USING (false);

-- Crear vista para estadísticas de rate limiting (solo lectura)
CREATE OR REPLACE VIEW rate_limit_stats AS
SELECT 
  identifier,
  endpoint,
  COUNT(*) as total_requests,
  MAX(created_at) as last_request,
  MIN(created_at) as first_request
FROM rate_limits
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY identifier, endpoint;

-- Comentario para la vista
COMMENT ON VIEW rate_limit_stats IS 'Estadísticas de rate limiting para los últimos 24 horas';

-- Crear función para obtener estadísticas de un identificador específico
CREATE OR REPLACE FUNCTION get_rate_limit_stats(p_identifier VARCHAR(255))
RETURNS TABLE(
  endpoint VARCHAR(100),
  request_count BIGINT,
  last_request TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rls.endpoint,
    rls.total_requests,
    rls.last_request
  FROM rate_limit_stats rls
  WHERE rls.identifier = p_identifier
  ORDER BY rls.total_requests DESC;
END;
$$ LANGUAGE plpgsql;

-- Comentario para la función
COMMENT ON FUNCTION get_rate_limit_stats(VARCHAR) IS 'Obtiene estadísticas de rate limiting para un identificador específico';
