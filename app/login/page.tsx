"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone")
  const [countryCode, setCountryCode] = useState("+54")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])

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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const fullPhone = `${countryCode}${phoneNumber}`
      
      // Llamar a la API real para enviar OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar código')
      }

      console.log('✅ OTP enviado:', data)
      
      // Guardar en sessionStorage para la página de verificación
      sessionStorage.setItem('registerPhone', fullPhone)
      
      setIsLoading(false)
      setStep("otp")
    } catch (error) {
      console.error('Error enviando OTP:', error)
      alert(error instanceof Error ? error.message : 'Error al enviar código de verificación')
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

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const fullPhone = `${countryCode}${phoneNumber}`
      const otpCode = otp.join('')

      // Llamar a la API real para verificar OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhone,
          code: otpCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido')
      }

      console.log('✅ OTP verificado:', data)

      setIsLoading(false)

      if (data.isNewUser) {
        // Usuario nuevo - pedir nombre
        setStep("name")
      } else {
        // Usuario existente - ir al dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error('Error verificando OTP:', error)
      alert(error instanceof Error ? error.message : 'Código inválido o expirado')
      setIsLoading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Actualizar el perfil con el nombre
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar perfil')
      }

      console.log('✅ Perfil actualizado:', data)

      setIsLoading(false)
      router.push("/dashboard")
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      alert(error instanceof Error ? error.message : 'Error al guardar tu nombre')
      setIsLoading(false)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background opacity-50" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and back button */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
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
            {step === "phone" && "Iniciar sesión"}
            {step === "otp" && "Verificar código"}
            {step === "name" && "Completa tu perfil"}
          </h1>
          <p className="text-muted-foreground">
            {step === "phone" && "Te enviaremos un código de verificación"}
            {step === "otp" && `Código enviado a ${countryCode} ${phoneNumber}`}
            {step === "name" && "Necesitamos saber tu nombre"}
          </p>
        </div>

        {/* Form container */}
        <div className="glass-card rounded-3xl p-8">
          {step === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Número de teléfono
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
                      placeholder="11 2345 6789"
                      className="w-full pl-12 pr-4 py-3 bg-background/50 border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors backdrop-blur-sm"
                      required
                    />
                  </div>
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
                    Enviando código...
                  </span>
                ) : (
                  "Enviar código"
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-4 text-center">
                  Ingresa el código de 6 dígitos
                </label>
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
                    Verificando...
                  </span>
                ) : (
                  "Verificar"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Cambiar número de teléfono
              </button>
            </form>
          )}

          {step === "name" && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Tu nombre
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
                    placeholder="Juan Pérez"
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
                    Creando cuenta...
                  </span>
                ) : (
                  "Continuar"
                )}
              </button>
            </form>
          )}

          {/* Sign up link - only show on phone step */}
          {step === "phone" && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
