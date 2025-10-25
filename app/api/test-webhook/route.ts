import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // Simular un webhook de Mercado Pago
    const response = await fetch('http://localhost:3002/api/webhooks/mercadopago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: Math.floor(Math.random() * 100000000).toString(),
        },
      }),
    });

    const result = await response.json();

    return NextResponse.json({
      message: 'Webhook de prueba enviado',
      webhookResponse: result,
      status: response.status,
    });
  } catch (error) {
    console.error('Error enviando webhook de prueba:', error);
    return NextResponse.json({ error: 'Error enviando webhook de prueba' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para probar webhooks',
    usage: 'POST a este endpoint para simular un webhook',
  });
}
