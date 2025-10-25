-- Migración: Añadir columna polar_subscription_id a la tabla users
-- Fecha: 2025-01-27
-- Descripción: Almacenar el ID de suscripción de Polar.sh para poder cancelar suscripciones

-- Añadir columna polar_subscription_id a la tabla users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS polar_subscription_id VARCHAR(255);

-- Crear un índice para mejorar el rendimiento de las consultas por subscription_id
CREATE INDEX IF NOT EXISTS idx_users_polar_subscription_id ON users(polar_subscription_id);

-- Comentarios para documentación
COMMENT ON COLUMN users.polar_subscription_id IS 'ID de la suscripción en Polar.sh para poder cancelar suscripciones.';
