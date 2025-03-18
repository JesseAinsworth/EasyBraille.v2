"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type React from "react"

export default function RegisterForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación del lado del cliente
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos")
      return
    }

    if (!agreeToTerms) {
      setError("Debes aceptar los términos y condiciones")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Registro exitoso, redirigir a login
        router.push("/login")
      } else {
        setError(data.message || "Error al registrar usuario")
      }
    } catch (error: any) {
      console.error("Error:", error)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Ingresa tu nombre completo"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          minLength={6}
          placeholder="Crea una contraseña"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
        />
      </div>

      <div className="flex items-center">
        <input
          id="agree-terms"
          name="agree-terms"
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          className="h-4 w-4 text-skyblue focus:ring-skyblue border-gray-300 rounded"
        />
        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
          Acepto los{" "}
          <a href="#" className="text-skyblue hover:underline">
            términos y condiciones
          </a>{" "}
          y la{" "}
          <a href="#" className="text-skyblue hover:underline">
            política de privacidad
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-skyblue hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors disabled:opacity-50"
      >
        {loading ? "Procesando..." : "Registrarse"}
      </button>
    </form>
  )
}

