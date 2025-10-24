-- Agregar campos de localización a la tabla users
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Comentarios para documentación
COMMENT ON COLUMN public.users.country IS 'País del usuario';
COMMENT ON COLUMN public.users.city IS 'Ciudad/Localidad del usuario';

-- Verificar que se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('country', 'city');
