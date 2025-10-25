import crypto from 'crypto';

export function validateWebhookSignature(
  body: string,
  xSignature: string,
  xRequestId: string
): boolean {
  try {
    // Obtener el secret del webhook (configurar en Mercado Pago)
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

    if (!secret) {
      console.warn('MERCADOPAGO_WEBHOOK_SECRET no configurado');
      return true; // En desarrollo, permitir sin validación
    }

    // Extraer timestamp y signature del header
    const parts = xSignature.split(',');
    let ts = '';
    let hash = '';

    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') hash = value;
    });

    // Crear el string para verificar
    const stringToSign = `id:${xRequestId};request-id:${xRequestId};ts:${ts};`;

    // Calcular la signature esperada
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex');

    return expectedSignature === hash;
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}

export function isRecentWebhook(timestamp: string, maxAgeMinutes: number = 5): boolean {
  try {
    const webhookTime = parseInt(timestamp) * 1000; // Convertir a millisegundos
    const currentTime = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000; // Convertir a millisegundos

    return currentTime - webhookTime <= maxAge;
  } catch {
    return false;
  }
}
