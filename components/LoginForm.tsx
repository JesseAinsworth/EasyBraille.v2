"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import Link from "next/link"

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar si hay una cookie de sesión al cargar el componente
  useEffect(() => {
    // Limpiar cualquier error previo
    setError("")

    // Verificar si hay un parámetro de redirección
    const redirectPath = searchParams.get("redirect")

    // Opcional: Mostrar mensaje si fue redirigido
    if (redirectPath) {
      setError("Por favor inicia sesión para acceder a esa página")
    }

    // Verificar si hay un mensaje
    const message = searchParams.get("message")
    if (message) {
      setError(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación del lado del cliente
    if (!identifier.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Inicio de sesión exitoso, redirigiendo...")

        // Obtener la ruta de redirección si existe
        const redirectPath = searchParams.get("redirect") || "/translator"

        router.push(redirectPath)
        router.refresh() // Forzar actualización para reflejar el nuevo estado de autenticación
      } else {
        console.error("Error de inicio de sesión:", data)
        setError(data.message || "Error al iniciar sesión")
      }
    } catch (error: any) {
      console.error("Error de conexión:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div>
        <label htmlFor="identifier" className="sr-only">
          USUARIO
        </label>
        <input
          type="text"
          id="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          placeholder="USUARIO"
          className="w-full px-4 py-3 bg-white/20 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 text-white placeholder-white/70"
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          CONTRASEÑA
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="CONTRASEÑA"
          className="w-full px-4 py-3 bg-white/20 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 text-white placeholder-white/70"
        />
      </div>

      <div className="flex justify-end">
        <Link href="/reset-password" className="text-sm text-white/80 hover:text-white">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-skyblue bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors disabled:opacity-50 font-medium"
      >
        {loading ? "Procesando..." : "INICIAR SESIÓN"}
      </button>
    </form>
  )
}

