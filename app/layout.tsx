import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import Image from "next/image"
import Link from "next/link"
import UserNav from "@/components/UserNav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EasyBraille - Traductor de Braille a Español",
  description: "Traduciendo ideas - Traductor de Braille a Español",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white`}>
        <nav className="bg-skyblue p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-21%20at%2011.25.54%20PM-52PYtCGtW2B1TpHkPJ8FIt38F7mlTL.jpeg"
                alt="EasyBraille Logo"
                width={100}
                height={100}
                className="w-16 h-16 object-contain"
              />
              <span className="text-white text-xl font-bold hidden sm:block">EasyBraille</span>
            </Link>
            <UserNav />
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}

