'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    setPaymentInfo({
      paymentId,
      status,
      externalReference,
    });
  }, [searchParams]);

  return (
    <div className='min-h-screen bg-background flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-card rounded-2xl shadow-lg p-8 text-center'>
        <div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6'>
          <svg
            className='w-8 h-8 text-destructive'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-foreground mb-4'>Pago No Completado</h1>

        <p className='text-muted-foreground mb-6'>
          Hubo un problema al procesar tu pago. No te preocupes, no se realizó ningún cargo a tu
          tarjeta.
        </p>

        {paymentInfo?.paymentId && (
          <div className='bg-muted rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-foreground mb-2'>Información:</h3>
            <p className='text-sm text-muted-foreground'>
              ID de referencia: {paymentInfo.paymentId}
            </p>
            <p className='text-sm text-muted-foreground'>Estado: {paymentInfo.status}</p>
          </div>
        )}

        <div className='space-y-3'>
          <Link
            href='/#suscripcion'
            className='w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all inline-block'
          >
            Intentar nuevamente
          </Link>

          <Link
            href='/'
            className='w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 px-6 rounded-xl transition-colors inline-block'
          >
            Volver al inicio
          </Link>
        </div>

        <div className='mt-6 pt-6 border-t border-border'>
          <p className='text-sm text-muted-foreground'>
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a href='mailto:soporte@zecu.com' className='text-emerald-500 hover:underline'>
              soporte@zecu.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailure() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <div className='text-xl'>Cargando...</div>
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
