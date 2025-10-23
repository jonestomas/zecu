import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookPayload } from '@polar-sh/sdk/webhooks';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('❌ POLAR_WEBHOOK_SECRET no está configurado');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Obtener headers necesarios para validación
    const signature = request.headers.get('polar-signature');
    const timestamp = request.headers.get('polar-timestamp');

    if (!signature || !timestamp) {
      console.error('❌ Headers de signature faltantes');
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
    }

    // Validar el webhook
    let event;
    try {
      event = validateWebhookPayload(body, webhookSecret, signature, timestamp);
    } catch (err) {
      console.error('❌ Error validando webhook de Polar.sh:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`📩 Webhook de Polar.sh recibido: ${event.type}`);

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.created':
        console.log(`✅ Checkout creado: ${event.data.id}`);
        break;

      case 'checkout.updated':
        console.log(`🔄 Checkout actualizado: ${event.data.id}`);
        
        // Si el checkout fue confirmado, actualizar el usuario
        if (event.data.status === 'confirmed') {
          const metadata = event.data.metadata as Record<string, any>;
          const userId = metadata?.userId;
          const plan = metadata?.plan;

          if (userId && plan) {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await supabaseAdmin
              .from('users')
              .update({
                plan: plan,
                plan_expires_at: expiresAt.toISOString(),
              })
              .eq('id', userId);

            console.log(`✅ Plan ${plan} activado para usuario ${userId} vía webhook`);
          }
        }
        break;

      case 'subscription.created':
        console.log(`✅ Suscripción creada: ${event.data.id}`);
        break;

      case 'subscription.updated':
        console.log(`🔄 Suscripción actualizada: ${event.data.id}`);
        break;

      case 'subscription.canceled':
        console.log(`❌ Suscripción cancelada: ${event.data.id}`);
        // Aquí podrías manejar la cancelación automática
        break;

      default:
        console.log(`📩 Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Error procesando webhook de Polar.sh:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

