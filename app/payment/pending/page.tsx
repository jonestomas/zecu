"use client";

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
      externalReference
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pago Pendiente
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Te notificaremos por email 
          cuando se confirme la transacción.
        </p>

        {paymentInfo?.paymentId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Información del pago:</h3>
            <p className="text-sm text-gray-600">ID de pago: {paymentInfo.paymentId}</p>
            <p className="text-sm text-gray-600">Estado: Pendiente</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>¿Pagaste con efectivo?</strong><br />
            El pago puede tardar hasta 3 días hábiles en acreditarse.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all inline-block"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿Tienes dudas sobre tu pago? Escríbenos a{' '}
            <a href="mailto:pagos@zecu.com" className="text-emerald-500 hover:underline">
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
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}

