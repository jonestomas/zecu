export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="navbar fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">Zecubot</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#suscripcion"
              className="nav-link text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg"
            >
              Suscripción
            </a>
            <a
              href="#privacidad"
              className="nav-link text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg"
            >
              Política de Privacidad
            </a>
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
                    Tu escudo digital contra{" "}
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      estafas online
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 max-w-2xl">
                    ¿Es una estafa o un mensaje seguro? Descúbrelo en segundos con Zecubot.
                  </p>
                </div>

                <button className="cta-button text-white font-bold text-lg px-10 py-5 rounded-2xl inline-flex items-center gap-3 shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  Probar gratis en WhatsApp
                </button>
              </div>

              {/* Right Content - WhatsApp Mockup */}
              <div className="flex justify-center lg:justify-end">
                <div className="whatsapp-mockup rounded-3xl p-6 max-w-sm w-full">
                  <div className="bg-green-500 text-white p-3 rounded-t-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-green-500 font-bold text-sm">Z</span>
                    </div>
                    <div>
                      <div className="font-semibold">Zecubot</div>
                      <div className="text-xs opacity-90">en línea</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 space-y-4 min-h-[300px]">
                    <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
                      <p className="text-sm text-gray-700">
                        Hola! Envíame el mensaje sospechoso que recibiste y te ayudo a identificar si es una estafa.
                      </p>
                    </div>

                    <div className="bg-blue-500 text-white p-3 rounded-lg shadow-sm max-w-[80%] ml-auto">
                      <p className="text-sm">
                        "Felicidades! Has ganado $1000. Haz clic aquí para reclamar tu premio..."
                      </p>
                    </div>

                    <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded-lg shadow-sm max-w-[80%]">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-semibold text-red-700 text-sm">ALTO RIESGO</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Este es un mensaje de phishing típico. NO hagas clic en ningún enlace.
                      </p>
                    </div>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rápido y claro</h3>
                <p className="text-gray-600">Respuesta en segundos para que puedas actuar inmediatamente.</p>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Confidencial</h3>
                <p className="text-gray-600">No necesitas preguntar a nadie más. Tu privacidad está protegida.</p>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Acción inmediata</h3>
                <p className="text-gray-600">Consejos prácticos para actuar si ya caíste en una estafa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo Funciona */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">¿Cómo funciona?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tres pasos simples para protegerte de las estafas digitales
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Envía el mensaje</h3>
                <p className="text-gray-600">Envía el mensaje sospechoso a Zecubot (texto, audio o imagen).</p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recibe el análisis</h3>
                <p className="text-gray-600">Obtén el nivel de riesgo: seguro, posible estafa o alto riesgo.</p>
              </div>

              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Actúa con claridad</h3>
                <p className="text-gray-600">Sigue las instrucciones de Zecubot para protegerte.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contexto Educativo */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="glass-card rounded-3xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">¿Qué es el phishing?</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                El phishing es un engaño digital en el que alguien intenta robarte información personal o dinero
                haciéndose pasar por una entidad confiable.
              </p>
              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl p-6 border border-emerald-400/30">
                <p className="text-gray-800 font-medium">
                  Zecubot te ayuda a prevenir estas estafas antes de caer y también te guía con los pasos a seguir si ya
                  fuiste víctima.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Prueba Social */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="glass-card rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Hecho para quienes buscan tranquilidad digital</h2>
              <p className="text-gray-600 text-lg mb-8">
                Únete a miles de usuarios que ya protegen sus conversaciones con Zecubot
              </p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-gray-500 text-sm">Próximamente: testimonios de usuarios</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="glass-card rounded-3xl p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Protégete ahora mismo</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                No esperes a ser víctima de una estafa. Empieza a usar Zecubot hoy mismo.
              </p>
              <button className="cta-button text-white font-bold text-xl px-12 py-6 rounded-2xl inline-flex items-center gap-3">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                Empieza ahora gratis en WhatsApp
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
