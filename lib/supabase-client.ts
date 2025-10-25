import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase para el servidor (con service role key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida en las variables de entorno');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY debe estar definida');
}

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no configurada, usando ANON_KEY (menos seguro)');
}

// Cliente con service role para operaciones del servidor
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Tipos de datos
export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  country?: string;
  city?: string;
  plan: 'free' | 'plus';
  plan_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OTPCode {
  id: string;
  phone: string;
  code: string;
  expires_at: string;
  verified: boolean;
  attempts: number;
  created_at: string;
}

// Funciones helper para usuarios
export async function getUserByPhone(phone: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('phone', phone).single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el usuario
      return null;
    }
    throw error;
  }

  return data;
}

export async function createUser(userData: {
  phone: string;
  name?: string;
  email?: string;
  plan?: 'free' | 'plus';
}): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      phone: userData.phone,
      name: userData.name,
      email: userData.email,
      plan: userData.plan || 'free',
      plan_expires_at:
        userData.plan === 'plus'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
          : null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserPlan(phone: string, plan: 'free' | 'plus'): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      plan,
      plan_expires_at:
        plan === 'plus' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
    })
    .eq('phone', phone)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Funciones helper para OTP
export async function createOTPCode(
  phone: string,
  code: string,
  expiresInMinutes = 5
): Promise<OTPCode> {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const { data, error } = await supabaseAdmin
    .from('otp_codes')
    .insert({
      phone,
      code,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function verifyOTPCode(
  phone: string,
  code: string
): Promise<{ valid: boolean; otpRecord?: OTPCode }> {
  // Buscar código OTP válido
  const { data, error } = await supabaseAdmin
    .from('otp_codes')
    .select('*')
    .eq('phone', phone)
    .eq('code', code)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró código válido
      return { valid: false };
    }
    throw error;
  }

  // Verificar intentos
  if (data.attempts >= 3) {
    return { valid: false };
  }

  // Marcar como verificado
  const { error: updateError } = await supabaseAdmin
    .from('otp_codes')
    .update({ verified: true })
    .eq('id', data.id);

  if (updateError) {
    throw updateError;
  }

  return { valid: true, otpRecord: data };
}

export async function incrementOTPAttempts(phone: string, code: string): Promise<void> {
  await supabaseAdmin.rpc('increment_otp_attempts', {
    p_phone: phone,
    p_code: code,
  });
}

export async function invalidateAllOTPCodes(phone: string): Promise<void> {
  await supabaseAdmin
    .from('otp_codes')
    .update({ verified: true })
    .eq('phone', phone)
    .eq('verified', false);
}
