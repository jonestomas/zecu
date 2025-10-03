"use client"

import { useState, useEffect } from "react"
import { BasicPlanPaymentButton, PremiumPlanPaymentButton } from "@/components/payment-button"

const translations = {
  es: {
    nav: {
      subscription: "Suscripción",
      privacy: "Política de Privacidad",
    },
    hero: {
      title: "Tu asistente digital contra",
      titleHighlight: "estafas online",
      subtitle: "¿Es una estafa o un mensaje seguro? ¿Qué debo hacer? Resuelve en segundos con Zecubot.",
      cta: "Probar gratis en WhatsApp",
      ctaFinal: "Empieza ahora gratis en WhatsApp",
    },
    chat: {
      botName: "Zecubot",
      online: "en línea",
      highRisk: "ALTO RIESGO",
      steps: "PASOS A SEGUIR",
      conversation1: {
        bot1: "Hola! Envíame el mensaje sospechoso que recibiste y te ayudo a identificar si es una estafa.",
        user1: '"Felicidades! Has ganado $1000. Haz clic aquí para reclamar tu premio..."',
        bot2: "Este es un mensaje de phishing típico. NO hagas clic en ningún enlace.",
      },
      conversation2: {
        user1: "Ya compartí mis datos en un enlace sospechoso... ¿qué hago?",
        bot1: "No te preocupes, actuemos rápido:",
        bot2: "1. Cambia tus contraseñas inmediatamente\n2. Contacta a tu banco si compartiste datos financieros\n3. Revisa tus cuentas por actividad sospechosa",
      },
    },
    benefits: {
      fast: {
        title: "Rápido y claro",
        description: "Respuesta en segundos para que puedas actuar inmediatamente.",
      },
      confidential: {
        title: "Confidencial",
        description: "No necesitas preguntar a nadie más. Tu privacidad está protegida.",
      },
      action: {
        title: "Acción inmediata",
        description: "Consejos prácticos para actuar si ya caíste en una estafa.",
      },
    },
    howItWorks: {
      title: "¿Cómo funciona?",
      subtitle: "Tres pasos simples para protegerte de las estafas digitales",
      step1: {
        title: "Envía el mensaje",
        description: "Envía el mensaje sospechoso a Zecubot (texto, audio o imagen).",
      },
      step2: {
        title: "Recibe el análisis",
        description: "Obtén el nivel de riesgo: seguro, posible estafa o alto riesgo.",
      },
      step3: {
        title: "Actúa con claridad",
        description: "Sigue las instrucciones de Zecubot para protegerte.",
      },
    },
    education: {
      title: "¿Qué es el phishing?",
      description:
        "El phishing es un engaño digital en el que alguien intenta robarte información personal o dinero haciéndose pasar por una entidad confiable.",
      highlight:
        "Zecubot te ayuda a prevenir estas estafas antes de caer y también te guía con los pasos a seguir si ya fuiste víctima.",
    },
    pricing: {
      title: "Elige tu plan",
      subtitle: "Protección contra estafas para cada necesidad",
      popular: "Más Popular",
      cta: "Comenzar",
      free: {
        name: "Free",
        price: "AR$0",
        period: "/mes",
        description: "Perfecto para comenzar a protegerte",
        features: [
          "5 análisis de mensajes al mes",
          "Detección básica de phishing",
          "Respuestas automáticas",
          "Soporte por email",
        ],
      },
      basic: {
        name: "Básico",
        price: "AR$1.999",
        period: "/mes",
        description: "Ideal para protección diaria completa",
        features: [
          "50 análisis de mensajes al mes",
          "Detección avanzada de estafas",
          "Análisis de imágenes y audios",
          "Guía paso a paso personalizada",
          "Soporte prioritario 24/7",
          "Alertas en tiempo real",
        ],
      },
      premium: {
        name: "Premium",
        price: "AR$5.999",
        period: "/mes",
        description: "Protección máxima para ti y tu familia",
        features: [
          "Análisis ilimitados",
          "IA avanzada con aprendizaje continuo",
          "Protección para hasta 5 números",
          "Análisis forense de amenazas",
          "Reportes mensuales de seguridad",
          "Consultor de seguridad dedicado",
          "Acceso anticipado a nuevas funciones",
        ],
      },
    },
    social: {
      title: "Hecho para quienes buscan tranquilidad digital",
      subtitle: "Únete a miles de usuarios que ya protegen sus conversaciones con Zecubot",
      comingSoon: "Próximamente: testimonios de usuarios",
    },
    finalCta: {
      title: "Protégete ahora mismo",
      subtitle: "No esperes a ser víctima de una estafa. Empieza a usar Zecubot hoy mismo.",
    },
  },
  en: {
    nav: {
      subscription: "Subscription",
      privacy: "Privacy Policy",
    },
    hero: {
      title: "Your digital assistant against",
      titleHighlight: "online scams",
      subtitle: "Is it a scam or a safe message? What should I do? Get answers in seconds with Zecubot.",
      cta: "Try free on WhatsApp",
      ctaFinal: "Start now free on WhatsApp",
    },
    chat: {
      botName: "Zecubot",
      online: "online",
      highRisk: "HIGH RISK",
      steps: "STEPS TO FOLLOW",
      conversation1: {
        bot1: "Hi! Send me the suspicious message you received and I'll help you identify if it's a scam.",
        user1: '"Congratulations! You\'ve won $1000. Click here to claim your prize..."',
        bot2: "This is a typical phishing message. DO NOT click on any links.",
      },
      conversation2: {
        user1: "I already shared my data on a suspicious link... what do I do?",
        bot1: "Don't worry, let's act quickly:",
        bot2: "1. Change your passwords immediately\n2. Contact your bank if you shared financial data\n3. Check your accounts for suspicious activity",
      },
    },
    benefits: {
      fast: {
        title: "Fast and clear",
        description: "Response in seconds so you can act immediately.",
      },
      confidential: {
        title: "Confidential",
        description: "You don't need to ask anyone else. Your privacy is protected.",
      },
      action: {
        title: "Immediate action",
        description: "Practical advice to act if you've already fallen for a scam.",
      },
    },
    howItWorks: {
      title: "How does it work?",
      subtitle: "Three simple steps to protect yourself from digital scams",
      step1: {
        title: "Send the message",
        description: "Send the suspicious message to Zecubot (text, audio or image).",
      },
      step2: {
        title: "Receive the analysis",
        description: "Get the risk level: safe, possible scam or high risk.",
      },
      step3: {
        title: "Act with clarity",
        description: "Follow Zecubot's instructions to protect yourself.",
      },
    },
    education: {
      title: "What is phishing?",
      description:
        "Phishing is a digital scam where someone tries to steal your personal information or money by impersonating a trusted entity.",
      highlight:
        "Zecubot helps you prevent these scams before falling for them and also guides you with the steps to follow if you've already been a victim.",
    },
    pricing: {
      title: "Choose your plan",
      subtitle: "Scam protection for every need",
      popular: "Most Popular",
      cta: "Get Started",
      free: {
        name: "Free",
        price: "AR$0",
        period: "/month",
        description: "Perfect to start protecting yourself",
        features: ["5 message analyses per month", "Basic phishing detection", "Automated responses", "Email support"],
      },
      basic: {
        name: "Basic",
        price: "AR$1.999",
        period: "/month",
        description: "Ideal for complete daily protection",
        features: [
          "50 message analyses per month",
          "Advanced scam detection",
          "Image and audio analysis",
          "Personalized step-by-step guide",
          "24/7 priority support",
          "Real-time alerts",
        ],
      },
      premium: {
        name: "Premium",
        price: "AR$5.999",
        period: "/month",
        description: "Maximum protection for you and your family",
        features: [
          "Unlimited analyses",
          "Advanced AI with continuous learning",
          "Protection for up to 5 numbers",
          "Threat forensic analysis",
          "Monthly security reports",
          "Dedicated security consultant",
          "Early access to new features",
        ],
      },
    },
    social: {
      title: "Made for those seeking digital peace of mind",
      subtitle: "Join thousands of users who already protect their conversations with Zecubot",
      comingSoon: "Coming soon: user testimonials",
    },
    finalCta: {
      title: "Protect yourself right now",
      subtitle: "Don't wait to become a victim of a scam. Start using Zecubot today.",
    },
  },
}

export default function Home() {
  const [currentConversation, setCurrentConversation] = useState(0)
  const [language, setLanguage] = useState<"es" | "en">("es")

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith("en")) {
      setLanguage("en")
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConversation((prev) => (prev === 0 ? 1 : 0))
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const t = translations[language]

  const conversations = [
    // Conversation 1: Prevention
    {
      messages: [
        {
          type: "bot",
          content: t.chat.conversation1.bot1,
        },
        {
          type: "user",
          content: t.chat.conversation1.user1,
        },
        {
          type: "bot",
          content: t.chat.conversation1.bot2,
          isAlert: true,
          alertType: "danger",
        },
      ],
    },
    // Conversation 2: Post-incident support
    {
      messages: [
        {
          type: "user",
          content: t.chat.conversation2.user1,
        },
        {
          type: "bot",
          content: t.chat.conversation2.bot1,
          isAlert: false,
        },
        {
          type: "bot",
          content: t.chat.conversation2.bot2,
          isAlert: true,
          alertType: "info",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">Zecu</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#suscripcion"
              className="nav-link text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg"
            >
              {t.nav.subscription}
            </a>
            <a
              href="#privacidad"
              className="nav-link text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg"
            >
              {t.nav.privacy}
            </a>
            <button
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="nav-link text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-300 hover:border-gray-400 transition-colors"
              aria-label="Switch language"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span className="font-semibold">{language === "es" ? "EN" : "ES"}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    {t.hero.title}{" "}
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      {t.hero.titleHighlight}
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 max-w-2xl">{t.hero.subtitle}</p>
                </div>

                <button className="cta-button text-white font-bold text-lg px-10 py-5 rounded-2xl inline-flex items-center gap-3 shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  {t.hero.cta}
                </button>
              </div>

              {/* Right Content - WhatsApp Mockup with Transitions */}
              <div className="flex justify-center lg:justify-end">
                <div className="whatsapp-mockup rounded-3xl p-6 max-w-sm w-full">
                  <div className="bg-green-500 text-white p-3 rounded-t-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-green-500 font-bold text-sm">Z</span>
                    </div>
                    <div>
                      <div className="font-semibold">{t.chat.botName}</div>
                      <div className="text-xs opacity-90">{t.chat.online}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 space-y-4 min-h-[350px] relative overflow-hidden">
                    {conversations.map((conversation, convIndex) => (
                      <div
                        key={convIndex}
                        className={`absolute inset-4 space-y-4 transition-all duration-1000 ${
                          currentConversation === convIndex
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4 pointer-events-none"
                        }`}
                      >
                        {conversation.messages.map((message, msgIndex) => (
                          <div
                            key={msgIndex}
                            className={`animate-fade-in-up`}
                            style={{ animationDelay: `${msgIndex * 0.8}s` }}
                          >
                            {message.type === "user" ? (
                              <div className="bg-blue-500 text-white p-3 rounded-lg shadow-sm max-w-[85%] ml-auto">
                                <p className="text-sm whitespace-pre-line">{message.content}</p>
                              </div>
                            ) : (
                              <div
                                className={`p-3 rounded-lg shadow-sm max-w-[85%] ${
                                  message.isAlert
                                    ? message.alertType === "danger"
                                      ? "bg-red-100 border-l-4 border-red-500"
                                      : "bg-blue-100 border-l-4 border-blue-500"
                                    : "bg-white"
                                }`}
                              >
                                {message.isAlert && message.alertType === "danger" && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="font-semibold text-red-700 text-sm">{t.chat.highRisk}</span>
                                  </div>
                                )}
                                {message.isAlert && message.alertType === "info" && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="font-semibold text-blue-700 text-sm">{t.chat.steps}</span>
                                  </div>
                                )}
                                <p
                                  className={`text-sm whitespace-pre-line ${
                                    message.isAlert
                                      ? message.alertType === "danger"
                                        ? "text-red-700"
                                        : "text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {message.content}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios Clave */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card glass-card-hover rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.benefits.fast.title}</h3>
                <p className="text-gray-600">{t.benefits.fast.description}</p>
              </div>

              <div className="glass-card glass-card-hover rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.benefits.confidential.title}</h3>
                <p className="text-gray-600">{t.benefits.confidential.description}</p>
              </div>

              <div className="glass-card glass-card-hover rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.benefits.action.title}</h3>
                <p className="text-gray-600">{t.benefits.action.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo Funciona */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t.howItWorks.title}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.howItWorks.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.howItWorks.step1.title}</h3>
                <p className="text-gray-600">{t.howItWorks.step1.description}</p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.howItWorks.step2.title}</h3>
                <p className="text-gray-600">{t.howItWorks.step2.description}</p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.howItWorks.step3.title}</h3>
                <p className="text-gray-600">{t.howItWorks.step3.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contexto Educativo */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="glass-card rounded-3xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">{t.education.title}</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">{t.education.description}</p>
              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl p-6 border border-emerald-400/30">
                <p className="text-gray-800 font-medium">{t.education.highlight}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="suscripcion" className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t.pricing.title}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.pricing.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {/* Free Plan */}
              <div className="glass-card rounded-3xl p-8 hover:shadow-xl transition-shadow flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.pricing.free.name}</h3>
                  <p className="text-gray-600 mb-6 min-h-[48px]">{t.pricing.free.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {t.pricing.free.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center mt-auto">
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{t.pricing.free.price}</span>
                    <span className="text-gray-600">{t.pricing.free.period}</span>
                  </div>
                  <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors">
                    {t.pricing.cta}
                  </button>
                </div>
              </div>

              {/* Basic Plan - Most Popular */}
              <div className="glass-card rounded-3xl p-8 relative border-2 border-emerald-400 shadow-2xl flex flex-col">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  {t.pricing.popular}
                </div>
                <div className="text-center mb-8 mt-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.pricing.basic.name}</h3>
                  <p className="text-gray-600 mb-6 min-h-[48px]">{t.pricing.basic.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {t.pricing.basic.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center mt-auto">
                  <div className="mb-6">
                    <span className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                      {t.pricing.basic.price}
                    </span>
                    <span className="text-gray-600">{t.pricing.basic.period}</span>
                  </div>
                  <BasicPlanPaymentButton />
                </div>
              </div>

              {/* Premium Plan */}
              <div className="glass-card rounded-3xl p-8 hover:shadow-xl transition-shadow flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.pricing.premium.name}</h3>
                  <p className="text-gray-600 mb-6 min-h-[48px]">{t.pricing.premium.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {t.pricing.premium.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-center mt-auto">
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{t.pricing.premium.price}</span>
                    <span className="text-gray-600">{t.pricing.premium.period}</span>
                  </div>
                  <PremiumPlanPaymentButton />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prueba Social */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="glass-card rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.social.title}</h2>
              <p className="text-gray-600 text-lg mb-8">{t.social.subtitle}</p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-gray-500 text-sm">{t.social.comingSoon}</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="glass-card rounded-3xl p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t.finalCta.title}</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t.finalCta.subtitle}</p>
              <button className="cta-button text-white font-bold text-xl px-12 py-6 rounded-2xl inline-flex items-center gap-3">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                {t.hero.ctaFinal}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
