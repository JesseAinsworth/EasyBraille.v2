"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import UserNav from "@/components/UserNav"
import { Brain } from "lucide-react"
import { checkAIBackendHealth } from "@/lib/ai-service"

export default function NavBar() {
  const pathname = usePathname()
  const [aiStatus, setAiStatus] = useState<"loading" | "online" | "offline">("loading")

  // Ocultar la barra de navegación en las páginas de login y registro
  const hideNavbar = pathname === "/login" || pathname === "/register"

  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        await checkAIBackendHealth()
        setAiStatus("online")
      } catch (error) {
        console.error("Error al verificar el backend de IA:", error)
        setAiStatus("offline")
      }
    }

    if (!hideNavbar) {
      checkAIStatus()
    }
  }, [hideNavbar])

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

        <div className="flex items-center space-x-4">
          {/* Indicador de estado de IA */}
          <Link href="/ai-dashboard" className="flex items-center">
            <div
              className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                aiStatus === "online"
                  ? "bg-green-100 text-green-800"
                  : aiStatus === "offline"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              <Brain className="h-3 w-3 mr-1" />
              <span>
                {aiStatus === "online" ? "IA Activa" : aiStatus === "offline" ? "IA Inactiva" : "Verificando IA..."}
              </span>
            </div>
          </Link>

          <UserNav />
        </div>
      </div>
    </nav>
  )
}

