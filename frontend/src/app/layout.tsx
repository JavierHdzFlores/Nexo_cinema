import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

// 1. Configuramos Inter (fuente principal)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// 2. Configuramos Bebas Neue (fuente para títulos/logo)
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexo Cinema",
  description: "La experiencia cinematográfica más inmersiva de México.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. Inyectamos las variables de las fuentes en el HTML
    <html lang="es" className={`${inter.variable} ${bebasNeue.variable} dark`}>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}