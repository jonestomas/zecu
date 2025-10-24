"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"es" | "en">("en")
  const [step, setStep] = useState<"phone" | "otp" | "name" | "selectPlan">("phone")
  const [countryCode, setCountryCode] = useState("+54")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [name, setName] = useState("")
  const [country, setCountry] = useState("Argentina")
  const [city, setCity] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])

  const translations = {
    en: {
      backToHome: "Back to home",
      loginTitle: "Log in",
      verifyTitle: "Verify code",
      profileTitle: "Complete your profile",
      selectPlanTitle: "Choose your plan",
      loginSubtitle: "We'll send you a verification code",
      verifySubtitle: "Code sent to",
      profileSubtitle: "We need some additional information",
      selectPlanSubtitle: "Select the plan that best suits you",
      phoneLabel: "Phone number",
      phonePlaceholder: "11 2345 6789",
      sendCode: "Send code",
      sendingCode: "Sending code...",
      codeLabel: "Enter the 6-digit code",
      verify: "Verify",
      verifying: "Verifying...",
      changePhone: "Change phone number",
      nameLabel: "Your name",
      namePlaceholder: "John Doe",
      countryLabel: "Country",
      cityLabel: "City / Location",
      cityPlaceholder: "Buenos Aires",
      continue: "Continue",
      creatingAccount: "Creating account...",
      freePlan: "Free",
      freeDescription: "Perfect to start protecting yourself",
      plusPlan: "Plus",
      plusDescription: "Ideal for complete daily protection",
      mostPopular: "Most Popular",
      feature1Free: "5 message analyses per month",
      feature2Free: "Basic phishing detection",
      feature3Free: "Automatic responses",
      feature1Plus: "50 message analyses per month",
      feature2Plus: "Advanced scam detection",
      feature3Plus: "Image and audio analysis",
      feature4Plus: "Priority support 24/7",
      perMonth: "/month",
      startFree: "Start free",
      startWithMP: "Start with Mercado Pago",
      activating: "Activating...",
      processing: "Processing...",
    },
    es: {
      backToHome: "Volver al inicio",
      loginTitle: "Iniciar sesión",
      verifyTitle: "Verificar código",
      profileTitle: "Completa tu perfil",
      selectPlanTitle: "Elige tu plan",
      loginSubtitle: "Te enviaremos un código de verificación",
      verifySubtitle: "Código enviado a",
      profileSubtitle: "Necesitamos algunos datos adicionales",
      selectPlanSubtitle: "Selecciona el plan que mejor se adapte a ti",
      phoneLabel: "Número de teléfono",
      phonePlaceholder: "11 2345 6789",
      sendCode: "Enviar código",
      sendingCode: "Enviando código...",
      codeLabel: "Ingresa el código de 6 dígitos",
      verify: "Verificar",
      verifying: "Verificando...",
      changePhone: "Cambiar número de teléfono",
      nameLabel: "Tu nombre",
      namePlaceholder: "Juan Pérez",
      countryLabel: "País",
      cityLabel: "Ciudad / Localidad",
      cityPlaceholder: "Buenos Aires",
      continue: "Continuar",
      creatingAccount: "Creando cuenta...",
      freePlan: "Free",
      freeDescription: "Perfecto para comenzar a protegerte",
      plusPlan: "Plus",
      plusDescription: "Ideal para protección diaria completa",
      mostPopular: "Más Popular",
      feature1Free: "5 análisis de mensajes al mes",
      feature2Free: "Detección básica de phishing",
      feature3Free: "Respuestas automáticas",
      feature1Plus: "50 análisis de mensajes al mes",
      feature2Plus: "Detección avanzada de estafas",
      feature3Plus: "Análisis de imágenes y audios",
      feature4Plus: "Soporte prioritario 24/7",
      perMonth: "/mes",
      startFree: "Comenzar gratis",
      startWithMP: "Comenzar con Mercado Pago",
      activating: "Activando...",
      processing: "Procesando...",
    },
  }

  const t = translations[language]

  const countryCodes = [
    { code: "+54", country: "Argentina", flag: "🇦🇷" },
    { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
    { code: "+52", country: "México", flag: "🇲🇽" },
    { code: "+34", country: "España", flag: "🇪🇸" },
    { code: "+55", country: "Brasil", flag: "🇧🇷" },
    { code: "+56", country: "Chile", flag: "🇨🇱" },
    { code: "+57", country: "Colombia", flag: "🇨🇴" },
    { code: "+51", country: "Perú", flag: "🇵🇪" },
    { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  ]

  const countries = ["Argentina", "USA", "México", "España", "Brasil", "Chile", "Colombia", "Perú", "Uruguay", "Other"]

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const fullPhone = `${countryCode}${phoneNumber}`

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
        }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Error del servidor. Por favor, verifica que Supabase esté configurado correctamente.")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar código")
      }

      console.log("✅ OTP enviado:", data)

      sessionStorage.setItem("registerPhone", fullPhone)

      setIsLoading(false)
      setStep("otp")
    } catch (error) {
      console.error("Error enviando OTP:", error)
      alert(error instanceof Error ? error.message : "Error al enviar código de verificación")
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const fullPhone = `${countryCode}${phoneNumber}`
      const otpCode = otp.join("")

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
          code: otpCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Código inválido")
      }

      console.log("✅ OTP verificado:", data)

      setIsLoading(false)

      const pendingPurchase = sessionStorage.getItem("pendingPurchase")

      if (data.isNewUser) {
        setStep("name")
      } else {
        if (pendingPurchase) {
          router.push("/checkout")
        } else {
          if (!data.hasSubscription) {
            setStep("selectPlan")
          } else {
            router.push("/dashboard")
          }
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
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          country,
          city,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar perfil")
      }

      console.log("✅ Perfil actualizado:", data)

      setIsLoading(false)

      const pendingPurchase = sessionStorage.getItem("pendingPurchase")
      if (pendingPurchase) {
        router.push("/checkout")
      } else {
        setStep("selectPlan")
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error)
      alert(error instanceof Error ? error.message : "Error al guardar tu información")
      setIsLoading(false)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  const handlePlanSelection = async (planId: "free" | "plus") => {
    setIsLoading(true)

    try {
      if (planId === "free") {
        const response = await fetch("/api/activate-free-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al activar plan Free")
        }

        console.log("✅ Plan Free activado:", data)

        // Redirigir a la página de bienvenida
        router.push("/welcome")
      } else {
        // Plan Plus: guardar intención de compra y redirigir a checkout
        sessionStorage.setItem(
          "pendingPurchase",
          JSON.stringify({
            planId: "plus",
            planName: "Plus",
            price: "AR$5.499",
            timestamp: Date.now(),
          }),
        )
        router.push("/checkout")
      }
    } catch (error) {
      console.error("Error al seleccionar plan:", error)
      alert(error instanceof Error ? error.message : "Error al procesar tu selección")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background opacity-50" />

      <button
        onClick={() => setLanguage(language === "es" ? "en" : "es")}
        className="absolute top-6 right-6 px-4 py-2 glass-card hover:border-primary transition-colors text-sm font-medium z-20"
      >
        {language === "es" ? "EN" : "ES"}
      </button>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToHome}
          </Link>

          <div className="flex justify-center mb-6">
            <Image
              src="/zecu-logo.png"
              alt="Zecubot Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain rounded-full"
            />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {step === "phone" && t.loginTitle}
            {step === "otp" && t.verifyTitle}
            {step === "name" && t.profileTitle}
            {step === "selectPlan" && t.selectPlanTitle}
          </h1>
          <p className="text-muted-foreground">
            {step === "phone" && t.loginSubtitle}
            {step === "otp" && `${t.verifySubtitle} ${countryCode} ${phoneNumber}`}
            {step === "name" && t.profileSubtitle}
            {step === "selectPlan" && t.selectPlanSubtitle}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {step === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  {t.phoneLabel}
                </label>
                <div className="flex gap-2">
                  <div className="relative w-32">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full px-3 py-3 bg-background/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors backdrop-blur-sm appearance-none cursor-pointer"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder={t.phonePlaceholder}
                      className="w-full pl-12 pr-4 py-3 bg-background/50 border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent text-secondary font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed yellow-glow h-12 flex items-center justify-center text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t.sendingCode}
                  </span>
                ) : (
                  t.sendCode
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-4 text-center">{t.codeLabel}</label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-background/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors backdrop-blur-sm"
                      required
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.some((digit) => !digit)}
                className="w-full bg-gradient-to-r from-primary to-accent text-secondary font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed yellow-glow h-12 flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t.verifying}
                  </span>
                ) : (
                  t.verify
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                {t.changePhone}
              </button>
            </form>
          )}

          {step === "name" && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full pl-12 pr-4 py-3 bg-background/50 border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                  {t.countryLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors backdrop-blur-sm appearance-none cursor-pointer"
                    required
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                  {t.cityLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t.cityPlaceholder}
                    className="w-full pl-12 pr-4 py-3 bg-background/50 border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent text-secondary font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed yellow-glow h-12 flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t.creatingAccount}
                  </span>
                ) : (
                  t.continue
                )}
              </button>
            </form>
          )}

          {step === "selectPlan" && (
            <div className="space-y-4">
              <div className="bg-background/50 border-2 border-border rounded-2xl p-6 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-bold text-foreground mb-2">{t.freePlan}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t.freeDescription}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.feature1Free}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.feature2Free}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.feature3Free}</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-foreground mb-4">
                  AR$0<span className="text-base font-normal text-muted-foreground">{t.perMonth}</span>
                </div>

                <button
                  onClick={() => handlePlanSelection("free")}
                  disabled={isLoading}
                  className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold text-base py-3 px-6 rounded-xl transition-colors border border-border h-12 flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? t.activating : t.startFree}
                </button>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary rounded-2xl p-6 backdrop-blur-sm relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-secondary px-4 py-1 rounded-full text-sm font-semibold">
                  {t.mostPopular}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{t.plusPlan}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t.plusDescription}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.feature1Plus}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.feature2Plus}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.feature3Plus}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.feature4Plus}</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-foreground mb-4">
                  AR$5.499<span className="text-base font-normal text-muted-foreground">{t.perMonth}</span>
                </div>

                <button
                  onClick={() => handlePlanSelection("plus")}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-secondary font-bold text-base py-3 px-6 rounded-xl hover:shadow-lg transition-all yellow-glow h-12 flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? t.processing : t.startWithMP}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
