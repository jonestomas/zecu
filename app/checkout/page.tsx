"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldCheck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PendingPurchase {
  planId: string
  planName: string
  price: string
  timestamp: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null)

  useEffect(() => {
    const processPendingPurchase = async () => {
      try {
        // Verificar autenticación
        const sessionCheck = await fetch("/api/auth/check-session")
        const { authenticated } = await sessionCheck.json()

        if (!authenticated) {
          setError("No estás autenticado. Por favor inicia sesión.")
          setTimeout(() => router.push("/login"), 2000)
          return
        }

        // Obtener compra pendiente
        const pendingData = sessionStorage.getItem("pendingPurchase")
        
        if (!pendingData) {
          setError("No hay ninguna compra pendiente.")
          setTimeout(() => router.push("/"), 2000)
          return
        }

        const purchase: PendingPurchase = JSON.parse(pendingData)
        setPendingPurchase(purchase)

        // Verificar que no haya expirado (30 minutos)
        const thirtyMinutes = 30 * 60 * 1000
        if (Date.now() - purchase.timestamp > thirtyMinutes) {
          sessionStorage.removeItem("pendingPurchase")
          setError("La sesión de compra expiró. Por favor intenta de nuevo.")
          setTimeout(() => router.push("/"), 3000)
          return
        }

        // Crear preferencia de pago
        const response = await fetch("/api/create-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: purchase.planId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al crear la preferencia de pago")
        }

        const { initPoint, sandboxInitPoint } = await response.json()

        // Limpiar compra pendiente
        sessionStorage.removeItem("pendingPurchase")

        // Redirigir a Mercado Pago
        const paymentUrl = process.env.NODE_ENV === "development" ? sandboxInitPoint : initPoint

        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          throw new Error("No se pudo obtener la URL de pago")
        }

      } catch (err) {
        console.error("Error en checkout:", err)
        setError(err instanceof Error ? err.message : "Error al procesar el pago")
        setIsLoading(false)
      }
    }

    processPendingPurchase()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error en el Checkout</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => router.push("/")} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Procesando tu compra</h1>
          <p className="text-gray-600">Estamos preparando tu pago seguro...</p>
        </div>

        {/* Purchase Info */}
        {pendingPurchase && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Plan seleccionado:</span>
              <span className="text-lg font-bold text-gray-900">{pendingPurchase.planName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Precio:</span>
              <span className="text-2xl font-bold text-blue-600">{pendingPurchase.price}</span>
            </div>
          </div>
        )}

        {/* Loading Animation */}
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-gray-500 text-center">
            Redirigiendo a Mercado Pago...
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
          <CreditCard className="w-4 h-4" />
          <span>Pago 100% seguro con Mercado Pago</span>
        </div>
      </div>
    </div>
  )
}
