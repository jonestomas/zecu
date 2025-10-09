"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [redirecting, setRedirecting] = useState(false)

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

    // Redirigir automáticamente a /welcome después de 3 segundos
    const timer = setTimeout(() => {
      setRedirecting(true)
      router.push("/welcome")
    }, 3000)

    return () => clearTimeout(timer)
  }, [searchParams, router])

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
          Tu suscripción al Plan Plus ha sido activada correctamente. 
          {redirecting 
            ? " Redirigiendo..." 
            : " Serás redirigido a la página de bienvenida en 3 segundos..."}
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
            href="/welcome"
            className="w-full bg-gradient-to-r from-primary to-accent text-secondary font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all inline-block"
          >
            Ir a la página de bienvenida
          </Link>

          <Link
            href="/dashboard"
            className="w-full border-2 border-border text-foreground font-semibold py-3 px-6 rounded-xl hover:border-primary transition-colors inline-block"
          >
            Ir al Dashboard
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
