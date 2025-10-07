import { NextRequest, NextResponse } from 'next/server';
import { sendToN8n, processPaymentDataForN8n } from '@/lib/n8n-integration';

// Endpoint para probar la integración con n8n
export async function POST(request: NextRequest) {
  try {
    const { event = 'payment_approved', planId = 'basic' } = await request.json();

    // Crear datos de prueba
    const mockPaymentInfo = {
      id: Math.floor(Math.random() * 1000000),
      status: event.replace('payment_', ''),
      status_detail: 'accredited',
      transaction_amount: planId === 'basic' ? 1999 : 5999,
      currency_id: 'ARS',
      external_reference: `zecu-${planId}-${Date.now()}`,
      payer: {
        email: 'test@ejemplo.com',
        id: '12345678'
      }
    };

    console.log('🧪 Enviando datos de prueba a n8n:', {
      event,
      planId,
      paymentId: mockPaymentInfo.id
    });

    // Procesar y enviar a n8n
    const n8nPayload = processPaymentDataForN8n(mockPaymentInfo, event as any);
    const success = await sendToN8n(n8nPayload);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Datos enviados exitosamente a n8n',
        payload: n8nPayload
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error enviando datos a n8n',
        payload: n8nPayload
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en test de n8n:', error);
    return NextResponse.json(
      { error: 'Error testing n8n integration' },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar configuración
export async function GET() {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  const n8nApiKey = process.env.N8N_API_KEY;

  return NextResponse.json({
    n8nConfigured: !!n8nUrl,
    n8nUrl: n8nUrl ? 'Configurado' : 'No configurado',
    n8nApiKey: n8nApiKey ? 'Configurado' : 'No configurado',
    timestamp: new Date().toISOString()
  });
}




