"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function PolarSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkoutId = searchParams?.get('checkout_id')

    if (!checkoutId) {
      setStatus('error')
      setMessage('No se encontró el ID de checkout')
      return
    }

    // Verificar el estado del pago
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/polar/verify-payment?checkout_id=${checkoutId}`)
        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage('¡Pago procesado exitosamente!')
          
          // Redirigir a welcome después de 2 segundos
          setTimeout(() => {
            router.push('/welcome')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Error al verificar el pago')
        }
      } catch (error) {
        console.error('Error verificando pago:', error)
        setStatus('error')
        setMessage('Error al verificar el pago')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Procesando pago...
            </h1>
            <p className="text-muted-foreground">
              Por favor espera mientras verificamos tu pago
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-muted-foreground mb-4">
              {message}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirigiendo...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Error en el pago
            </h1>
            <p className="text-muted-foreground mb-6">
              {message}
            </p>
            <button
              onClick={() => router.push('/checkout')}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
            >
              Volver a intentar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

