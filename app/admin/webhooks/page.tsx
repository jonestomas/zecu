'use client';

import { useState, useEffect } from 'react';

interface WebhookLog {
  id: string;
  timestamp: string;
  type: string;
  action: string;
  paymentId: string;
  status: string;
  amount?: number;
  email?: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // En una implementación real, esto vendría de tu base de datos
    // Por ahora, simulamos algunos webhooks de ejemplo
    const exampleWebhooks: WebhookLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'payment',
        action: 'payment.updated',
        paymentId: '12345678',
        status: 'approved',
        amount: 1999,
        email: 'usuario@ejemplo.com',
      },
    ];

    setWebhooks(exampleWebhooks);
    setIsLoading(false);
  }, []);

  const _simulateWebhook = async () => {
    try {
      const response = await fetch('/api/webhooks/mercadopago', {
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

      if (response.ok) {
        console.warn('Webhook simulado enviado! Revisa la consola del servidor.');
      }
    } catch (error) {
      console.error('Error simulando webhook:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='text-xl'>Cargando webhooks...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Webhooks de Mercado Pago</h1>
            <button
              onClick={simulateWebhook}
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
            >
              Simular Webhook
            </button>
          </div>

          <div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <h3 className='font-semibold text-yellow-800 mb-2'>💡 ¿Cómo ver webhooks reales?</h3>
            <ol className='list-decimal list-inside text-yellow-700 space-y-1'>
              <li>
                Instala ngrok: <code>ngrok http 3002</code>
              </li>
              <li>Configura la URL pública en Mercado Pago</li>
              <li>Haz un pago de prueba</li>
              <li>Los webhooks aparecerán en la consola del servidor</li>
            </ol>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Timestamp
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Tipo
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Acción
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Payment ID
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Estado
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Monto
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {webhooks.map(webhook => (
                  <tr key={webhook.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {new Date(webhook.timestamp).toLocaleString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {webhook.type}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {webhook.action}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {webhook.paymentId}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          webhook.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : webhook.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {webhook.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {webhook.amount ? `AR$${webhook.amount}` : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {webhook.email || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {webhooks.length === 0 && (
            <div className='text-center py-8 text-gray-500'>No hay webhooks registrados aún.</div>
          )}
        </div>
      </div>
    </div>
  );
}
