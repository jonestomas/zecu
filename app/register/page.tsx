"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+54",
    phoneNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const t = {
    es: {
      title: "Crear cuenta",
      subtitle: "Regístrate para protegerte de estafas online",
      name: "Nombre completo",
      namePlaceholder: "Juan Pérez",
      phone: "Número de teléfono",
      phonePlaceholder: "11 2345 6789",
      countryCode: "Código de país",
      continue: "Continuar",
      haveAccount: "¿Ya tienes cuenta?",
      login: "Iniciar sesión",
      back: "Volver al inicio",
    },
    en: {
      title: "Create account",
      subtitle: "Sign up to protect yourself from online scams",
      name: "Full name",
      namePlaceholder: "John Doe",
      phone: "Phone number",
      phonePlaceholder: "11 2345 6789",
      countryCode: "Country code",
      continue: "Continue",
      haveAccount: "Already have an account?",
      login: "Log in",
      back: "Back to home",
    },
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    sessionStorage.setItem("registerPhone", `${formData.countryCode}${formData.phoneNumber}`)
    sessionStorage.setItem("registerName", formData.name)

    setIsLoading(false)
    router.push("/verify")
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
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">{t[language].back}</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
            <img src="/penguin-logo.png" alt="Zecu" className="w-12 h-12 rounded-full" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t[language].title}</h1>
          <p className="text-muted-foreground">{t[language].subtitle}</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              {t[language].name}
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
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
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t[language].namePlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              {t[language].phone}
            </label>
            <div className="flex gap-2">
              {/* Country Code Selector */}
              <div className="relative w-32">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-full px-3 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number Input */}
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
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
                <input
                  type="tel"
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                  placeholder={t[language].phonePlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
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
                {language === "es" ? "Enviando..." : "Sending..."}
              </span>
            ) : (
              t[language].continue
            )}
          </button>

          {/* Login Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t[language].haveAccount} </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t[language].login}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
