import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import { Poppins, Inter, JetBrains_Mono } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

// Initialize fonts
const _v0_fontVariables = `${GeistSans.variable} ${GeistMono.variable}`

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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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
    <html lang="es" className={`${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`font-sans antialiased ${_v0_fontVariables}`}>{children}</body>
    </html>
  )
}
