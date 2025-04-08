"use client"

import { useRouter } from "next/navigation"
import { Database, Bell, Activity, Users, History, Shield, Brain } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()

  const adminModules = [
    {
      title: "Gestión de Usuarios",
      description: "Administra usuarios y roles del sistema",
      icon: <Users className="h-8 w-8 text-purple-600" />,
      path: "/admin/users",
      color: "bg-purple-100",
    },
    {
      title: "Logs de Base de Datos",
      description: "Monitorea la actividad en la base de datos",
      icon: <Database className="h-8 w-8 text-blue-600" />,
      path: "/admin/logs",
      color: "bg-blue-100",
    },
    {
      title: "Alertas de Seguridad",
      description: "Gestiona alertas e incidentes de seguridad",
      icon: <Bell className="h-8 w-8 text-red-600" />,
      path: "/admin/alerts",
      color: "bg-red-100",
    },
    {
      title: "Monitoreo de Rendimiento",
      description: "Analiza el rendimiento del sistema",
      icon: <Activity className="h-8 w-8 text-green-600" />,
      path: "/admin/performance",
      color: "bg-green-100",
    },
    {
      title: "Historial de Traducciones",
      description: "Revisa todas las traducciones realizadas",
      icon: <History className="h-8 w-8 text-orange-600" />,
      path: "/admin/translations",
      color: "bg-orange-100",
    },
    {
      title: "Panel de IA",
      description: "Gestiona y monitorea el sistema de IA",
      icon: <Brain className="h-8 w-8 text-indigo-600" />,
      path: "/admin/ia-dashboard",
      color: "bg-indigo-100",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Shield className="h-8 w-8 text-skyblue mr-3" />
        <h1 className="text-3xl font-bold text-skyblue">Panel de Administración</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(module.path)}
          >
            <div className="p-6">
              <div className={`inline-flex p-3 rounded-full ${module.color} mb-4`}>{module.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
              <p className="text-gray-600">{module.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

