"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, LogOut, TrendingUp, Shield, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false)

  // Mock user data - in a real app, this would come from authentication/database
  const userData = {
    plan: "Plus", // or 'Free'
    analysesRemaining: 47,
    analysesTotal: 50,
    nextRenewal: "15 de Febrero, 2025",
  }

  const translations = {
    es: {
      title: "Mi Dashboard",
      currentPlan: "Plan Actual",
      analysesRemaining: "Análisis Restantes",
      of: "de",
      nextRenewal: "Próxima renovación",
      unsubscribe: "Quiero darme de baja",
      upgradePlan: "Mejorar plan",
      logout: "Cerrar sesión",
      backToHome: "Volver al inicio",
      unsubscribeTitle: "¿Estás seguro?",
      unsubscribeMessage: "Lamentamos que quieras irte. ¿Estás seguro de que deseas cancelar tu suscripción?",
      cancel: "Cancelar",
      confirmUnsubscribe: "Sí, darme de baja",
      planBenefits: "Beneficios de tu plan",
      benefit1: "Análisis ilimitados de mensajes",
      benefit2: "Detección en tiempo real",
      benefit3: "Soporte prioritario",
      benefit4: "Actualizaciones automáticas",
    },
    en: {
      title: "My Dashboard",
      currentPlan: "Current Plan",
      analysesRemaining: "Analyses Remaining",
      of: "of",
      nextRenewal: "Next renewal",
      unsubscribe: "I want to unsubscribe",
      upgradePlan: "Upgrade plan",
      logout: "Log out",
      backToHome: "Back to home",
      unsubscribeTitle: "Are you sure?",
      unsubscribeMessage: "We're sorry to see you go. Are you sure you want to cancel your subscription?",
      cancel: "Cancel",
      confirmUnsubscribe: "Yes, unsubscribe",
      planBenefits: "Your plan benefits",
      benefit1: "Unlimited message analysis",
      benefit2: "Real-time detection",
      benefit3: "Priority support",
      benefit4: "Automatic updates",
    },
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src="/zecu-logo.png"
                  alt="Zecubot Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="text-2xl font-bold text-foreground">Zecu</span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
                className="px-4 py-2 rounded-lg border-2 border-border hover:border-primary transition-colors text-sm font-medium"
              >
                {language === "es" ? "EN" : "ES"}
              </button>

              {/* Logout Button */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border hover:border-destructive hover:text-destructive transition-colors text-sm font-medium">
                <LogOut className="w-4 h-4" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>

          {/* Page Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-12">{t.title}</h1>

          {/* Dashboard Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Current Plan Card */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">{t.currentPlan}</p>
                  <h2 className="text-4xl font-bold text-foreground">{userData.plan}</h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-muted-foreground">
                  {t.nextRenewal}: <span className="text-foreground font-medium">{userData.nextRenewal}</span>
                </p>
              </div>
              {/* Plan Benefits */}
              <div className="border-t-2 border-border pt-6">
                <p className="text-sm font-semibold text-foreground mb-3">{t.planBenefits}</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {t.benefit1}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {t.benefit2}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {t.benefit3}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {t.benefit4}
                  </li>
                </ul>
              </div>
            </div>

            {/* Analyses Remaining Card */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">{t.analysesRemaining}</p>
                  <h2 className="text-4xl font-bold text-foreground">
                    {userData.analysesRemaining}
                    <span className="text-2xl text-muted-foreground ml-2">
                      {t.of} {userData.analysesTotal}
                    </span>
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-2" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-500"
                    style={{ width: `${(userData.analysesRemaining / userData.analysesTotal) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((userData.analysesRemaining / userData.analysesTotal) * 100)}% disponible
                </p>
              </div>

              {/* Info Message */}
              <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4">
                <p className="text-sm text-foreground">
                  {userData.plan === "Free"
                    ? "¡Actualiza a Plus para análisis ilimitados!"
                    : "¡Tienes análisis ilimitados con tu plan Plus!"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upgrade Plan Button */}
            <Link
              href="/#pricing"
              className="glass-card p-6 rounded-2xl hover:border-primary transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {t.upgradePlan}
                  </h3>
                  <p className="text-sm text-muted-foreground">Accede a más funciones y análisis ilimitados</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </Link>

            {/* Unsubscribe Button */}
            <button
              onClick={() => setShowUnsubscribeModal(true)}
              className="glass-card p-6 rounded-2xl hover:border-destructive transition-all group cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-destructive transition-colors">
                    {t.unsubscribe}
                  </h3>
                  <p className="text-sm text-muted-foreground">Cancelar tu suscripción actual</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Unsubscribe Modal */}
      {showUnsubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t.unsubscribeTitle}</h2>
            </div>
            <p className="text-muted-foreground mb-8">{t.unsubscribeMessage}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-border hover:border-foreground transition-colors font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  // Handle unsubscribe logic here
                  console.log("[v0] Unsubscribe confirmed")
                  setShowUnsubscribeModal(false)
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold transition-colors"
              >
                {t.confirmUnsubscribe}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
