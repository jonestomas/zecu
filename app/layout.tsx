import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';

import {
  Plus_Jakarta_Sans,
  Inter,
  JetBrains_Mono,
  Geist as V0_Font_Geist,
  Geist_Mono as V0_Font_Geist_Mono,
  Source_Serif_4 as V0_Font_Source_Serif_4,
} from 'next/font/google';

// Initialize fonts
const _geist = V0_Font_Geist({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});
const __geistMono = V0_Font_Geist_Mono({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});
const __sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Zecubot - Your digital assistant against online scams',
  description:
    'Is it a scam or a safe message? What should I do? Solve it in seconds with Zecubot.',
  generator: 'v0.app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className='font-sans antialiased'>{children}</body>
    </html>
  );
}
