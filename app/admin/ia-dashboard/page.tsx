"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, RefreshCw, Brain, BarChart3, PieChart, Zap } from "lucide-react"
import { Line, Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function IADashboardPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week")

  const { data, error, isLoading, mutate } = useSWR(`/api/admin/ia-metrics?timeRange=${timeRange}`, fetcher)

  const handleGoBack = () => {
    router.push("/admin")
  }

  const handleRefresh = () => {
    mutate()
  }

  // Datos de ejemplo para los gráficos (en una aplicación real, estos vendrían de la API)
  const accuracyData = {
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    datasets: [
      {
        label: "Precisión de IA (%)",
        data: [92, 94, 89, 96, 93, 95, 91],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  }

  const usageData = {
    labels: ["Traducciones", "Correcciones", "Análisis", "Generación"],
    datasets: [
      {
        label: "Uso de IA por tipo",
        data: [65, 23, 12, 8],
        backgroundColor: [
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const correctionData = {
    labels: ["Sin corrección", "Corrección menor", "Corrección mayor"],
    datasets: [
      {
        label: "Correcciones manuales",
        data: [75, 20, 5],
        backgroundColor: ["rgba(75, 192, 192, 0.5)", "rgba(255, 206, 86, 0.5)", "rgba(255, 99, 132, 0.5)"],
      },
    ],
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleGoBack}
          className="mb-6 flex items-center text-skyblue hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Volver al panel de administración</span>
        </button>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          Error al cargar los datos de IA. Es posible que no tengas permisos de administrador.
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
        <span>Volver al panel de administración</span>
      </button>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Brain className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-skyblue">Panel de IA</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
              Período:
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="rounded-md border border-gray-300 shadow-sm px-3 py-2"
            >
              <option value="day">Último día</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 text-skyblue animate-spin" />
        </div>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de interacciones</p>
                  <p className="text-2xl font-semibold text-gray-900">{data?.totalInteractions || 108}</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Precisión promedio</p>
                  <p className="text-2xl font-semibold text-gray-900">{data?.avgAccuracy || 93}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Traducciones automáticas</p>
                  <p className="text-2xl font-semibold text-gray-900">{data?.autoTranslations || 65}</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <PieChart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Correcciones manuales</p>
                  <p className="text-2xl font-semibold text-gray-900">{data?.manualCorrections || 25}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Precisión de IA por día</h2>
              <div className="h-80">
                <Line
                  data={accuracyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 80,
                        max: 100,
                        title: {
                          display: true,
                          text: "Precisión (%)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Uso de IA por tipo</h2>
              <div className="h-80">
                <Bar
                  data={usageData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Cantidad",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Correcciones manuales</h2>
              <div className="h-80 flex items-center justify-center">
                <div style={{ width: "70%", height: "70%" }}>
                  <Pie
                    data={correctionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Últimas interacciones con IA</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precisión
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.recentInteractions ? (
                      data.recentInteractions.map((interaction: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(interaction.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interaction.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interaction.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                interaction.accuracy > 90
                                  ? "bg-green-100 text-green-800"
                                  : interaction.accuracy > 80
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {interaction.accuracy}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date().toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">usuario1</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Traducción</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              95%
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(Date.now() - 3600000).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">usuario2</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Corrección</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              87%
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

