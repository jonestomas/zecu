// Sistema de autenticación sin contraseña
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Duración de validez de tokens/códigos
const TOKEN_EXPIRY_MINUTES = 15;
const OTP_EXPIRY_MINUTES = 10;

export interface AuthSession {
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
}

/**
 * Generar Magic Link para autenticación
 */
export async function generateMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Guardar token en la base de datos (necesitarás crear esta tabla)
    const { error: tokenError } = await supabase
      .from('auth_tokens')
      .insert([
        {
          user_id: user.id,
          token: token,
          type: 'magic_link',
          expires_at: expiresAt.toISOString(),
          used: false
        }
      ]);

    if (tokenError) {
      console.error('Error al guardar token:', tokenError);
      return { success: false, error: 'Error al generar link' };
    }

    // Enviar email con magic link
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token}`;
    
    // TODO: Integrar con servicio de email (SendGrid, Resend, etc.)
    await sendMagicLinkEmail(user.email, user.name, magicLink);

    return { success: true };
  } catch (error) {
    console.error('Error en generateMagicLink:', error);
    return { success: false, error: 'Error interno' };
  }
}

/**
 * Generar OTP (código de 6 dígitos) para autenticación
 */
export async function generateOTP(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, phone')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Generar OTP de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Guardar OTP en la base de datos
    const { error: otpError } = await supabase
      .from('auth_tokens')
      .insert([
        {
          user_id: user.id,
          token: otp,
          type: 'otp',
          expires_at: expiresAt.toISOString(),
          used: false
        }
      ]);

    if (otpError) {
      console.error('Error al guardar OTP:', otpError);
      return { success: false, error: 'Error al generar código' };
    }

    // Enviar OTP por email
    await sendOTPEmail(user.email, user.name, otp);

    // Opcionalmente, enviar también por WhatsApp
    if (user.phone) {
      await sendOTPWhatsApp(user.phone, otp);
    }

    return { success: true };
  } catch (error) {
    console.error('Error en generateOTP:', error);
    return { success: false, error: 'Error interno' };
  }
}

/**
 * Verificar Magic Link token
 */
export async function verifyMagicLink(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Buscar token en la base de datos
    const { data: authToken, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .eq('type', 'magic_link')
      .single();

    if (tokenError || !authToken) {
      return { success: false, error: 'Link inválido o expirado' };
    }

    // Verificar si el token ya fue usado
    if (authToken.used) {
      return { success: false, error: 'Este link ya fue utilizado' };
    }

    // Verificar si el token expiró
    if (new Date() > new Date(authToken.expires_at)) {
      return { success: false, error: 'Este link ha expirado' };
    }

    // Marcar token como usado
    await supabase
      .from('auth_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('token', token);

    // Actualizar último login del usuario
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authToken.user_id);

    return { success: true, userId: authToken.user_id };
  } catch (error) {
    console.error('Error en verifyMagicLink:', error);
    return { success: false, error: 'Error interno' };
  }
}

/**
 * Verificar OTP (código de 6 dígitos)
 */
export async function verifyOTP(email: string, otp: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Buscar usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Buscar OTP en la base de datos
    const { data: authToken, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('user_id, expires_at, used')
      .eq('token', otp)
      .eq('type', 'otp')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !authToken) {
      return { success: false, error: 'Código inválido' };
    }

    // Verificar si el OTP ya fue usado
    if (authToken.used) {
      return { success: false, error: 'Este código ya fue utilizado' };
    }

    // Verificar si el OTP expiró
    if (new Date() > new Date(authToken.expires_at)) {
      return { success: false, error: 'Este código ha expirado' };
    }

    // Marcar OTP como usado
    await supabase
      .from('auth_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('token', otp);

    // Actualizar último login del usuario
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Error en verifyOTP:', error);
    return { success: false, error: 'Error interno' };
  }
}

/**
 * Crear sesión JWT para el usuario
 */
export function createSession(userId: string, email: string): string {
  // En producción, usa JWT proper library
  const sessionData = {
    userId,
    email,
    issuedAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
  };

  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}

/**
 * Verificar sesión
 */
export function verifySession(token: string): { valid: boolean; userId?: string; email?: string } {
  try {
    const sessionData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (Date.now() > sessionData.expiresAt) {
      return { valid: false };
    }

    return { valid: true, userId: sessionData.userId, email: sessionData.email };
  } catch (error) {
    return { valid: false };
  }
}

// Funciones de envío de emails/WhatsApp (implementar con tu servicio preferido)

async function sendMagicLinkEmail(email: string, name: string, magicLink: string) {
  // TODO: Implementar con SendGrid, Resend, o tu servicio de email
  console.log(`Enviar Magic Link a ${email}:`, magicLink);
  
  // Ejemplo con fetch a servicio de email
  // await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     from: 'Zecubot <noreply@zecubot.com>',
  //     to: email,
  //     subject: 'Tu acceso a Zecubot',
  //     html: `
  //       <h2>Hola ${name}! 👋</h2>
  //       <p>Haz click en el botón para acceder a tu dashboard:</p>
  //       <a href="${magicLink}" style="...">Acceder a mi Dashboard</a>
  //       <p>Este link es válido por 15 minutos.</p>
  //     `
  //   })
  // });
}

async function sendOTPEmail(email: string, name: string, otp: string) {
  // TODO: Implementar con tu servicio de email
  console.log(`Enviar OTP a ${email}:`, otp);
}

async function sendOTPWhatsApp(phone: string, otp: string) {
  // TODO: Implementar con tu servicio de WhatsApp (Twilio, etc.)
  console.log(`Enviar OTP por WhatsApp a ${phone}:`, otp);
}

export default {
  generateMagicLink,
  generateOTP,
  verifyMagicLink,
  verifyOTP,
  createSession,
  verifySession
};
