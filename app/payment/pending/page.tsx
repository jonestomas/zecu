'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentPendingContent() {
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
        <div className='w-16 h-16 bg-chart-4/10 rounded-full flex items-center justify-center mx-auto mb-6'>
          <svg
            className='w-8 h-8 text-chart-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-foreground mb-4'>Pago Pendiente</h1>

        <p className='text-muted-foreground mb-6'>
          Tu pago está siendo procesado. Te notificaremos por email cuando se confirme la
          transacción.
        </p>

        {paymentInfo?.paymentId && (
          <div className='bg-muted rounded-lg p-4 mb-6 text-left'>
            <h3 className='font-semibold text-foreground mb-2'>Información del pago:</h3>
            <p className='text-sm text-muted-foreground'>ID de pago: {paymentInfo.paymentId}</p>
            <p className='text-sm text-muted-foreground'>Estado: Pendiente</p>
          </div>
        )}

        <div className='bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6'>
          <p className='text-sm text-primary'>
            <strong>¿Pagaste con efectivo?</strong>
            <br />
            El pago puede tardar hasta 3 días hábiles en acreditarse.
          </p>
        </div>

        <div className='space-y-3'>
          <Link
            href='/'
            className='w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all inline-block'
          >
            Volver al inicio
          </Link>
        </div>

        <div className='mt-6 pt-6 border-t border-border'>
          <p className='text-sm text-muted-foreground'>
            ¿Tienes dudas sobre tu pago? Escríbenos a{' '}
            <a href='mailto:pagos@zecu.com' className='text-emerald-500 hover:underline'>
              pagos@zecu.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPending() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <div className='text-xl'>Cargando...</div>
        </div>
      }
    >
      <PaymentPendingContent />
    </Suspense>
  );
}
