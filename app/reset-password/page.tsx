"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState("")
  const [message, setMessage] = useState({ text: "", type: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setMessage({ text: "Token no válido o expirado", type: "error" })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })
    setLoading(true)

    if (password !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden", type: "error" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (response.ok) {
        setMessage({ text: "Contraseña restablecida con éxito. Redirigiendo...", type: "success" })
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        const data = await response.json()
        setMessage({ text: data.message || "Error al restablecer la contraseña", type: "error" })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({ text: "Error al conectar con el servidor", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleManualTokenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value)
  }

  const handleGoBack = () => {
    router.push("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={handleGoBack}
        className="mb-6 flex items-center text-skyblue hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        <span>Volver a login</span>
      </button>
      
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-skyblue">Restablecer Contraseña</h1>

        {message.text && (
          <div
            className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        {!token ? (
          <div className="mb-6">
            <label htmlFor="manualToken" className="block text-sm font-medium text-gray-700 mb-2">
              No se detectó un token en la URL. Ingresa tu token de recuperación:
            </label>
            <input
              type="text"
              id="manualToken"
              value={token}
              onChange={handleManualTokenInput}
              placeholder="Ingresa el token que recibiste"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50 p-2 border"
            />
          </div>
        ) : (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            Token detectado correctamente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50 p-2 border"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50 p-2 border"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50"
            disabled={loading || !token}
          >
            {loading ? "Procesando..." : "Restablecer Contraseña"}
          </button>
        </form>
      </div>
    </div>
  )
}