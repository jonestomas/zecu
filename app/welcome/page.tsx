"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, MessageCircle, Shield, ArrowRight, Loader2 } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ name?: string; plan?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Número de WhatsApp del bot (configurable)
  const WHATSAPP_BOT_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "5491112345678"
  const whatsappLink = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=Hola%20Zecu%2C%20quiero%20comenzar%20a%20protegerme%20de%20estafas`

  useEffect(() => {
    // Verificar sesión y obtener datos del usuario
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/check-session")
        const data = await response.json()

        if (!data.authenticated) {
          // Si no está autenticado, redirigir a login
          router.push("/login")
          return
        }

        setUserData({
          name: data.name,
          plan: data.plan,
        })
      } catch (error) {
        console.error("Error verificando sesión:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background opacity-50" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            ¡Bienvenido{userData?.name ? `, ${userData.name}` : ""}! 🎉
          </h1>

          <p className="text-lg text-muted-foreground mb-2">
            {userData?.plan === "plus"
              ? "Tu plan Plus está activo"
              : "Tu plan Free está listo para usar"}
          </p>

          <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-full px-4 py-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Plan {userData?.plan === "plus" ? "Plus" : "Free"}
            </span>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">¿Qué sigue ahora?</h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Guarda nuestro número de WhatsApp</h3>
                <p className="text-sm text-muted-foreground">
                  Agrega a Zecu a tus contactos para tenerlo siempre disponible
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Envía tu primer mensaje</h3>
                <p className="text-sm text-muted-foreground">
                  Reenvía cualquier mensaje sospechoso y te diremos si es una estafa
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Protégete en segundos</h3>
                <p className="text-sm text-muted-foreground">
                  Zecu analizará el mensaje y te dará una respuesta inmediata con recomendaciones
                </p>
              </div>
            </div>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-3 group"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Abrir WhatsApp y comenzar</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Número de WhatsApp:{" "}
            <span className="font-mono font-semibold text-foreground">
              +{WHATSAPP_BOT_NUMBER.replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, "$1 $2 $3 $4")}
            </span>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                {userData?.plan === "plus" ? "Beneficios de tu plan Plus:" : "Con tu plan Free puedes:"}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {userData?.plan === "plus" ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>50 análisis de mensajes al mes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Detección avanzada de estafas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Análisis de imágenes y audios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Soporte prioritario 24/7</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>5 análisis de mensajes al mes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Detección básica de phishing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Respuestas automáticas</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 glass-card p-4 rounded-xl hover:border-primary transition-all text-center group"
          >
            <span className="text-foreground font-semibold group-hover:text-primary transition-colors">
              Ir al Dashboard
            </span>
          </Link>

          <Link
            href="/"
            className="flex-1 glass-card p-4 rounded-xl hover:border-primary transition-all text-center group"
          >
            <span className="text-foreground font-semibold group-hover:text-primary transition-colors">
              Volver al inicio
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

