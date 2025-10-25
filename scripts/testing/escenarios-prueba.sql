-- ============================================
-- ESCENARIOS DE PRUEBA - Sistema de Contabilización
-- ============================================

-- ============================================
-- TEST 1: Usuario FREE con consultas disponibles
-- Resultado esperado: ✅ Permite consultar
-- ============================================
UPDATE users 
SET 
  plan = 'free',
  consultas_mes = 2,
  mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
WHERE phone = '+5491134070204';

-- Verificar:
-- SELECT * FROM users WHERE phone = '+5491134070204';
-- Envía mensaje al bot → Debe responder → consultas_mes = 3


-- ============================================
-- TEST 2: Usuario FREE en el límite (5/5)
-- Resultado esperado: ❌ Bloquea y envía mensaje de upgrade
-- ============================================
UPDATE users 
SET 
  plan = 'free',
  consultas_mes = 5,
  mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
WHERE phone = '+5491134070204';

-- Verificar:
-- SELECT * FROM users WHERE phone = '+5491134070204';
-- Envía mensaje al bot → Debe bloquear → consultas_mes = 5 (sin cambios)


-- ============================================
-- TEST 3: Usuario FREE al borde del límite (4/5)
-- Resultado esperado: ✅ Permite última consulta
-- ============================================
UPDATE users 
SET 
  plan = 'free',
  consultas_mes = 4,
  mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
WHERE phone = '+5491134070204';

-- Verificar:
-- SELECT * FROM users WHERE phone = '+5491134070204';
-- Envía mensaje al bot → Debe responder → consultas_mes = 5


-- ============================================
-- TEST 4: Usuario PLUS con consultas disponibles
-- Resultado esperado: ✅ Permite consultar
-- ============================================
UPDATE users 
SET 
  plan = 'plus',
  consultas_mes = 10,
  mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
WHERE phone = '+5491134070204';

-- Verificar:
-- SELECT * FROM users WHERE phone = '+5491134070204';
-- Envía mensaje al bot → Debe responder → consultas_mes = 11


-- ============================================
-- TEST 5: Usuario PLUS en el límite (20/20)
-- Resultado esperado: ❌ Bloquea y envía mensaje de upgrade
-- ============================================
UPDATE users 
SET 
  plan = 'plus',
  consultas_mes = 20,
  mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
WHERE phone = '+5491134070204';

-- Verificar:
-- SELECT * FROM users WHERE phone = '+5491134070204';
-- Envía mensaje al bot → Debe bloquear → consultas_mes = 20 (sin cambios)


-- ============================================
-- TEST 6: Reset automático de mes
-- Resultado esperado: ✅ Resetea contador y permite consultar
-- ============================================
UPDATE users 
SET 
  plan = 'free',
  consultas_mes = 5,
  mes_periodo = '2024-09'  -- Mes pasado
WHERE phone = '+5491134070204';

-- Verificar:
-- SELECT * FROM users WHERE phone = '+5491134070204';
-- Envía mensaje al bot → Función detecta mes diferente → Resetea a 1


-- ============================================
-- RESETEAR A ESTADO INICIAL
-- ============================================
UPDATE users 
SET 
  plan = 'plus',
  consultas_mes = 0,
  mes_periodo = TO_CHAR(NOW(), 'YYYY-MM')
WHERE phone = '+5491134070204';

SELECT 
  name,
  plan,
  consultas_mes,
  mes_periodo,
  '✅ Usuario reseteado' as estado
FROM users 
WHERE phone = '+5491134070204';


-- ============================================
-- QUERY ÚTIL: Ver estado de todos los usuarios
-- ============================================
SELECT 
  name,
  phone,
  plan,
  consultas_mes,
  CASE 
    WHEN plan = 'free' THEN CONCAT(consultas_mes, '/5 ', 
      CASE WHEN consultas_mes >= 5 THEN '🔴' ELSE '🟢' END)
    WHEN plan = 'plus' THEN CONCAT(consultas_mes, '/20 ', 
      CASE WHEN consultas_mes >= 20 THEN '🔴' ELSE '🟢' END)
    WHEN plan = 'premium' THEN CONCAT(consultas_mes, '/50 ', 
      CASE WHEN consultas_mes >= 50 THEN '🔴' ELSE '🟢' END)
  END as estado,
  mes_periodo
FROM users
ORDER BY created_at DESC;
