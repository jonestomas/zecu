import { Polar } from "@polar-sh/sdk";

// Validar que las variables de entorno estén configuradas
if (!process.env.POLAR_ACCESS_TOKEN) {
  console.warn('⚠️ POLAR_ACCESS_TOKEN no está configurado');
}

// Inicializar el cliente de Polar
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || '',
  server: 'sandbox' // Usar production siempre (token real)
});

// Configuración de productos/planes
export const POLAR_PRODUCTS = {
  plus: {
    productId: process.env.POLAR_PRODUCT_ID || '6a3b863d-482e-45ba-a563-f7c8398184cb',
    priceId: process.env.POLAR_PRICE_ID_PLUS || '',
    name: 'Zecu Plus',
    price: 10, // USD
    currency: 'USD',
    interval: 'month' as const,
    features: [
      '20 consultas al mes',
      'Análisis avanzado con IA',
      'Soporte prioritario',
      'Detección de estafas en tiempo real'
    ]
  },
  premium: {
    priceId: process.env.POLAR_PRICE_ID_PREMIUM || '',
    name: 'Zecu Premium',
    price: 25, // USD
    currency: 'USD',
    interval: 'month' as const,
    features: [
      '50 consultas al mes',
      'Análisis premium con IA',
      'Soporte 24/7',
      'Detección avanzada de estafas',
      'Reportes mensuales'
    ]
  }
} as const;

// URL de callback exitoso
export const getSuccessUrl = (checkoutId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/payment/polar/success?checkout_id=${checkoutId}`;
};

// Tipo para los planes disponibles
export type PolarPlan = keyof typeof POLAR_PRODUCTS;
