"use client"

import "./globals.css"
import type React from "react"
import Image from "next/image"
import Link from "next/link"
import UserNav from "@/components/UserNav"
import { usePathname } from "next/navigation"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

// Componente de cliente para acceder a usePathname
function ClientNavbar() {
  const pathname = usePathname()
  const hideNavbar =
    pathname === "/login" || pathname === "/register" || pathname === "/admin-login" || pathname === "/admin-register"

  if (hideNavbar) return null

  return (
    <nav className="bg-skyblue p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lgo22-removebg-preview-pdYh434AYK9kXdpDlHynBGuiT2J6TW.png"
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
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white`}>
        <ClientNavbar />
        {children}
      </body>
    </html>
  )
}

