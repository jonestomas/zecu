import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc',
  },
});

export const _mercadopago = {
  preference: new Preference(client),
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
      'Alertas en tiempo real',
    ],
  },
};

// Datos opcionales del usuario para la preferencia de pago
export interface UserPaymentData {
  userId: string;
  phone: string;
  name?: string;
}

// Función para crear una preferencia de pago
export async function createPaymentPreference(
  planId: string,
  userEmail?: string,
  userData?: UserPaymentData
) {
  const plan = plans[planId];

  if (!plan) {
    throw new Error('Plan no encontrado');
  }

  // Asegurar que tenemos una URL base válida
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Crear referencia externa con el ID del usuario si está disponible
  const externalReference = userData
    ? `zecu-${plan.id}-${userData.userId}-${Date.now()}`
    : `zecu-${plan.id}-${Date.now()}`;

  const preference = {
    items: [
      {
        id: plan.id,
        title: `Plan ${plan.name} - Zecu`,
        description: plan.description,
        quantity: 1,
        currency_id: plan.currency,
        unit_price: plan.price,
      },
    ],
    payer: {
      email: userEmail || 'test@test.com',
      ...(userData?.name && { name: userData.name }),
      ...(userData?.phone && { phone: { number: userData.phone } }),
    },
    back_urls: {
      success: `${baseUrl}/payment/success`,
      failure: `${baseUrl}/payment/failure`,
      pending: `${baseUrl}/payment/pending`,
    },
    external_reference: externalReference,
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    statement_descriptor: 'ZECU',
    // Metadata adicional para el webhook
    metadata: {
      user_id: userData?.userId,
      user_phone: userData?.phone,
      plan_id: planId,
    },
  };

  try {
    const response = await mercadopago.preference.create({ body: preference });
    console.warn(
      `💳 Preferencia creada: ${response.id} para usuario ${userData?.userId || 'anónimo'}`
    );
    return response;
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw error;
  }
}
