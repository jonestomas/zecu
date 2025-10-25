// Sistema simple de logging para webhooks
export interface WebhookLog {
  id: string;
  timestamp: string;
  type: string;
  action: string;
  paymentId: string;
  status?: string;
  amount?: number;
  email?: string;
  raw: any;
}

class WebhookLogger {
  private logs: WebhookLog[] = [];
  private maxLogs = 100;

  log(webhookData: any) {
    const log: WebhookLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: webhookData.type || 'unknown',
      action: webhookData.action || 'unknown',
      paymentId: webhookData.data?.id || 'unknown',
      raw: webhookData,
    };

    this.logs.unshift(log); // Agregar al inicio

    // Mantener solo los últimos 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log en consola para debugging
    console.warn('🔔 Webhook recibido:', {
      timestamp: log.timestamp,
      type: log.type,
      action: log.action,
      paymentId: log.paymentId,
    });

    return log;
  }

  updateLog(paymentId: string, paymentInfo: any) {
    const logIndex = this.logs.findIndex(log => log.paymentId === paymentId);
    if (logIndex !== -1) {
      this.logs[logIndex] = {
        ...this.logs[logIndex],
        status: paymentInfo.status,
        amount: paymentInfo.transaction_amount,
        email: paymentInfo.payer?.email,
      };
    }
  }

  getLogs(): WebhookLog[] {
    return [...this.logs];
  }

  getLogsByStatus(status: string): WebhookLog[] {
    return this.logs.filter(log => log.status === status);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const _webhookLogger = new WebhookLogger();
