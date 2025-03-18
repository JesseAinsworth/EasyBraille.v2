"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [uploadLoading, setUploadLoading] = useState(false)
  const [resetDbLoading, setResetDbLoading] = useState(false)
  const [alternativeUploadLoading, setAlternativeUploadLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Cargar datos del usuario
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/user")
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setEmail(userData.email || "")
          // Usar una imagen por defecto si no hay imagen de perfil
          setProfileImage(userData.profileImage || "https://via.placeholder.com/200")
        } else if (response.status === 401) {
          console.log("No autorizado, redirigiendo a login")
          router.push("/login")
        } else {
          const errorData = await response.json()
          console.error("Error al cargar datos del usuario:", errorData)
          setMessage({ 
            text: errorData.message || "Error al cargar datos del usuario", 
            type: "error" 
          })
        }
      } catch (error: any) {
        console.error("Error al cargar datos del usuario:", error)
        setMessage({ 
          text: "Error al cargar datos del usuario: " + (error.message || "Error desconocido"), 
          type: "error" 
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleGoBack = () => {
    router.push("/translator")
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    if (newPassword !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden", type: "error" })
      return
    }

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (response.ok) {
        setMessage({ text: "Contraseña actualizada exitosamente", type: "success" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const data = await response.json()
        setMessage({ text: data.message || "Error al cambiar la contraseña", type: "error" })
      }
    } catch (error: any) {
      console.error("Error:", error)
      setMessage({ text: "Error al conectar con el servidor", type: "error" })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: "La imagen es demasiado grande. Máximo 5MB.", type: "error" })
        return
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setMessage({ text: "El archivo debe ser una imagen.", type: "error" })
        return
      }
      
      setSelectedFile(file)
      // Mostrar vista previa de la imagen
      setProfileImage(URL.createObjectURL(file))
    }
  }

  const handleImageSave = async () => {
    if (!selectedFile) return
    
    setUploadLoading(true)
    setMessage({ text: "", type: "" })

    const formData = new FormData()
    formData.append("image", selectedFile)

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      
      if (response.ok) {
        setProfileImage(data.imageUrl)
        setMessage({ text: "Imagen de perfil actualizada exitosamente", type: "success" })
        setSelectedFile(null)
      } else {
        console.error("Error al subir imagen:", data)
        setMessage({ text: data.message || "Error al subir la imagen", type: "error" })
      }
    } catch (error: any) {
      console.error("Error:", error)
      setMessage({ text: "Error al conectar con el servidor", type: "error" })
    } finally {
      setUploadLoading(false)
    }
  }

  const handleAlternativeImageSave = async () => {
    if (!selectedFile) return
    
    setAlternativeUploadLoading(true)
    setMessage({ text: "", type: "" })

    const formData = new FormData()
    formData.append("image", selectedFile)

    try {
      const response = await fetch("/api/alternative-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      
      if (response.ok) {
        setProfileImage(data.imageUrl)
        setMessage({ text: "Imagen de perfil actualizada exitosamente (método alternativo)", type: "success" })
        setSelectedFile(null)
      } else {
        console.error("Error al subir imagen (método alternativo):", data)
        setMessage({ text: data.message || "Error al subir la imagen", type: "error" })
      }
    } catch (error: any) {
      console.error("Error:", error)
      setMessage({ text: "Error al conectar con el servidor", type: "error" })
    } finally {
      setAlternativeUploadLoading(false)
    }
  }

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    try {
      const response = await fetch("/api/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        // Verificar si estamos en modo desarrollo y mostrar información adicional
        if (data.resetToken) {
          setMessage({ 
            text: `Modo desarrollo: Token generado. Usa este token para restablecer la contraseña: ${data.resetToken.substring(0, 8)}... 
                  O visita directamente: ${data.resetUrl}`, 
            type: "success" 
          })
        } else {
          setMessage({ text: "Se ha enviado un correo de recuperación a tu dirección de email", type: "success" })
        }
      } else {
        setMessage({ text: data.message || "Error al enviar el correo de recuperación", type: "error" })
      }
    } catch (error: any) {
      console.error("Error:", error)
      setMessage({ text: "Error al conectar con el servidor", type: "error" })
    }
  }

  const handleResetDb = async () => {
    setResetDbLoading(true)
    setMessage({ text: "", type: "" })
    
    try {
      const response = await fetch("/api/db-reset", {
        method: "POST",
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ text: "Esquema de base de datos actualizado. Intenta subir la imagen nuevamente.", type: "success" })
      } else {
        setMessage({ text: data.message || "Error al actualizar esquema", type: "error" })
      }
    } catch (error: any) {
      console.error("Error:", error)
      setMessage({ text: "Error al conectar con el servidor", type: "error" })
    } finally {
      setResetDbLoading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botón de volver */}
      <button 
        onClick={handleGoBack}
        className="mb-6 flex items-center text-skyblue hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        <span>Volver al traductor</span>
      </button>

      <h1 className="text-3xl font-bold mb-6 text-skyblue">Configuración</h1>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Imagen de perfil</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-32 h-32">
            <Image 
              src={profileImage || "https://via.placeholder.com/200"} 
              alt="Perfil" 
              width={128} 
              height={128} 
              className="rounded-full object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-skyblue file:text-white
                hover:file:bg-blue-400"
            />
            {selectedFile && (
              <>
                <button
                  onClick={handleImageSave}
                  disabled={uploadLoading}
                  className="px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50 disabled:opacity-50"
                >
                  {uploadLoading ? "Subiendo..." : "Guardar imagen"}
                </button>
                
                <button
                  onClick={handleAlternativeImageSave}
                  disabled={alternativeUploadLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                >
                  {alternativeUploadLoading ? "Subiendo..." : "Método alternativo"}
                </button>
              </>
            )}
            
            {/* Botón para resetear el esquema de la base de datos */}
            <button
              onClick={handleResetDb}
              disabled={resetDbLoading}
              className="mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50 disabled:opacity-50"
            >
              {resetDbLoading ? "Actualizando..." : "Solucionar problema de imagen"}
            </button>
          </div>
        </div>
      </div>

      {/* Resto del código sin cambios */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Contraseña actual
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50 px-3 py-2"
            />
          </div>
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
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50 px-3 py-2"
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Recuperar contraseña</h2>
        <p className="mb-4 text-gray-600">Si olvidaste tu contraseña, puedes solicitar un correo de recuperación:</p>
        <form onSubmit={handlePasswordRecovery} className="space-y-4">
          <div>
            <label htmlFor="recoveryEmail" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              id="recoveryEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50 px-3 py-2"
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

      {/* Botón de volver al final de la página */}
      <div className="mt-8 text-center">
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Volver al traductor</span>
        </button>
      </div>
    </div>
  )
}