"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type React from "react"
import Link from "next/link"

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

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
        router.push("/translator")
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="text"
          id="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          placeholder="Ingresa tu correo electrónico"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Ingresa tu contraseña"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-skyblue focus:ring-skyblue border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Recuérdame
          </label>
        </div>
        <div className="text-sm">
          <Link href="/reset-password" className="font-medium text-skyblue hover:text-blue-500">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-skyblue hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors disabled:opacity-50"
      >
        {loading ? "Procesando..." : "Iniciar sesión"}
      </button>
    </form>
  )
}

