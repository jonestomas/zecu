"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    // Obtener información del pago desde los parámetros de URL
    const paymentId = searchParams.get("payment_id")
    const status = searchParams.get("status")
    const externalReference = searchParams.get("external_reference")

    setPaymentInfo({
      paymentId,
      status,
      externalReference,
    })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">¡Pago Exitoso!</h1>

        <p className="text-muted-foreground mb-6">
          Tu suscripción a Zecu ha sido activada correctamente. Recibirás un email de confirmación en breve.
        </p>

        {paymentInfo?.paymentId && (
          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-foreground mb-2">Detalles del pago:</h3>
            <p className="text-sm text-muted-foreground">ID de pago: {paymentInfo.paymentId}</p>
            <p className="text-sm text-muted-foreground">Estado: {paymentInfo.status}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all inline-block"
          >
            Volver al inicio
          </Link>

          <Link
            href="https://wa.me/1234567890"
            className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-600 transition-colors inline-block"
          >
            Comenzar en WhatsApp
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-xl">Cargando...</div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
