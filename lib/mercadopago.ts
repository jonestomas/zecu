import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

export const mercadopago = {
  preference: new Preference(client)
};

// Tipos para los planes
export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

// Definición de los planes
export const plans: Record<string, Plan> = {
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 5499,
    currency: 'ARS',
    description: 'Ideal para protección diaria completa',
    features: [
      '50 análisis de mensajes al mes',
      'Detección avanzada de estafas',
      'Análisis de imágenes y audios',
      'Guía paso a paso personalizada',
      'Soporte prioritario 24/7',
      'Alertas en tiempo real'
    ]
  }
};

// Función para crear una preferencia de pago
export async function createPaymentPreference(planId: string, userEmail?: string) {
  const plan = plans[planId];
  
  if (!plan) {
    throw new Error('Plan no encontrado');
  }

  // Asegurar que tenemos una URL base válida
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const preference = {
    items: [
      {
        id: plan.id,
        title: `Plan ${plan.name} - Zecu`,
        description: plan.description,
        quantity: 1,
        currency_id: plan.currency,
        unit_price: plan.price
      }
    ],
    payer: {
      email: userEmail || 'test@test.com'
    },
    back_urls: {
      success: `${baseUrl}/payment/success`,
      failure: `${baseUrl}/payment/failure`,
      pending: `${baseUrl}/payment/pending`
    },
    external_reference: `zecu-${plan.id}-${Date.now()}`,
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    statement_descriptor: 'ZECU'
  };

  try {
    const response = await mercadopago.preference.create({ body: preference });
    return response;
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw error;
  }
}
