# Zecu Landing Page

Landing page para Zecu - Tu asistente contra el phishing en WhatsApp.

## 🚀 Implementación en Vercel

Este proyecto está optimizado para ser desplegado en Vercel. Sigue estos pasos:

### 1. Preparación del repositorio

\`\`\`bash
# Clona o sube tu código a un repositorio de Git
git init
git add .
git commit -m "Initial commit"
git remote add origin [tu-repositorio-url]
git push -u origin main
\`\`\`

### 2. Implementación en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto Next.js
5. Haz clic en "Deploy"

### 3. Configuración automática

El proyecto incluye:
- ✅ `vercel.json` con configuración optimizada
- ✅ `next.config.mjs` configurado para producción
- ✅ Variables de entorno preparadas
- ✅ Headers de seguridad configurados
- ✅ Optimización de imágenes

## 🛠️ Desarrollo Local

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
\`\`\`

## 📦 Características técnicas

- **Framework**: Next.js 14.2.16
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics integrado
- **Fonts**: Plus Jakarta Sans, Inter, JetBrains Mono (Google Fonts)

## 🔒 Seguridad

- Headers de seguridad configurados
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Configuración optimizada para producción

## 📱 Responsive Design

La landing page está completamente optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🎨 Personalización

Los colores y estilos principales se pueden personalizar en:
- `app/globals.css` - Estilos globales
- `components/ui/` - Componentes de UI reutilizables

---

Creado con ❤️ para proteger usuarios de phishing en WhatsApp.

<!-- Deploy fix: Eliminado vercel.json problemático -->
