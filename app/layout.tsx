import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import NavBar from "@/components/NavBar";
import { Suspense } from "react";
import Loading from "@/components/Loading";

// Cargar la fuente Inter con optimización
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "EasyBraille - Traductor de Braille a Español",
  description: "Traduciendo ideas - Traductor de Braille a Español",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white`}>
        <NavBar />
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </body>
    </html>
  );
}
