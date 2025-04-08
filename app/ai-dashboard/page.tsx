"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Brain, BarChart2, TrendingUp, AlertTriangle } from "lucide-react"
import { checkAIBackendHealth } from "@/lib/ai-service"

export default function AIDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aiBackendStatus, setAiBackendStatus] = useState<"loading" | "online" | "offline">("loading")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar estado del backend de IA
        try {
          await checkAIBackendHealth()
          setAiBackendStatus("online")
        } catch (error) {
          console.error("Error al verificar el backend de IA:", error)
          setAiBackendStatus("offline")
        }

        // Obtener estadísticas
        const response = await fetch("/api/ai-stats")

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error("Error al obtener estadísticas")
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleGoBack = () => {
    router.push("/translator")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skyblue"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleGoBack}
        className="mb-6 flex items-center text-skyblue hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        <span>Volver al traductor</span>
      </button>

      <h1 className="text-3xl font-bold mb-6 text-skyblue">Panel de IA</h1>

      {/* Estado del servicio de IA */}
      <div
        className={`p-4 rounded-lg mb-6 ${
          aiBackendStatus === "online"
            ? "bg-green-50 border border-green-200"
            : aiBackendStatus === "offline"
              ? "bg-amber-50 border border-amber-200"
              : "bg-blue-50 border border-blue-200"
        }`}
      >
        <div className="flex items-center">
          <Brain
            className={`h-8 w-8 mr-3 ${
              aiBackendStatus === "online"
                ? "text-green-500"
                : aiBackendStatus === "offline"
                  ? "text-amber-500"
                  : "text-blue-500"
            }`}
          />
          <div>
            <h2 className="text-lg font-semibold">
              {aiBackendStatus === "online"
                ? "Servicio de IA conectado"
                : aiBackendStatus === "offline"
                  ? "Servicio de IA no disponible"
                  : "Verificando servicio de IA..."}
            </h2>
            <p className="text-sm text-gray-600">
              {aiBackendStatus === "online"
                ? "El servicio de procesamiento avanzado de imágenes y traducción está funcionando correctamente."
                : aiBackendStatus === "offline"
                  ? "El servicio avanzado no está disponible. Se está utilizando la traducción básica."
                  : "Comprobando la conexión con el servicio de IA..."}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <BarChart2 className="h-6 w-6 text-skyblue mr-2" />
              <h2 className="text-xl font-semibold">Precisión</h2>
            </div>
            <div className="text-4xl font-bold text-center mb-2">{stats.avgAccuracy}%</div>
            <p className="text-sm text-gray-500 text-center">Precisión promedio de las traducciones</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-skyblue mr-2" />
              <h2 className="text-xl font-semibold">Interacciones</h2>
            </div>
            <div className="text-4xl font-bold text-center mb-2">{stats.totalInteractions}</div>
            <p className="text-sm text-gray-500 text-center">Total de traducciones realizadas</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-skyblue mr-2" />
              <h2 className="text-xl font-semibold">Correcciones</h2>
            </div>
            <div className="text-4xl font-bold text-center mb-2">{stats.manualCorrectionCount}</div>
            <p className="text-sm text-gray-500 text-center">Traducciones que necesitaron corrección</p>
          </div>
        </div>
      )}

      {/* Historial reciente */}
      {stats && stats.recentInteractions && stats.recentInteractions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Interacciones recientes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Texto original
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Traducción
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Precisión
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentInteractions.map((interaction: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interaction.inputText}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interaction.expectedOutput}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          interaction.accuracy >= 80
                            ? "bg-green-100 text-green-800"
                            : interaction.accuracy >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {interaction.accuracy}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(interaction.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Botón para entrenar el modelo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Entrenamiento del modelo</h2>
        <p className="mb-4 text-gray-600">
          El modelo de IA puede mejorar con el tiempo basándose en tus correcciones y feedback. Puedes iniciar un
          entrenamiento manual para mejorar la precisión.
        </p>
        <button
          className="px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50 transition-colors"
          disabled={aiBackendStatus !== "online"}
        >
          Iniciar entrenamiento
        </button>
        {aiBackendStatus !== "online" && (
          <p className="mt-2 text-sm text-amber-600">
            El servicio de IA debe estar conectado para iniciar el entrenamiento.
          </p>
        )}
      </div>
    </div>
  )
}

