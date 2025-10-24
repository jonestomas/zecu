-- Migración 005: Agregar contador de consultas mensual a tabla users
-- Fecha: 2025-10-23
-- Propósito: Sistema de contabilización simple para MVP

-- 1. Agregar columnas para contador de consultas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS consultas_mes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mes_periodo VARCHAR(7) DEFAULT TO_CHAR(NOW(), 'YYYY-MM');

-- 2. Comentarios para documentar
COMMENT ON COLUMN users.consultas_mes IS 'Contador de consultas del mes actual';
COMMENT ON COLUMN users.mes_periodo IS 'Mes actual en formato YYYY-MM para resetear contador';

-- 3. Función para resetear contador si cambió el mes
CREATE OR REPLACE FUNCTION reset_consultas_si_nuevo_mes()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el mes actual es diferente al mes_periodo guardado, resetear
  IF NEW.mes_periodo != TO_CHAR(NOW(), 'YYYY-MM') THEN
    NEW.consultas_mes := 0;
    NEW.mes_periodo := TO_CHAR(NOW(), 'YYYY-MM');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger que se ejecuta antes de cada SELECT en users
-- (Se ejecutará cuando n8n haga el Get Row)
CREATE OR REPLACE TRIGGER check_mes_before_read
BEFORE UPDATE OF consultas_mes ON users
FOR EACH ROW
EXECUTE FUNCTION reset_consultas_si_nuevo_mes();

-- 5. Función auxiliar para incrementar contador de consultas
CREATE OR REPLACE FUNCTION incrementar_consultas(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_mes_actual VARCHAR(7);
  v_consultas_nuevas INTEGER;
BEGIN
  v_mes_actual := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Actualizar o resetear según el mes
  UPDATE users
  SET 
    consultas_mes = CASE 
      WHEN mes_periodo = v_mes_actual THEN consultas_mes + 1
      ELSE 1
    END,
    mes_periodo = v_mes_actual
  WHERE id = p_user_id
  RETURNING consultas_mes INTO v_consultas_nuevas;
  
  RETURN v_consultas_nuevas;
END;
$$ LANGUAGE plpgsql;

-- 6. Inicializar usuarios existentes con el mes actual
UPDATE users 
SET 
  consultas_mes = 0,
  mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
WHERE mes_periodo IS NULL;

-- 7. Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_mes_periodo ON users(mes_periodo);

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Migración 005 completada';
  RAISE NOTICE '✅ Columnas agregadas: consultas_mes, mes_periodo';
  RAISE NOTICE '✅ Función creada: incrementar_consultas(user_id)';
END $$;
