"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function VerifyPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"es" | "en">("en")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [isVerified, setIsVerified] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [userName, setUserName] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const t = {
    en: {
      title: "Verify code",
      subtitle: "Enter the 6-digit code sent to",
      codeSent: "Code sent",
      verify: "Verify",
      resend: "Resend code",
      resendIn: "Resend in",
      seconds: "seconds",
      didntReceive: "Didn't receive the code?",
      back: "Back",
      success: "Verification successful!",
      redirecting: "Redirecting...",
      welcomeTitle: "Welcome to Zecu!",
      welcomeSubtitle: "To complete your registration, we need your name",
      namePlaceholder: "Full name",
      continue: "Continue",
      nameRequired: "Please enter your name",
      verifying: "Verifying...",
      creatingAccount: "Creating account...",
    },
    es: {
      title: "Verificar código",
      subtitle: "Ingresa el código de 6 dígitos enviado a",
      codeSent: "Código enviado",
      verify: "Verificar",
      resend: "Reenviar código",
      resendIn: "Reenviar en",
      seconds: "segundos",
      didntReceive: "¿No recibiste el código?",
      back: "Volver",
      success: "¡Verificación exitosa!",
      redirecting: "Redirigiendo...",
      welcomeTitle: "¡Bienvenido a Zecu!",
      welcomeSubtitle: "Para completar tu registro, necesitamos tu nombre",
      namePlaceholder: "Nombre completo",
      continue: "Continuar",
      nameRequired: "Por favor ingresa tu nombre",
      verifying: "Verificando...",
      creatingAccount: "Creando cuenta...",
    },
  }

  const handleResend = async () => {
    if (!canResend) return

    try {
      console.log("Reenviando código...")
      setCanResend(false)
      setCountdown(60)

      // Llamar a la API para reenviar OTP
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al reenviar código")
      }

      console.log("✅ Código reenviado")

      // Iniciar countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error reenviando código:", error)
      alert(error instanceof Error ? error.message : "Error al reenviar código")
      setCanResend(true)
    }
  }

  useEffect(() => {
    const phone = sessionStorage.getItem("registerPhone")
    if (phone) {
      setPhoneNumber(phone)
    } else {
      router.push("/login")
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) {
      return
    }

    const newCode = pastedData.split("").concat(Array(6 - pastedData.length).fill(""))
    setCode(newCode)

    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join("")

    if (verificationCode.length !== 6) {
      return
    }

    setIsLoading(true)

    try {
      // Llamar a la API real para verificar OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Código inválido")
      }

      console.log("✅ OTP verificado:", data)

      setIsLoading(false)
      setIsVerified(true)

      if (data.isNewUser) {
        // Usuario nuevo - mostrar captura de nombre
        setIsNewUser(true)
      } else {
        // Usuario existente - verificar si hay compra pendiente
        const pendingPurchase = sessionStorage.getItem("pendingPurchase")
        if (pendingPurchase) {
          // Hay una compra pendiente - redirigir al checkout
          router.push("/checkout")
        } else {
          // No hay compra pendiente - ir al dashboard
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Error verificando OTP:", error)
      alert(error instanceof Error ? error.message : "Código inválido o expirado")
      setIsLoading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userName.trim()) {
      return
    }

    setIsLoading(true)

    try {
      // Actualizar el perfil con el nombre
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar perfil")
      }

      console.log("✅ Perfil actualizado:", data)
      sessionStorage.setItem("userName", userName)

      setIsLoading(false)

      // Verificar si hay compra pendiente
      const pendingPurchase = sessionStorage.getItem("pendingPurchase")
      if (pendingPurchase) {
        // Hay una compra pendiente - redirigir al checkout
        router.push("/checkout")
      } else {
        // No hay compra pendiente - ir al dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error)
      alert(error instanceof Error ? error.message : "Error al guardar tu nombre")
      setIsLoading(false)
    }
  }

  const isCodeComplete = code.every((digit) => digit !== "")

  if (isVerified && isNewUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          className="absolute top-6 right-6 px-4 py-2 glass-card hover:border-primary transition-colors text-sm font-medium"
        >
          {language === "es" ? "EN" : "ES"}
        </button>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src="/zecu-logo.png" alt="Zecu" className="w-20 h-20 rounded-full" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t[language].welcomeTitle}</h1>
            <p className="text-muted-foreground">{t[language].welcomeSubtitle}</p>
          </div>

          {/* Name Form */}
          <form onSubmit={handleNameSubmit} className="glass-card p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                {t[language].namePlaceholder}
              </label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t[language].namePlaceholder}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!userName.trim() || isLoading}
              className="w-full cta-button text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed h-12 flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t[language].creatingAccount}
                </span>
              ) : (
                t[language].continue
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Language Switcher */}
      <button
        onClick={() => setLanguage(language === "es" ? "en" : "es")}
        className="absolute top-6 right-6 px-4 py-2 glass-card hover:border-primary transition-colors text-sm font-medium"
      >
        {language === "es" ? "EN" : "ES"}
      </button>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">{t[language].back}</span>
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/zecu-logo.png" alt="Zecu" className="w-20 h-20 rounded-full" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t[language].title}</h1>
          <p className="text-muted-foreground mb-1">{t[language].subtitle}</p>
          <p className="text-foreground font-semibold">{phoneNumber}</p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          {/* Code Input */}
          <div>
            <div className="flex gap-2 justify-center mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={!isCodeComplete || isLoading}
            className="w-full cta-button text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t[language].verifying}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t[language].verify}
              </span>
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center text-sm">
            <p className="text-muted-foreground mb-2">{t[language].didntReceive}</p>
            {canResend ? (
              <button type="button" onClick={handleResend} className="text-primary hover:underline font-medium">
                {t[language].resend}
              </button>
            ) : (
              <p className="text-muted-foreground">
                {t[language].resendIn} {countdown} {t[language].seconds}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
