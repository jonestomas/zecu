"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldCheck, CreditCard, Globe, MapPin, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PendingPurchase {
  planId: string
  planName: string
  price: string
  timestamp: number
}

type PaymentMethod = 'mercadopago' | 'polar'

export default function CheckoutPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [userCountry, setUserCountry] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const translations = {
    en: {
      checkoutError: "Checkout Error",
      backToHome: "Back to home",
      processingPurchase: "Complete your purchase",
      selectPaymentMethod: "Select payment method",
      preparingPayment: "We're preparing your secure payment...",
      selectedPlan: "Selected plan:",
      price: "Price:",
      yourCountry: "Your country:",
      detecting: "Detecting...",
      redirecting: "Redirecting to payment...",
      securePayment: "100% secure payment",
      notAuthenticated: "You are not authenticated. Please log in.",
      noPendingPurchase: "There is no pending purchase.",
      sessionExpired: "The purchase session expired. Please try again.",
      paymentError: "Error creating payment preference",
      noPaymentUrl: "Could not get payment URL",
      mercadopagoOption: "Mercado Pago",
      mercadopagoDesc: "Ideal for Argentina (ARS)",
      polarOption: "International Payment",
      polarDesc: "Credit/Debit cards worldwide",
      continueToPayment: "Continue to payment",
      selectMethod: "Please select a payment method",
      recommended: "Recommended",
    },
    es: {
      checkoutError: "Error en el Checkout",
      backToHome: "Volver al inicio",
      processingPurchase: "Completa tu compra",
      selectPaymentMethod: "Selecciona método de pago",
      preparingPayment: "Estamos preparando tu pago seguro...",
      selectedPlan: "Plan seleccionado:",
      price: "Precio:",
      yourCountry: "Tu país:",
      detecting: "Detectando...",
      redirecting: "Redirigiendo al pago...",
      securePayment: "Pago 100% seguro",
      notAuthenticated: "No estás autenticado. Por favor inicia sesión.",
      noPendingPurchase: "No hay ninguna compra pendiente.",
      sessionExpired: "La sesión de compra expiró. Por favor intenta de nuevo.",
      paymentError: "Error al crear la preferencia de pago",
      noPaymentUrl: "No se pudo obtener la URL de pago",
      mercadopagoOption: "Mercado Pago",
      mercadopagoDesc: "Ideal para Argentina (ARS)",
      polarOption: "Pago Internacional",
      polarDesc: "Tarjetas de crédito/débito mundial",
      continueToPayment: "Continuar al pago",
      selectMethod: "Por favor selecciona un método de pago",
      recommended: "Recomendado",
    },
  }

  const t = translations[language]

  useEffect(() => {
    const initCheckout = async () => {
      try {
        // Verificar autenticación
        const sessionCheck = await fetch("/api/auth/check-session")
        const { authenticated } = await sessionCheck.json()

        if (!authenticated) {
          setError(t.notAuthenticated)
          setTimeout(() => router.push("/login"), 2000)
          return
        }

        // Obtener datos de compra pendiente
        const pendingData = sessionStorage.getItem("pendingPurchase")

        if (!pendingData) {
          setError(t.noPendingPurchase)
          setTimeout(() => router.push("/"), 2000)
          return
        }

        const purchase: PendingPurchase = JSON.parse(pendingData)
        setPendingPurchase(purchase)

        // Verificar expiración (30 minutos)
        const thirtyMinutes = 30 * 60 * 1000
        if (Date.now() - purchase.timestamp > thirtyMinutes) {
          sessionStorage.removeItem("pendingPurchase")
          setError(t.sessionExpired)
          setTimeout(() => router.push("/"), 3000)
          return
        }

        // Detectar país del usuario
        try {
          const response = await fetch("https://ipapi.co/json/")
          const data = await response.json()
          setUserCountry(data.country_name || 'Unknown')
          
          // Sugerir método de pago según el país
          if (data.country_code === 'AR') {
            setPaymentMethod('mercadopago')
          } else {
            setPaymentMethod('polar')
          }
        } catch (err) {
          console.error('Error detectando país:', err)
          setUserCountry('Unknown')
          setPaymentMethod('polar') // Default a Polar para internacional
        }

        setIsLoading(false)

      } catch (err) {
        console.error("Error en checkout:", err)
        setError(err instanceof Error ? err.message : "Error al inicializar checkout")
        setIsLoading(false)
      }
    }

    initCheckout()
  }, [router, t])

  const handleContinueToPayment = async () => {
    if (!paymentMethod) {
      alert(t.selectMethod)
      return
    }

    setIsProcessing(true)

    try {
      if (paymentMethod === 'mercadopago') {
        // Flujo de Mercado Pago
        const response = await fetch("/api/create-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: pendingPurchase!.planId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || t.paymentError)
        }

        const { initPoint, sandboxInitPoint } = await response.json()
        sessionStorage.removeItem("pendingPurchase")

        const paymentUrl = process.env.NODE_ENV === "development" ? sandboxInitPoint : initPoint

        if (paymentUrl) {
          window.location.href = paymentUrl
        } else {
          throw new Error(t.noPaymentUrl)
        }

      } else {
        // Flujo de Polar.sh
        const response = await fetch("/api/polar/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: pendingPurchase!.planId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || t.paymentError)
        }

        const { checkoutUrl } = await response.json()
        sessionStorage.removeItem("pendingPurchase")

        if (checkoutUrl) {
          window.location.href = checkoutUrl
        } else {
          throw new Error(t.noPaymentUrl)
        }
      }
    } catch (err) {
      console.error("Error procesando pago:", err)
      setError(err instanceof Error ? err.message : t.paymentError)
      setIsProcessing(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.checkoutError}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push("/")} className="w-full bg-blue-600 hover:bg-blue-700">
            {t.backToHome}
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t.preparingPayment}</p>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.redirecting}</h2>
            <p className="text-gray-600">{t.preparingPayment}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.processingPurchase}</h1>
          <p className="text-gray-600">{t.selectPaymentMethod}</p>
        </div>

        {/* Resumen de compra */}
        {pendingPurchase && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{t.selectedPlan}</span>
              <span className="text-lg font-bold text-gray-900">{pendingPurchase.planName}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{t.price}</span>
              <span className="text-2xl font-bold text-blue-600">{pendingPurchase.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{t.yourCountry}</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">{userCountry || t.detecting}</span>
              </div>
            </div>
          </div>
        )}

        {/* Selector de métodos de pago */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.selectPaymentMethod}</h3>
          
          {/* Mercado Pago */}
          <button
            onClick={() => setPaymentMethod('mercadopago')}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'mercadopago'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-bold text-gray-900">{t.mercadopagoOption}</h4>
                  {userCountry === 'Argentina' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {t.recommended}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{t.mercadopagoDesc}</p>
              </div>
              {paymentMethod === 'mercadopago' && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </button>

          {/* Polar.sh */}
          <button
            onClick={() => setPaymentMethod('polar')}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'polar'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-purple-600" />
                  <h4 className="text-lg font-bold text-gray-900">{t.polarOption}</h4>
                  {userCountry !== 'Argentina' && userCountry !== 'Unknown' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {t.recommended}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{t.polarDesc}</p>
              </div>
              {paymentMethod === 'polar' && (
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Botón de continuar */}
        <Button
          onClick={handleContinueToPayment}
          disabled={!paymentMethod}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.continueToPayment}
        </Button>

        {/* Info de seguridad */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
          <ShieldCheck className="w-4 h-4" />
          <span>{t.securePayment}</span>
        </div>
      </div>
    </div>
  )
}
