"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/droopdown-menu"
import { Button } from "@/components/ui/button"
import { History, Settings, LogOut, User, Shield } from "lucide-react"

export default function UserNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  // Verificar si el usuario es administrador al cargar el componente
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const userData = await response.json()
          setIsAdmin(userData.role === "admin")
        }
      } catch (error) {
        console.error("Error al verificar rol de usuario:", error)
      }
    }

    checkUserRole()
  }, [])

  // Solo mostrar el menú en la página del traductor, historial y configuración
  if (
    pathname !== "/translator" &&
    pathname !== "/history" &&
    pathname !== "/settings" &&
    !pathname.startsWith("/admin")
  ) {
    return null
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Redirigir al usuario a la página de inicio de sesión
        router.push("/login")
      } else {
        console.error("Error al cerrar sesión")
      }
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white hover:bg-gray-100">
          <User className="h-5 w-5 text-skyblue" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/translator")}>
          <User className="mr-2 h-4 w-4" />
          <span>Traductor</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/history")}>
          <History className="mr-2 h-4 w-4" />
          <span>Historial</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin/dashboard")}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Panel de Administrador</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

