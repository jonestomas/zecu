import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { 
  sendToN8n, 
  processPaymentDataForN8n, 
  validateWebhookData 
} from '@/lib/n8n-integration';

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
    
    console.log('🔔 Webhook de Mercado Pago recibido:', {
      type: body.type,
      dataId: body.data?.id,
      timestamp: new Date().toISOString()
    });
    
    // Verificar que sea una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      try {
        // Obtener información completa del pago desde Mercado Pago
        const paymentInfo = await payment.get({ id: paymentId });
        
        console.log('💳 Información del pago obtenida:', {
          id: paymentInfo.id,
          status: paymentInfo.status,
          status_detail: paymentInfo.status_detail,
          amount: paymentInfo.transaction_amount,
          currency: paymentInfo.currency_id,
          external_reference: paymentInfo.external_reference,
          payer_email: paymentInfo.payer?.email
        });

        // Validar datos del webhook
        if (!validateWebhookData(paymentInfo)) {
          console.error('❌ Datos del webhook inválidos');
          return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
        }

        // Determinar el evento para n8n
        let n8nEvent: 'payment_approved' | 'payment_rejected' | 'payment_pending' | 'payment_cancelled';
        
        switch (paymentInfo.status) {
          case 'approved':
            n8nEvent = 'payment_approved';
            await handleApprovedPayment(paymentInfo);
            break;
          case 'rejected':
            n8nEvent = 'payment_rejected';
            await handleRejectedPayment(paymentInfo);
            break;
          case 'pending':
            n8nEvent = 'payment_pending';
            await handlePendingPayment(paymentInfo);
            break;
          case 'cancelled':
            n8nEvent = 'payment_cancelled';
            await handleCancelledPayment(paymentInfo);
            break;
          default:
            console.log('⚠️ Estado de pago no manejado:', paymentInfo.status);
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // Enviar datos a n8n
        try {
          const n8nPayload = processPaymentDataForN8n(paymentInfo, n8nEvent);
          const n8nSuccess = await sendToN8n(n8nPayload);
          
          if (n8nSuccess) {
            console.log('✅ Datos enviados exitosamente a n8n');
          } else {
            console.warn('⚠️ Error enviando datos a n8n, pero continuando procesamiento local');
          }
        } catch (n8nError) {
          console.error('❌ Error enviando a n8n:', n8nError);
          // No fallar el webhook si n8n falla
        }

      } catch (paymentError) {
        console.error('❌ Error obteniendo información del pago:', paymentError);
        return NextResponse.json(
          { error: 'Error fetching payment info' },
          { status: 500 }
        );
      }
    }

    // Responder con 200 para confirmar recepción
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// Funciones para manejar diferentes estados de pago
async function handleApprovedPayment(paymentInfo: any) {
  console.log('✅ Pago aprobado:', paymentInfo.id);
  
  const planId = extractPlanFromReference(paymentInfo.external_reference);
  const userEmail = paymentInfo.payer?.email;
  
  console.log(`🎉 Activando plan ${planId} para ${userEmail}`);
  
  // Lógica local adicional (si es necesaria)
  // Los datos principales se envían a n8n para procesamiento
}

async function handleRejectedPayment(paymentInfo: any) {
  console.log('❌ Pago rechazado:', paymentInfo.id);
  
  const planId = extractPlanFromReference(paymentInfo.external_reference);
  const userEmail = paymentInfo.payer?.email;
  
  console.log(`💔 Pago rechazado para plan ${planId} de ${userEmail}`);
  
  // Lógica local adicional (si es necesaria)
  // Los datos principales se envían a n8n para procesamiento
}

async function handlePendingPayment(paymentInfo: any) {
  console.log('⏳ Pago pendiente:', paymentInfo.id);
  
  const planId = extractPlanFromReference(paymentInfo.external_reference);
  const userEmail = paymentInfo.payer?.email;
  
  console.log(`⏰ Pago pendiente para plan ${planId} de ${userEmail}`);
  
  // Lógica local adicional (si es necesaria)
  // Los datos principales se envían a n8n para procesamiento
}

async function handleCancelledPayment(paymentInfo: any) {
  console.log('🚫 Pago cancelado:', paymentInfo.id);
  
  const planId = extractPlanFromReference(paymentInfo.external_reference);
  const userEmail = paymentInfo.payer?.email;
  
  console.log(`🚫 Pago cancelado para plan ${planId} de ${userEmail}`);
  
  // Lógica local adicional (si es necesaria)
  // Los datos principales se envían a n8n para procesamiento
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

