-- Migración: Crear tabla de consultas para contabilización
-- Fecha: 2025-10-21
-- Descripción: Sistema de contabilización de consultas por usuario y mes

-- Tabla de consultas (registro de cada consulta)
CREATE TABLE IF NOT EXISTS consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Datos de la consulta
  mensaje TEXT NOT NULL,
  respuesta TEXT,
  tipo VARCHAR(50) DEFAULT 'analisis_estafa', -- 'analisis_estafa', 'consulta_general', etc
  
  -- Análisis (si aplica)
  riesgo_detectado BOOLEAN DEFAULT false,
  nivel_riesgo VARCHAR(20), -- 'bajo', 'medio', 'alto'
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mes_periodo VARCHAR(7) NOT NULL, -- Formato: 'YYYY-MM' (ej: '2025-10')
  
  -- Índices para mejorar rendimiento
  CONSTRAINT consultas_mes_check CHECK (mes_periodo ~ '^\d{4}-\d{2}$')
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_consultas_user_id ON consultas(user_id);
CREATE INDEX IF NOT EXISTS idx_consultas_mes_periodo ON consultas(mes_periodo);
CREATE INDEX IF NOT EXISTS idx_consultas_user_mes ON consultas(user_id, mes_periodo);
CREATE INDEX IF NOT EXISTS idx_consultas_created_at ON consultas(created_at DESC);

-- Vista materializada para conteo de consultas por mes
CREATE MATERIALIZED VIEW IF NOT EXISTS consultas_por_mes AS
SELECT 
  user_id,
  mes_periodo,
  COUNT(*) as total_consultas,
  COUNT(*) FILTER (WHERE riesgo_detectado = true) as consultas_con_riesgo,
  MAX(created_at) as ultima_consulta
FROM consultas
GROUP BY user_id, mes_periodo;

-- Índice único en la vista
CREATE UNIQUE INDEX IF NOT EXISTS idx_consultas_por_mes_user_periodo 
ON consultas_por_mes(user_id, mes_periodo);

-- Función para refrescar la vista materializada
CREATE OR REPLACE FUNCTION refresh_consultas_por_mes()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY consultas_por_mes;
END;
$$ LANGUAGE plpgsql;

-- Función helper para obtener el conteo del mes actual
CREATE OR REPLACE FUNCTION get_consultas_mes_actual(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_mes_actual VARCHAR(7);
  v_count INTEGER;
BEGIN
  -- Obtener el mes actual en formato YYYY-MM
  v_mes_actual := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Contar consultas del mes actual
  SELECT COUNT(*)
  INTO v_count
  FROM consultas
  WHERE user_id = p_user_id
    AND mes_periodo = v_mes_actual;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para validar límite de consultas según plan
CREATE OR REPLACE FUNCTION puede_realizar_consulta(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan VARCHAR(20);
  v_limite INTEGER;
  v_consultas_mes INTEGER;
  v_puede_consultar BOOLEAN;
BEGIN
  -- Obtener plan del usuario
  SELECT plan INTO v_plan
  FROM users
  WHERE id = p_user_id;
  
  -- Si no tiene plan, retornar error
  IF v_plan IS NULL THEN
    RETURN jsonb_build_object(
      'puede_consultar', false,
      'razon', 'Usuario no encontrado',
      'consultas_usadas', 0,
      'limite', 0
    );
  END IF;
  
  -- Determinar límite según plan
  v_limite := CASE 
    WHEN v_plan = 'plus' THEN 50
    WHEN v_plan = 'free' THEN 5
    ELSE 0
  END;
  
  -- Obtener consultas del mes actual
  v_consultas_mes := get_consultas_mes_actual(p_user_id);
  
  -- Validar si puede consultar
  v_puede_consultar := v_consultas_mes < v_limite;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'puede_consultar', v_puede_consultar,
    'plan', v_plan,
    'consultas_usadas', v_consultas_mes,
    'limite', v_limite,
    'consultas_restantes', v_limite - v_consultas_mes
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentarios para documentación
COMMENT ON TABLE consultas IS 'Registro de todas las consultas realizadas por los usuarios al bot de WhatsApp';
COMMENT ON COLUMN consultas.mes_periodo IS 'Período mensual en formato YYYY-MM para contabilización';
COMMENT ON FUNCTION get_consultas_mes_actual IS 'Obtiene el número de consultas del usuario en el mes actual';
COMMENT ON FUNCTION puede_realizar_consulta IS 'Valida si el usuario puede realizar una nueva consulta según su plan';

-- RLS (Row Level Security) - Los usuarios solo ven sus propias consultas
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias consultas"
  ON consultas FOR SELECT
  USING (true); -- Por ahora permitimos todo, luego ajustaremos con auth

CREATE POLICY "El sistema puede insertar consultas"
  ON consultas FOR INSERT
  WITH CHECK (true);

-- Trigger para refrescar la vista materializada cada hora (opcional, se puede hacer manual)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('refresh_consultas_por_mes', '0 * * * *', 'SELECT refresh_consultas_por_mes()');
