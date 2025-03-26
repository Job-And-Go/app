import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import CookieBanner from '@/components/CookieBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "StuJob - Trouvez votre job étudiant",
  description: "La plateforme qui connecte les étudiants avec des opportunités d'emploi flexibles et enrichissantes",
  icons: {
    icon: '/images/favicon.ico',
    apple: '/images/favicon.ico',
  },
  openGraph: {
    title: "StuJob - Trouvez votre job étudiant",
    description: "La plateforme qui connecte les étudiants avec des opportunités d'emploi flexibles et enrichissantes",
    images: [
      {
        url: "/images/logo.PNG",
        width: 1200,
        height: 630,
        alt: "StuJob Logo"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.className}>
      <head>
        <title>StuJob - Trouvez votre job étudiant</title>
        <meta name="description" content="La plateforme qui connecte les étudiants avec des opportunités d'emploi flexibles et enrichissantes" />
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/favicon.ico" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
