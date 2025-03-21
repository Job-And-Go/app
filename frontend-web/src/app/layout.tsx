import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "StuJob - Trouvez votre job étudiant",
  description: "La plateforme qui connecte les étudiants avec des opportunités d'emploi flexibles et enrichissantes",
  openGraph: {
    title: "StuJob - Trouvez votre job étudiant",
    description: "La plateforme qui connecte les étudiants avec des opportunités d'emploi flexibles et enrichissantes",
    images: [
      {
        url: "/images/og-image.jpg", // Image placeholder à ajouter
        width: 1200,
        height: 630,
        alt: "StuJob Preview"
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
      </head>
      <body>{children}</body>
    </html>
  );
}
