-- Script para verificar el contador de consultas
-- Ejecutar en Supabase SQL Editor después de cada prueba

SELECT 
  name,
  phone,
  plan,
  consultas_mes,
  mes_periodo,
  CASE 
    WHEN plan = 'free' THEN CONCAT(consultas_mes, '/5')
    WHEN plan = 'plus' THEN CONCAT(consultas_mes, '/20')
    WHEN plan = 'premium' THEN CONCAT(consultas_mes, '/50')
  END as progreso
FROM users
WHERE phone = '+5491134070204';
