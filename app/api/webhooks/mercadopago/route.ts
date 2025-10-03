import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar que sea una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      // Aquí puedes agregar lógica para:
      // 1. Verificar el estado del pago con la API de Mercado Pago
      // 2. Actualizar el estado de la suscripción en tu base de datos
      // 3. Enviar emails de confirmación
      // 4. Activar el acceso al servicio
      
      console.log('Payment notification received:', {
        paymentId,
        type: body.type,
        action: body.action
      });

      // Ejemplo de cómo podrías manejar diferentes estados
      switch (body.action) {
        case 'payment.created':
          console.log('Pago creado:', paymentId);
          break;
        case 'payment.updated':
          console.log('Pago actualizado:', paymentId);
          // Aquí verificarías el estado del pago y actualizarías tu DB
          break;
        default:
          console.log('Acción no manejada:', body.action);
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

// Manejar GET para verificación del webhook
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}

