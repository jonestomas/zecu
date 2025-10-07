"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPurchase = async () => {
      try {
        // Obtener la compra pendiente
        const pendingPurchaseStr = sessionStorage.getItem('pendingPurchase')
        
        if (!pendingPurchaseStr) {
          // No hay compra pendiente, redirigir al dashboard
          router.push('/dashboard')
          return
        }

        const pendingPurchase = JSON.parse(pendingPurchaseStr)
        const { planId } = pendingPurchase

        console.log('💳 Procesando compra pendiente:', pendingPurchase)

        // Crear preferencia de pago en Mercado Pago
        const response = await fetch('/api/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
          }),
        })

        if (!response.ok) {
          throw new Error('Error al crear preferencia de pago')
        }

        const { initPoint, sandboxInitPoint } = await response.json()

        // Limpiar la compra pendiente antes de redirigir
        sessionStorage.removeItem('pendingPurchase')

        // Redirigir a Mercado Pago
        const paymentUrl = process.env.NODE_ENV === 'development' ? sandboxInitPoint : initPoint

        if (paymentUrl) {
          console.log('✅ Redirigiendo a Mercado Pago...')
          window.location.href = paymentUrl
        } else {
          throw new Error('No se pudo obtener la URL de pago')
        }

      } catch (err) {
        console.error('❌ Error procesando compra:', err)
        setError(err instanceof Error ? err.message : 'Error al procesar el pago')
        setIsProcessing(false)
      }
    }

    processPurchase()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Error al procesar</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full cta-button text-white font-bold py-3 px-6 rounded-xl"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center">
        <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Procesando tu compra</h2>
        <p className="text-muted-foreground">
          Te estamos redirigiendo al checkout de Mercado Pago...
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}

