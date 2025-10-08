import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'

// Initialize fonts
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Zecubot - Tu asistente digital contra estafas online",
  description: "¿Es una estafa o un mensaje seguro? ¿Qué debo hacer? Resuélvelo en segundos con Zecubot.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
