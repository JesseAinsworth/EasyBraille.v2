"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import "../../gradient-animation.css"

export default function AdminRegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [adminCode, setAdminCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, adminCode }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push("/login?message=Admin registrado correctamente")
      } else {
        setError(data.message || "Error en el registro de administrador")
      }
    } catch (err) {
      setError("Error al conectar con el servidor")
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

          <h1 className="text-3xl font-bold text-center mb-8 text-white">Registro de Administrador</h1>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 text-white placeholder-white/70"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div>
              <label htmlFor="adminCode" className="sr-only">
                Código de administrador
              </label>
              <input
                type="password"
                id="adminCode"
                placeholder="Código de administrador"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 text-white placeholder-white/70"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-skyblue bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? "Procesando..." : "Registrar Administrador"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

