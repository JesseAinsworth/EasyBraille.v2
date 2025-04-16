"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { UserNav } from "@/components/UserNav"

// Exportar el componente con nombre
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in from localStorage or session
    const user = localStorage.getItem("user")
    if (user) {
      setIsLoggedIn(true)
      // Check if user is admin
      const userData = JSON.parse(user)
      setIsAdmin(userData.role === "admin")
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">EasyBraille</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/translator"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/translator" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Traductor
          </Link>
          {isLoggedIn && (
            <Link
              href="/history"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/history" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Historial
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/admin" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Admin
            </Link>
          )}
          {isLoggedIn ? (
            <UserNav />
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden flex items-center justify-center" onClick={toggleMenu} aria-label="Toggle Menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 flex flex-col gap-4">
            <Link
              href="/translator"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/translator" ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={closeMenu}
            >
              Traductor
            </Link>
            {isLoggedIn && (
              <Link
                href="/history"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/history" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Historial
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <Link href="/settings" onClick={closeMenu}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Configuración
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    localStorage.removeItem("user")
                    setIsLoggedIn(false)
                    setIsAdmin(false)
                    closeMenu()
                  }}
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={closeMenu}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMenu}>
                  <Button size="sm" className="w-full">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
