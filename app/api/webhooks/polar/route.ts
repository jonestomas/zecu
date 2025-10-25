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
        
        // Guardar el ID de suscripción en la base de datos
        const subscriptionMetadata = event.data.metadata as Record<string, any>;
        const subscriptionUserId = subscriptionMetadata?.userId;
        
        if (subscriptionUserId) {
          await supabaseAdmin
            .from('users')
            .update({
              polar_subscription_id: event.data.id,
            })
            .eq('id', subscriptionUserId);
          
          console.log(`✅ ID de suscripción ${event.data.id} guardado para usuario ${subscriptionUserId}`);
        }
        break;

      case 'subscription.updated':
        console.log(`🔄 Suscripción actualizada: ${event.data.id}`);
        break;

      case 'subscription.canceled':
        console.log(`❌ Suscripción cancelada: ${event.data.id}`);
        
        // Actualizar usuario a plan free cuando se cancela la suscripción
        await supabaseAdmin
          .from('users')
          .update({
            plan: 'free',
            plan_expires_at: null,
            polar_subscription_id: null,
          })
          .eq('polar_subscription_id', event.data.id);
        
        console.log(`✅ Usuario actualizado a plan free por cancelación de suscripción ${event.data.id}`);
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
