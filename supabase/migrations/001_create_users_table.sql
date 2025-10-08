-- Crear tabla de usuarios para Zecubot
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'plus')),
  plan_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por teléfono
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- Crear índice para búsquedas por plan
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura para usuarios autenticados
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (true);

-- Política: Permitir inserción desde API (service role)
CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Política: Permitir actualización desde API (service role)
CREATE POLICY "Service role can update users"
  ON public.users
  FOR UPDATE
  USING (true);

-- Comentarios para documentación
COMMENT ON TABLE public.users IS 'Tabla de usuarios de Zecubot con planes de suscripción';
COMMENT ON COLUMN public.users.phone IS 'Número de teléfono con código de país (ej: +5491112345678)';
COMMENT ON COLUMN public.users.plan IS 'Plan activo del usuario: free o plus';
COMMENT ON COLUMN public.users.plan_expires_at IS 'Fecha de expiración del plan (null = sin expiración)';
