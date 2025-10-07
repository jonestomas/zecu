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
      // Crear preferencia de pago
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          userEmail: "usuario@ejemplo.com", // En producción, obtener del usuario autenticado
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear la preferencia de pago")
      }

      const { initPoint, sandboxInitPoint } = await response.json()

      // Redirigir a Mercado Pago
      // En desarrollo usar sandboxInitPoint, en producción usar initPoint
      const paymentUrl = process.env.NODE_ENV === "development" ? sandboxInitPoint : initPoint

      if (paymentUrl) {
        window.location.href = paymentUrl
      } else {
        throw new Error("No se pudo obtener la URL de pago")
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error)
      alert("Error al procesar el pago. Por favor, intenta nuevamente.")
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
  return (
    <PaymentButton
      planId="plus"
      planName="Plus"
      price="AR$5.499"
      className="cta-button text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
    >
      Comenzar con Mercado Pago
    </PaymentButton>
  )
}
