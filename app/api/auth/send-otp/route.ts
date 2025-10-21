import { NextRequest, NextResponse } from 'next/server';
import { getUserByPhone, createOTPCode } from '@/lib/supabase-client';
import { normalizePhoneNumber } from '@/lib/phone-utils';
import { z } from 'zod';

// Schema de validación
const sendOTPSchema = z.object({
  phone: z.string()
    .min(10, 'Número de teléfono inválido')
    .max(20, 'Número de teléfono inválido')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido (debe incluir código de país)'),
  name: z.string().optional()
});

// Generar código OTP de 6 dígitos
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Enviar OTP vía n8n → Twilio → WhatsApp
async function sendOTPViaWhatsApp(phone: string, code: string, name?: string) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_SEND_OTP_URL;

  if (!n8nWebhookUrl) {
    console.warn('⚠️ N8N_WEBHOOK_SEND_OTP_URL no configurada, saltando envío de WhatsApp');
    console.log(`📱 [DESARROLLO] Código OTP para ${phone}: ${code}`);
    return;
  }

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code,
        name: name || 'Usuario',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`n8n webhook falló: ${response.status}`);
    }

    console.log(`✅ OTP enviado exitosamente a ${phone}`);
  } catch (error) {
    console.error('❌ Error enviando OTP vía n8n:', error);
    throw new Error('Error al enviar código de verificación');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parsear y validar el body
    const body = await request.json();
    const validatedData = sendOTPSchema.parse(body);

    const { phone, name } = validatedData;

    // Normalizar el número de teléfono
    const normalizedPhone = normalizePhoneNumber(phone);

    // Verificar si el usuario ya existe
    const existingUser = await getUserByPhone(normalizedPhone);
    const isNewUser = !existingUser;

    // Generar código OTP
    const otpCode = generateOTPCode();

    // Guardar OTP en base de datos
    await createOTPCode(normalizedPhone, otpCode, 5); // Expira en 5 minutos

    // Enviar OTP por WhatsApp
    await sendOTPViaWhatsApp(normalizedPhone, otpCode, name);

    // Responder al frontend
    return NextResponse.json({
      success: true,
      message: 'Código enviado exitosamente',
      isNewUser,
      expiresIn: 300 // segundos (5 minutos)
    });

  } catch (error) {
    console.error('Error en send-otp:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Datos inválidos', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
