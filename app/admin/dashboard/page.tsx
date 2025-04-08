"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, Book, Settings } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [userData, setUserData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTranslations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user")

        if (response.ok) {
          const data = await response.json()
          setUserData(data)

          // Verificar si el usuario es administrador
          if (data.role !== "admin") {
            router.push("/translator")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        setError("Error al cargar datos del usuario")
      } finally {
        setLoading(false)
      }
    }

    // Función para obtener estadísticas básicas
    const fetchStats = async () => {
      try {
        // Obtener usuarios (solo necesitamos el total)
        const usersResponse = await fetch("/api/admin/users?limit=1")
        const usersData = await usersResponse.json()

        // Obtener traducciones (solo necesitamos el total)
        const translationsResponse = await fetch("/api/admin/translations?limit=1")
        const translationsData = await translationsResponse.json()

        setStats({
          totalUsers: usersData.pagination.total,
          totalTranslations: translationsData.pagination.total,
        })
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      }
    }

    fetchUserData()
    fetchStats()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skyblue mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Shield className="h-8 w-8 text-skyblue mr-3" />
        <h1 className="text-3xl font-bold text-skyblue">Panel de Administración</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenido, {userData?.username}</h2>
        <p className="text-gray-600">Desde aquí puedes administrar todos los aspectos de la aplicación EasyBraille.</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-skyblue mr-2" />
            <h3 className="text-lg font-semibold">Usuarios Registrados</h3>
          </div>
          <p className="text-3xl font-bold text-skyblue">{stats.totalUsers}</p>
          <p className="text-gray-500 mt-2">Usuarios totales en la plataforma</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-skyblue mr-2" />
            <h3 className="text-lg font-semibold">Traducciones Realizadas</h3>
          </div>
          <p className="text-3xl font-bold text-skyblue">{stats.totalTranslations}</p>
          <p className="text-gray-500 mt-2">Traducciones totales en la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-skyblue mr-2" />
            <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
          </div>
          <p className="text-gray-600 mb-4">Administra los usuarios registrados en la plataforma.</p>
          <Link
            href="/admin/users"
            className="inline-block px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Ver Usuarios
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-skyblue mr-2" />
            <h3 className="text-lg font-semibold">Traducciones</h3>
          </div>
          <p className="text-gray-600 mb-4">Revisa y gestiona el historial de traducciones.</p>
          <Link
            href="/admin/translations"
            className="inline-block px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Ver Traducciones
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Settings className="h-6 w-6 text-skyblue mr-2" />
            <h3 className="text-lg font-semibold">Configuración</h3>
          </div>
          <p className="text-gray-600 mb-4">Ajusta la configuración general de la aplicación.</p>
          <Link
            href="/admin/settings"
            className="inline-block px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Configurar
          </Link>
        </div>
      </div>
    </div>
  )
}
