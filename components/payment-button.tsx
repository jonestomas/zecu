"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"

interface PaymentButtonProps {
  planId: string
  planName: string
  price: string
  className?: string
  children?: React.ReactNode
}

export function PaymentButton({ planId, planName, price, className = "", children }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Verificar si el usuario tiene sesión activa
      const sessionCheck = await fetch("/api/auth/check-session")
      const { authenticated } = await sessionCheck.json()

      if (!authenticated) {
        // Usuario NO autenticado → Guardar intención de compra y redirigir a login
        sessionStorage.setItem(
          "pendingPurchase",
          JSON.stringify({
            planId,
            planName,
            price,
            timestamp: Date.now(),
          }),
        )

        // Mensaje más amigable
        const mensaje =
          "Para suscribirte al plan Plus, primero necesitas crear una cuenta o iniciar sesión. ¡Es rápido y solo toma 1 minuto! 🚀"

        if (typeof window !== "undefined") {
          // En producción usa un modal bonito, en dev un alert simple
          if (confirm(mensaje + "\n\n¿Quieres continuar?")) {
            window.location.href = "/login"
          } else {
            setIsLoading(false)
          }
        }
        return
      }

      // Usuario SÍ autenticado → Proceder al pago
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear la preferencia de pago")
      }

      const { initPoint, sandboxInitPoint } = await response.json()

      // Redirigir a Mercado Pago
      const paymentUrl = process.env.NODE_ENV === "development" ? sandboxInitPoint : initPoint

      if (paymentUrl) {
        window.location.href = paymentUrl
      } else {
        throw new Error("No se pudo obtener la URL de pago")
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error)
      alert(error instanceof Error ? error.message : "Error al procesar el pago. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className={`w-full ${className}`}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || `Pagar ${price} con Mercado Pago`}
        </>
      )}
    </Button>
  )
}

// Componente específico para el plan Plus
export function PlusPlanPaymentButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handlePlusPlan = async () => {
    setIsLoading(true)

    try {
      // Verificar si el usuario tiene sesión activa
      const sessionCheck = await fetch("/api/auth/check-session")
      const { authenticated } = await sessionCheck.json()

      if (!authenticated) {
        // Usuario NO autenticado → Guardar intención de compra y redirigir a login
        sessionStorage.setItem(
          "pendingPurchase",
          JSON.stringify({
            planId: "plus",
            planName: "Plus",
            price: "$10 USD",
            timestamp: Date.now(),
          }),
        )

        const mensaje =
          "Para suscribirte al plan Plus, primero necesitas crear una cuenta o iniciar sesión. ¡Es rápido y solo toma 1 minuto! 🚀"

        if (typeof window !== "undefined") {
          if (confirm(mensaje + "\n\n¿Quieres continuar?")) {
            window.location.href = "/login"
          } else {
            setIsLoading(false)
          }
        }
        return
      }

      // Usuario SÍ autenticado → Guardar compra pendiente y redirigir a checkout
      sessionStorage.setItem(
        "pendingPurchase",
        JSON.stringify({
          planId: "plus",
          planName: "Plus",
          price: "$10 USD",
          timestamp: Date.now(),
        }),
      )

      window.location.href = "/checkout"
    } catch (error) {
      console.error("Error al procesar el pago:", error)
      alert("Error al procesar tu solicitud. Por favor, intenta nuevamente.")
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePlusPlan}
      disabled={isLoading}
      className="w-full cta-button text-white font-semibold text-base py-3 px-6 rounded-xl shadow-lg h-12 flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Suscribirme ahora
        </>
      )}
    </Button>
  )
}

// Componente específico para el plan Free
export function FreePlanButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleFreePlan = async () => {
    setIsLoading(true)

    try {
      // Verificar si el usuario tiene sesión activa
      const sessionCheck = await fetch("/api/auth/check-session")
      const { authenticated } = await sessionCheck.json()

      if (!authenticated) {
        // Usuario NO autenticado → Guardar intención y redirigir a login
        sessionStorage.setItem(
          "pendingPurchase",
          JSON.stringify({
            planId: "free",
            planName: "Free",
            price: "AR$0",
            timestamp: Date.now(),
          }),
        )

        const mensaje =
          "Para activar el plan Free, primero necesitas crear una cuenta o iniciar sesión. ¡Es rápido y solo toma 1 minuto! 🚀"

        if (typeof window !== "undefined") {
          if (confirm(mensaje + "\n\n¿Quieres continuar?")) {
            window.location.href = "/login"
          } else {
            setIsLoading(false)
          }
        }
        return
      }

      // Usuario SÍ autenticado → Activar plan Free directamente
      const activateResponse = await fetch("/api/activate-free-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!activateResponse.ok) {
        const errorData = await activateResponse.json()
        throw new Error(errorData.error || "Error al activar el plan Free")
      }

      // Plan activado exitosamente → Redirigir a /welcome
      window.location.href = "/welcome"
    } catch (error) {
      console.error("Error al procesar el plan Free:", error)
      alert("Error al procesar tu solicitud. Por favor, intenta nuevamente.")
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFreePlan}
      disabled={isLoading}
      className="w-full h-12 bg-muted hover:bg-muted/80 text-foreground font-semibold text-base py-3 px-6 rounded-xl transition-colors border border-border flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        "Comenzar gratis ahora"
      )}
    </Button>
  )
}
