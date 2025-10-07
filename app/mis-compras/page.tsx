"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, Clock, Package } from "lucide-react"

interface Purchase {
  id: string
  planName: string
  planId: string
  amount: number
  currency: string
  status: "approved" | "rejected" | "pending" | "cancelled"
  date: string
  paymentId: string
  email: string
}

export default function MisComprasPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("usuario@ejemplo.com") // En producción, obtener del usuario autenticado

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/purchases?email=${encodeURIComponent(userEmail)}`)

      if (!response.ok) {
        throw new Error("Error al cargar las compras")
      }

      const data = await response.json()
      setPurchases(data.purchases)
    } catch (error) {
      console.error("Error fetching purchases:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: Purchase["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-gray-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: Purchase["status"]) => {
    const variants: Record<Purchase["status"], { label: string; className: string }> = {
      approved: { label: "Aprobado", className: "bg-green-100 text-green-800 border-green-300" },
      rejected: { label: "Rechazado", className: "bg-red-100 text-red-800 border-red-300" },
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-800 border-gray-300" },
    }

    const variant = variants[status]
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  const getPlanDisplayName = (planId: string) => {
    const plans: Record<string, string> = {
      plus: "Plan Plus",
      free: "Plan Gratuito",
    }
    return plans[planId] || planId
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mis Compras</h1>
          <p className="text-muted-foreground">Historial de tus suscripciones y pagos</p>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No tienes compras aún</h3>
              <p className="text-muted-foreground mb-6">Cuando realices una compra, aparecerá aquí tu historial.</p>
              <a
                href="/#suscripcion"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
              >
                Ver Planes
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(purchase.status)}
                      <div>
                        <CardTitle className="text-xl">{getPlanDisplayName(purchase.planId)}</CardTitle>
                        <CardDescription>
                          {new Date(purchase.date).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(purchase.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Monto</p>
                      <p className="text-lg font-semibold text-foreground">
                        {purchase.currency} ${purchase.amount.toLocaleString("es-AR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">ID de Pago</p>
                      <p className="text-sm font-mono text-foreground">{purchase.paymentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="text-sm text-foreground">{purchase.email}</p>
                    </div>
                  </div>

                  {purchase.status === "approved" && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Tu suscripción está activa y puedes disfrutar de todos los beneficios del{" "}
                        {getPlanDisplayName(purchase.planId)}.
                      </p>
                    </div>
                  )}

                  {purchase.status === "pending" && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⏳ Tu pago está siendo procesado. Te notificaremos cuando se complete.
                      </p>
                    </div>
                  )}

                  {purchase.status === "rejected" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        ✗ El pago fue rechazado. Por favor, intenta nuevamente con otro método de pago.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
