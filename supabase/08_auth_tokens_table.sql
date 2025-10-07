-- Tabla para almacenar tokens de autenticación passwordless
CREATE TABLE IF NOT EXISTS auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('magic_link', 'otp')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT unique_token UNIQUE (token)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_type ON auth_tokens(type);

-- Crear función para limpiar tokens expirados automáticamente
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_tokens 
    WHERE expires_at < NOW() 
    OR (used = TRUE AND used_at < NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE auth_tokens IS 'Tokens de autenticación passwordless (Magic Links y OTPs)';
COMMENT ON COLUMN auth_tokens.type IS 'Tipo de token: magic_link (link mágico) o otp (código de 6 dígitos)';
COMMENT ON COLUMN auth_tokens.expires_at IS 'Fecha de expiración del token';
COMMENT ON COLUMN auth_tokens.used IS 'Indica si el token ya fue utilizado';
COMMENT ON COLUMN auth_tokens.used_at IS 'Fecha y hora en que se usó el token';

-- Crear políticas RLS (Row Level Security)
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción
CREATE POLICY "Allow token creation" ON auth_tokens
FOR INSERT WITH CHECK (true);

-- Política para permitir lectura solo del propio token
CREATE POLICY "Allow token read" ON auth_tokens
FOR SELECT USING (true);

-- Política para permitir actualización
CREATE POLICY "Allow token update" ON auth_tokens
FOR UPDATE USING (true);
