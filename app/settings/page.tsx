"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=200&width=200")
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      if (response.ok) {
        alert("Contraseña cambiada exitosamente")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        alert("Error al cambiar la contraseña")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cambiar la contraseña")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("image", file)
      try {
        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })
        if (response.ok) {
          const data = await response.json()
          setProfileImage(data.imageUrl)
        } else {
          alert("Error al subir la imagen")
        }
      } catch (error) {
        console.error("Error:", error)
        alert("Error al subir la imagen")
      }
    }
  }

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (response.ok) {
        alert("Se ha enviado un correo de recuperación a tu dirección de email")
        setEmail("")
      } else {
        alert("Error al enviar el correo de recuperación")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al enviar el correo de recuperación")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-skyblue">Configuración</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Imagen de perfil</h2>
        <div className="flex items-center space-x-4">
          <Image
            src={profileImage || "/placeholder.svg"}
            alt="Perfil"
            width={100}
            height={100}
            className="rounded-full"
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50"
          >
            Cambiar contraseña
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recuperar contraseña</h2>
        <form onSubmit={handlePasswordRecovery} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50"
          >
            Enviar correo de recuperación
          </button>
        </form>
      </div>
    </div>
  )
}

