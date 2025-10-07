// Servicio para manejar suscripciones de usuarios
import { UserSubscription, SubscriptionEventData, SubscriptionEvent, PLANS } from './plans';
import { sendToN8n } from './n8n-integration';

export interface CreateSubscriptionData {
  whatsappNumber: string;
  email?: string;
  planId: string;
  source?: 'website' | 'whatsapp' | 'admin';
  metadata?: any;
}

export class SubscriptionService {
  /**
   * Crea una nueva suscripción
   */
  static async createSubscription(data: CreateSubscriptionData): Promise<UserSubscription> {
    const plan = PLANS[data.planId];
    if (!plan) {
      throw new Error(`Plan ${data.planId} no encontrado`);
    }

    const now = new Date();
    const endDate = this.calculateEndDate(now, data.planId);

    const subscription: UserSubscription = {
      id: this.generateSubscriptionId(),
      whatsappNumber: data.whatsappNumber,
      email: data.email,
      planId: data.planId,
      planType: plan.type,
      status: 'active',
      startDate: now,
      endDate,
      createdAt: now,
      updatedAt: now,
      metadata: {
        source: data.source || 'website',
        ...data.metadata
      }
    };

    // Enviar evento a n8n
    await this.sendSubscriptionEvent({
      event: 'subscription_created',
      userId: subscription.id,
      whatsappNumber: subscription.whatsappNumber,
      planId: subscription.planId,
      planType: subscription.planType,
      timestamp: now.toISOString(),
      metadata: subscription.metadata
    });

    return subscription;
  }

  /**
   * Activa una suscripción (para plan gratuito)
   */
  static async activateSubscription(subscriptionId: string): Promise<UserSubscription> {
    // En un escenario real, esto vendría de la base de datos
    // Por ahora simulamos la activación
    const subscription = await this.getSubscriptionById(subscriptionId);
    
    if (!subscription) {
      throw new Error('Suscripción no encontrada');
    }

    subscription.status = 'active';
    subscription.updatedAt = new Date();

    // Enviar evento a n8n
    await this.sendSubscriptionEvent({
      event: 'subscription_activated',
      userId: subscription.id,
      whatsappNumber: subscription.whatsappNumber,
      planId: subscription.planId,
      planType: subscription.planType,
      timestamp: new Date().toISOString()
    });

    return subscription;
  }

  /**
   * Verifica si una suscripción está activa
   */
  static async isSubscriptionActive(whatsappNumber: string): Promise<boolean> {
    const subscription = await this.getSubscriptionByWhatsApp(whatsappNumber);
    return subscription ? subscription.status === 'active' && new Date() <= subscription.endDate : false;
  }

  /**
   * Obtiene la suscripción por número de WhatsApp
   */
  static async getSubscriptionByWhatsApp(whatsappNumber: string): Promise<UserSubscription | null> {
    // En un escenario real, esto consultaría la base de datos
    // Por ahora simulamos con datos en memoria
    return null;
  }

  /**
   * Obtiene la suscripción por ID
   */
  static async getSubscriptionById(subscriptionId: string): Promise<UserSubscription | null> {
    // En un escenario real, esto consultaría la base de datos
    return null;
  }

  /**
   * Calcula la fecha de fin de suscripción
   */
  private static calculateEndDate(startDate: Date, planId: string): Date {
    const plan = PLANS[planId];
    if (!plan) return startDate;
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);
    return endDate;
  }

  /**
   * Genera un ID único para la suscripción
   */
  private static generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Envía evento de suscripción a n8n
   */
  private static async sendSubscriptionEvent(eventData: SubscriptionEventData): Promise<void> {
    try {
      const n8nPayload = {
        event: 'subscription_event',
        data: eventData,
        source: 'zecu-subscription-service',
        timestamp: new Date().toISOString()
      };

      await sendToN8n(n8nPayload);
      console.log('✅ Evento de suscripción enviado a n8n:', eventData.event);
    } catch (error) {
      console.error('❌ Error enviando evento de suscripción a n8n:', error);
      // No fallar si n8n no está disponible
    }
  }

  /**
   * Valida un número de WhatsApp
   */
  static validateWhatsAppNumber(number: string): boolean {
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  }

  /**
   * Formatea un número de WhatsApp
   */
  static formatWhatsAppNumber(number: string): string {
    let formattedNumber = number.replace(/\D/g, '');
    
    // Si no tiene código de país, asumir Argentina (+54)
    if (!formattedNumber.startsWith('54')) {
      formattedNumber = '54' + formattedNumber;
    }
    
    return '+' + formattedNumber;
  }
}




