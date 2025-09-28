import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import { Geist_Mono as V0_Font_Geist_Mono } from "next/font/google"
import { Poppins, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
V0_Font_Geist({ weight: ["100","200","300","400","500","600","700","800","900"] })
V0_Font_Geist_Mono({ weight: ["100","200","300","400","500","600","700","800","900"] })
V0_Font_Source_Serif_4({ weight: ["200","300","400","500","600","700","800","900"] })

const geistFont = V0_Font_Geist({ weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const geistMonoFont = V0_Font_Geist_Mono({ weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const sourceSerifFont = V0_Font_Source_Serif_4({ weight: ["200", "300", "400", "500", "600", "700", "800", "900"] })

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Zecubot - Tu escudo digital contra estafas online",
  description: "¿Es una estafa o un mensaje seguro? Descúbrelo en segundos con Zecubot.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans`}>{children}</body>
    </html>
  )
}
