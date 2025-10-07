// Definición de planes y suscripciones para Zecu
export interface Plan {
  id: string;
  name: string;
  type: 'free' | 'plus';
  price: number;
  currency: string;
  duration: number; // en días
  features: string[];
  limits: {
    analyses: number; // -1 = ilimitado
    phoneNumbers: number;
    whatsappMessages: number;
  };
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  whatsappNumber: string; // Identificador principal
  email?: string;
  planId: string;
  planType: 'free' | 'plus';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    source: 'website' | 'whatsapp' | 'admin';
    referralCode?: string;
    utmSource?: string;
  };
}

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  action: 'redirect_whatsapp' | 'show_instructions' | 'collect_info' | 'activate_plan';
  order: number;
  isRequired: boolean;
}

// Planes disponibles
export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Plan Gratuito',
    type: 'free',
    price: 0,
    currency: 'USD',
    duration: 7, // 7 días gratis
    features: [
      '10 mensajes por día',
      '3 conversaciones simultáneas',
      'Respuestas básicas',
      'Soporte comunitario',
      'Acceso a tutoriales'
    ],
    limits: {
      analyses: 10,
      phoneNumbers: 1,
      whatsappMessages: 10
    },
    isActive: true
  },
  plus: {
    id: 'plus',
    name: 'Plan Plus',
    type: 'plus',
    price: 19.99,
    currency: 'USD',
    duration: 30, // 30 días
    features: [
      '500 mensajes por día',
      '50 conversaciones simultáneas',
      'Respuestas avanzadas con IA',
      'Soporte prioritario 24/7',
      'Análisis de enlaces',
      'Historial de conversaciones',
      'Integraciones básicas',
      'Análisis de uso'
    ],
    limits: {
      analyses: 500,
      phoneNumbers: 1,
      whatsappMessages: 500
    },
    isActive: true
  }
};

// Planes futuros (TBD)
export const FUTURE_PLANS = {
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;

// Pasos del onboarding para plan gratuito
export const FREE_PLAN_ONBOARDING: OnboardingStep[] = [
  {
    id: 'welcome',
    name: 'Bienvenida',
    description: 'Te damos la bienvenida a Zecu',
    action: 'show_instructions',
    order: 1,
    isRequired: true
  },
  {
    id: 'whatsapp_redirect',
    name: 'Conectar WhatsApp',
    description: 'Envía un mensaje a nuestro bot de WhatsApp para activar tu plan gratuito',
    action: 'redirect_whatsapp',
    order: 2,
    isRequired: true
  },
  {
    id: 'activation',
    name: 'Activación',
    description: 'Tu plan gratuito se activará automáticamente',
    action: 'activate_plan',
    order: 3,
    isRequired: true
  }
];

// Eventos de suscripción
export type SubscriptionEvent = 
  | 'subscription_created'
  | 'subscription_activated'
  | 'subscription_expired'
  | 'subscription_cancelled'
  | 'subscription_upgraded'
  | 'subscription_downgraded';

export interface SubscriptionEventData {
  event: SubscriptionEvent;
  userId: string;
  whatsappNumber: string;
  planId: string;
  planType: 'free' | 'plus';
  timestamp: string;
  metadata?: any;
}

// Utilidades
export function getPlanById(planId: string): Plan | null {
  return PLANS[planId] || null;
}

export function isPlanActive(planId: string): boolean {
  const plan = getPlanById(planId);
  return plan ? plan.isActive : false;
}

export function calculateEndDate(startDate: Date, planId: string): Date {
  const plan = getPlanById(planId);
  if (!plan) return startDate;
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.duration);
  return endDate;
}

export function isSubscriptionExpired(subscription: UserSubscription): boolean {
  return new Date() > subscription.endDate;
}

export function getRemainingDays(subscription: UserSubscription): number {
  const now = new Date();
  const diffTime = subscription.endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}



