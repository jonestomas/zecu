"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ShieldCheck, CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PendingPurchase {
  planId: string
  planName: string
  price: string
  timestamp: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"es" | "en">("en")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)

  const translations = {
    en: {
      checkoutError: "Checkout Error",
      backToHome: "Back to home",
      completePurchase: "Complete your purchase",
      preparingPayment: "We're preparing your secure payment...",
      selectedPlan: "Selected plan:",
      price: "Price:",
      secureCheckout: "Secure Checkout",
      processing: "Processing...",
      securePayment: "100% secure payment",
      notAuthenticated: "You are not authenticated. Please log in.",
      noPendingPurchase: "There is no pending purchase.",
      sessionExpired: "The purchase session expired. Please try again.",
      paymentError: "Error creating payment",
      paymentIncludes: "Your plan includes:",
      queryLimit: "queries per month",
      advancedAnalysis: "Advanced AI analysis",
      prioritySupport: "Priority support",
      scamDetection: "Real-time scam detection",
      subscribe: "Subscribe now",
      acceptedCards: "We accept all major credit and debit cards",
      emailLabel: "Email",
      emailPlaceholder: "your@email.com",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email",
      emailInfo: "We'll send your payment confirmation to this email",
    },
    es: {
      checkoutError: "Error en el Checkout",
      backToHome: "Volver al inicio",
      completePurchase: "Completa tu suscripción",
      preparingPayment: "Estamos preparando tu pago seguro...",
      selectedPlan: "Plan seleccionado:",
      price: "Precio:",
      secureCheckout: "Pago Seguro",
      processing: "Procesando...",
      securePayment: "Pago 100% seguro",
      notAuthenticated: "No estás autenticado. Por favor inicia sesión.",
      noPendingPurchase: "No hay ninguna compra pendiente.",
      sessionExpired: "La sesión de compra expiró. Por favor intenta de nuevo.",
      paymentError: "Error al crear el pago",
      paymentIncludes: "Tu plan incluye:",
      queryLimit: "consultas al mes",
      advancedAnalysis: "Análisis avanzado con IA",
      prioritySupport: "Soporte prioritario",
      scamDetection: "Detección de estafas en tiempo real",
      subscribe: "Suscribirme ahora",
      acceptedCards: "Aceptamos todas las tarjetas de crédito y débito",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@email.com",
      emailRequired: "El email es requerido",
      emailInvalid: "Por favor ingresa un email válido",
      emailInfo: "Te enviaremos la confirmación de pago a este correo",
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

        setIsLoading(false)
      } catch (err) {
        console.error("Error en checkout:", err)
        setError(err instanceof Error ? err.message : "Error al inicializar checkout")
        setIsLoading(false)
      }
    }

    initCheckout()
  }, [router, t])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubscribe = async () => {
    // Validar email
    if (!email.trim()) {
      setEmailError(t.emailRequired)
      return
    }

    if (!validateEmail(email)) {
      setEmailError(t.emailInvalid)
      return
    }

    setEmailError(null)
    setIsProcessing(true)

    try {
      // Flujo de Polar.sh
      const response = await fetch("/api/polar/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: pendingPurchase!.planId,
          email: email.trim(),
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
        throw new Error(t.paymentError)
      }
    } catch (err) {
      console.error("Error procesando pago:", err)
      setError(err instanceof Error ? err.message : t.paymentError)
      setIsProcessing(false)
    }
  }

  // Determinar beneficios según el plan
  const getPlanBenefits = () => {
    const planId = pendingPurchase?.planId
    if (planId === "plus") {
      return ["20 " + t.queryLimit, t.advancedAnalysis, t.prioritySupport, t.scamDetection]
    } else if (planId === "premium") {
      return ["50 " + t.queryLimit, t.advancedAnalysis, t.prioritySupport, t.scamDetection]
    }
    return []
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.processing}</h2>
            <p className="text-gray-600">{t.preparingPayment}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Language Switcher - Fixed position */}
      <button
        onClick={() => setLanguage(language === "es" ? "en" : "es")}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors text-sm font-medium bg-white shadow-lg"
      >
        {language === "es" ? "EN" : "ES"}
      </button>

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.completePurchase}</h1>
          <p className="text-gray-600">{t.secureCheckout}</p>
        </div>

        {/* Resumen de compra */}
        {pendingPurchase && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">{t.selectedPlan}</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">{pendingPurchase.planName}</h2>
            </div>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-blue-600">{pendingPurchase.price}</span>
              <span className="text-gray-600 ml-2">/mes</span>
            </div>

            {/* Beneficios */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-3">{t.paymentIncludes}</p>
              {getPlanBenefits().map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campo de Email */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t.emailLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError(null)
            }}
            placeholder={t.emailPlaceholder}
            className={`w-full px-4 py-3 rounded-lg border ${
              emailError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            } focus:ring-2 focus:border-transparent transition-all`}
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          <p className="text-gray-500 text-xs mt-1">{t.emailInfo}</p>
        </div>

        {/* Botón de suscripción */}
        <Button
          onClick={handleSubscribe}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold mb-4"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {t.subscribe}
        </Button>

        {/* Info de seguridad */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.securePayment}</span>
          </div>
          <p className="text-xs text-center text-gray-400">{t.acceptedCards}</p>
        </div>
      </div>
    </div>
  )
}
