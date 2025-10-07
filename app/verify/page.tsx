"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function VerifyPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const t = {
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
    },
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
    },
  }

  useEffect(() => {
    const phone = sessionStorage.getItem("registerPhone")
    if (phone) {
      setPhoneNumber(phone)
    } else {
      router.push("/register")
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

    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("[v0] Verification code:", verificationCode)
    console.log("[v0] Phone number:", phoneNumber)

    setIsLoading(false)

    router.push("/dashboard")
  }

  const handleResend = async () => {
    if (!canResend) return

    setCanResend(false)
    setCountdown(60)

    await new Promise((resolve) => setTimeout(resolve, 500))

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
  }

  const isCodeComplete = code.every((digit) => digit !== "")

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
            <img src="/zecu-logo.png" alt="Zecu" className="w-16 h-16 rounded-full" />
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
                {language === "es" ? "Verificando..." : "Verifying..."}
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
