-- Crear tabla de códigos OTP para autenticación
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por teléfono
CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_codes(phone);

-- Crear índice para búsquedas por código y teléfono
CREATE INDEX IF NOT EXISTS idx_otp_phone_code ON public.otp_codes(phone, code);

-- Crear índice para limpiar códigos expirados
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON public.otp_codes(expires_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Política: Solo service role puede leer OTP codes
CREATE POLICY "Service role can read OTP codes"
  ON public.otp_codes
  FOR SELECT
  USING (true);

-- Política: Solo service role puede insertar OTP codes
CREATE POLICY "Service role can insert OTP codes"
  ON public.otp_codes
  FOR INSERT
  WITH CHECK (true);

-- Política: Solo service role puede actualizar OTP codes
CREATE POLICY "Service role can update OTP codes"
  ON public.otp_codes
  FOR UPDATE
  USING (true);

-- Política: Solo service role puede eliminar OTP codes
CREATE POLICY "Service role can delete OTP codes"
  ON public.otp_codes
  FOR DELETE
  USING (true);

-- Función para limpiar códigos OTP expirados (cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE public.otp_codes IS 'Códigos OTP de un solo uso para autenticación por teléfono';
COMMENT ON COLUMN public.otp_codes.code IS 'Código de 6 dígitos generado aleatoriamente';
COMMENT ON COLUMN public.otp_codes.expires_at IS 'Timestamp de expiración del código (5 minutos típicamente)';
COMMENT ON COLUMN public.otp_codes.attempts IS 'Número de intentos de verificación fallidos';
