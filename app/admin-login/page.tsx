"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import "../gradient-animation.css"

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar si hay un mensaje en los parámetros de la URL
    const message = searchParams.get("message")
    if (message) {
      setError(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!identifier || !password) {
      setError("Por favor, completa todos los campos")
      setLoading(false)
      return
    }

    try {
      console.log("Enviando solicitud de inicio de sesión de administrador...")
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })

      console.log("Respuesta recibida:", res.status)
      const data = await res.json()

      if (res.ok) {
        console.log("Inicio de sesión exitoso, redirigiendo...")
        router.push("/admin/dashboard")
      } else {
        console.error("Error de inicio de sesión:", data)
        setError(data.message || "Error al iniciar sesión como administrador")
      }
    } catch (err) {
      console.error("Error de conexión:", err)
      setError("Error al conectar con el servidor. Verifica tu conexión a internet.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient-bg p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl shadow-xl bg-white/30 backdrop-blur-md">
        <div className="p-8">
          <Link href="/" className="inline-flex items-center text-white hover:text-blue-100 transition-colors mb-8">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Volver</span>
          </Link>

          <h1 className="text-3xl font-bold text-center mb-8 text-white">Acceso Administrador</h1>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="sr-only">
                Usuario o Email
              </label>
              <input
                type="text"
                id="identifier"
                placeholder="Usuario o Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 text-white placeholder-white/70"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 text-white placeholder-white/70"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-skyblue bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? "Procesando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/80 mb-2">Acceso exclusivo para administradores</p>
            <p className="text-white/60 text-sm">Contacta al administrador del sistema si necesitas acceso</p>
          </div>

          <div className="mt-8 pt-4 border-t border-white/20 text-center">
            <p className="text-white/60 text-sm mb-2">¿Eres un usuario regular?</p>
            <Link href="/login" className="text-white/70 text-sm hover:text-white transition-colors">
              Acceso para usuarios
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

