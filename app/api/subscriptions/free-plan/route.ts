import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/subscription-service';
import { z } from 'zod';

// Schema de validación para el registro del plan gratuito
const freePlanSchema = z.object({
  whatsappNumber: z.string()
    .min(10, 'Número de WhatsApp inválido')
    .max(15, 'Número de WhatsApp inválido')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de número inválido'),
  email: z.string().email('Email inválido').optional(),
  source: z.enum(['website', 'whatsapp', 'admin']).default('website'),
  metadata: z.object({
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    referralCode: z.string().optional(),
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = freePlanSchema.parse(body);
    
    // Formatear número de WhatsApp
    const formattedNumber = SubscriptionService.formatWhatsAppNumber(validatedData.whatsappNumber);
    
    // Verificar si ya existe una suscripción activa
    const isActive = await SubscriptionService.isSubscriptionActive(formattedNumber);
    
    if (isActive) {
      return NextResponse.json({
        success: false,
        message: 'Ya tienes una suscripción activa',
        code: 'SUBSCRIPTION_EXISTS'
      }, { status: 400 });
    }

    // Crear suscripción del plan gratuito
    const subscription = await SubscriptionService.createSubscription({
      whatsappNumber: formattedNumber,
      email: validatedData.email,
      planId: 'free',
      source: validatedData.source,
      metadata: validatedData.metadata
    });

    console.log('🎉 Plan gratuito creado:', {
      subscriptionId: subscription.id,
      whatsappNumber: subscription.whatsappNumber,
      planId: subscription.planId,
      endDate: subscription.endDate
    });

    return NextResponse.json({
      success: true,
      message: 'Plan gratuito activado exitosamente',
      data: {
        subscriptionId: subscription.id,
        whatsappNumber: subscription.whatsappNumber,
        planId: subscription.planId,
        planType: subscription.planType,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status
      }
    });

  } catch (error) {
    console.error('❌ Error creando plan gratuito:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Endpoint para verificar el estado de una suscripción
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const whatsappNumber = searchParams.get('whatsapp');
    
    if (!whatsappNumber) {
      return NextResponse.json({
        success: false,
        message: 'Número de WhatsApp requerido'
      }, { status: 400 });
    }

    const formattedNumber = SubscriptionService.formatWhatsAppNumber(whatsappNumber);
    const isActive = await SubscriptionService.isSubscriptionActive(formattedNumber);
    
    return NextResponse.json({
      success: true,
      data: {
        whatsappNumber: formattedNumber,
        isActive,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error verificando suscripción:', error);
    return NextResponse.json({
      success: false,
      message: 'Error verificando suscripción'
    }, { status: 500 });
  }
}




