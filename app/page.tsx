export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Bienvenido a <span className="text-blue-600">Zecu</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Tu asistente inteligente contra el phishing en WhatsApp. 
            Protege tus conversaciones y navega con seguridad.
          </p>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🛡️ Protección Inteligente
              </h2>
              <p className="text-gray-600">
                Detectamos automáticamente mensajes sospechosos y te alertamos 
                antes de que puedas ser víctima de phishing.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🤖 IA Avanzada
              </h2>
              <p className="text-gray-600">
                Nuestro sistema de inteligencia artificial aprende constantemente 
                para ofrecerte la mejor protección.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                💬 Fácil de Usar
              </h2>
              <p className="text-gray-600">
                Integración perfecta con WhatsApp. Sin complicaciones, 
                solo protección efectiva.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
