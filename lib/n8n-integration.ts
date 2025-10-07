// Integración con n8n para procesar webhooks de Mercado Pago
import { envConfig } from './env-config';

export interface PaymentWebhookData {
  paymentId: string;
  status: 'approved' | 'rejected' | 'pending' | 'cancelled';
  statusDetail: string;
  amount: number;
  currency: string;
  externalReference: string;
  payerEmail?: string;
  payerId?: string;
  planId: string;
  timestamp: string;
  rawData: any;
}

export interface N8nWebhookPayload {
  event: 'payment_approved' | 'payment_rejected' | 'payment_pending' | 'payment_cancelled';
  data: PaymentWebhookData;
  source: 'mercadopago';
  timestamp: string;
}

/**
 * Envía datos del webhook de Mercado Pago a n8n
 */
export async function sendToN8n(payload: N8nWebhookPayload): Promise<boolean> {
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      console.warn('⚠️ N8N_WEBHOOK_URL no configurado, saltando envío a n8n');
      return false;
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY || ''}`,
        'X-Source': 'zecu-mercadopago-webhook',
        'X-Event-Type': payload.event,
      },
      body: JSON.stringify(payload),
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('❌ Error enviando a n8n:', {
        status: response.status,
        statusText: response.statusText,
        url: n8nWebhookUrl
      });
      return false;
    }

    const result = await response.json();
    console.log('✅ Datos enviados exitosamente a n8n:', {
      event: payload.event,
      paymentId: payload.data.paymentId,
      n8nResponse: result
    });

    return true;

  } catch (error) {
    console.error('❌ Error enviando datos a n8n:', error);
    return false;
  }
}

/**
 * Procesa datos de pago de Mercado Pago y los formatea para n8n
 */
export function processPaymentDataForN8n(
  paymentInfo: any,
  event: N8nWebhookPayload['event']
): N8nWebhookPayload {
  const planId = extractPlanFromReference(paymentInfo.external_reference);
  
  const webhookData: PaymentWebhookData = {
    paymentId: paymentInfo.id.toString(),
    status: paymentInfo.status,
    statusDetail: paymentInfo.status_detail,
    amount: paymentInfo.transaction_amount,
    currency: paymentInfo.currency_id,
    externalReference: paymentInfo.external_reference,
    payerEmail: paymentInfo.payer?.email,
    payerId: paymentInfo.payer?.id?.toString(),
    planId,
    timestamp: new Date().toISOString(),
    rawData: paymentInfo
  };

  return {
    event,
    data: webhookData,
    source: 'mercadopago',
    timestamp: new Date().toISOString()
  };
}

/**
 * Extrae el plan de la referencia externa
 */
function extractPlanFromReference(externalReference: string): string {
  if (!externalReference) return 'unknown';
  
  // El formato es: "zecu-{planId}-{timestamp}"
  const parts = externalReference.split('-');
  return parts[1] || 'unknown';
}

/**
 * Valida que los datos del webhook sean válidos
 */
export function validateWebhookData(data: any): boolean {
  return !!(
    data.id &&
    data.status &&
    data.transaction_amount &&
    data.currency_id
  );
}

