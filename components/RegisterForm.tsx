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
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación del lado del cliente
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos")
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-200 text-red-700 rounded-md">{error}</div>}

      <div>
        <label htmlFor="username" className="sr-only">
          USUARIO
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="USUARIO"
          className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-skyblue text-black placeholder-black/70"
        />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">
          CORREO ELECTRÓNICO
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="CORREO ELECTRÓNICO"
          className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-skyblue text-black placeholder-black/70"
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
          minLength={6}
          placeholder="CONTRASEÑA"
          className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-skyblue text-black placeholder-black/70"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-skyblue bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors disabled:opacity-50 font-medium"
      >
        {loading ? "Procesando..." : "REGISTRARSE"}
      </button>
    </form>
  )
}

