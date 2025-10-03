import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  }
});

const payment = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook received:', body);
    
    // Verificar que sea una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      try {
        // Obtener información completa del pago desde Mercado Pago
        const paymentInfo = await payment.get({ id: paymentId });
        
        console.log('Payment info:', {
          id: paymentInfo.id,
          status: paymentInfo.status,
          status_detail: paymentInfo.status_detail,
          amount: paymentInfo.transaction_amount,
          currency: paymentInfo.currency_id,
          external_reference: paymentInfo.external_reference,
          payer_email: paymentInfo.payer?.email
        });

        // Procesar según el estado del pago
        switch (paymentInfo.status) {
          case 'approved':
            await handleApprovedPayment(paymentInfo);
            break;
          case 'rejected':
            await handleRejectedPayment(paymentInfo);
            break;
          case 'pending':
            await handlePendingPayment(paymentInfo);
            break;
          case 'cancelled':
            await handleCancelledPayment(paymentInfo);
            break;
          default:
            console.log('Estado de pago no manejado:', paymentInfo.status);
        }

      } catch (paymentError) {
        console.error('Error fetching payment info:', paymentError);
      }
    }

    // Responder con 200 para confirmar recepción
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// Funciones para manejar diferentes estados de pago
async function handleApprovedPayment(paymentInfo: any) {
  console.log('✅ Pago aprobado:', paymentInfo.id);
  
  // Aquí implementarías:
  // 1. Activar la suscripción del usuario
  // 2. Enviar email de confirmación
  // 3. Actualizar base de datos
  // 4. Registrar en analytics
  
  // Ejemplo de lógica:
  const planId = extractPlanFromReference(paymentInfo.external_reference);
  const userEmail = paymentInfo.payer?.email;
  
  console.log(`Activando plan ${planId} para ${userEmail}`);
}

async function handleRejectedPayment(paymentInfo: any) {
  console.log('❌ Pago rechazado:', paymentInfo.id);
  
  // Implementar lógica para pagos rechazados:
  // 1. Notificar al usuario
  // 2. Registrar intento fallido
  // 3. Sugerir métodos alternativos
}

async function handlePendingPayment(paymentInfo: any) {
  console.log('⏳ Pago pendiente:', paymentInfo.id);
  
  // Implementar lógica para pagos pendientes:
  // 1. Notificar al usuario sobre el estado
  // 2. Configurar seguimiento del pago
}

async function handleCancelledPayment(paymentInfo: any) {
  console.log('🚫 Pago cancelado:', paymentInfo.id);
  
  // Implementar lógica para pagos cancelados:
  // 1. Limpiar datos temporales
  // 2. Registrar cancelación
}

// Función auxiliar para extraer el plan de la referencia externa
function extractPlanFromReference(externalReference: string): string {
  // El formato es: "zecu-{planId}-{timestamp}"
  if (externalReference) {
    const parts = externalReference.split('-');
    return parts[1] || 'unknown';
  }
  return 'unknown';
}

// Manejar GET para verificación del webhook
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}

