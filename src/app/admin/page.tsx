
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  History,
  PlusCircle,
  Trash2,
  Edit,
  Save,
  X,
  BarChart3,
  Keyboard,
  Brain,
  LineChart,
  PieChart,
  Download,
  TrendingUp,
  Activity,
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  Bug,
  RefreshCw,
} from "lucide-react"

// Chart.js imports
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  isActive?: boolean
}

interface FeedbackItem {
  _id: string
  userId: string
  userName: string
  message: string
  createdAt: string
}

interface DayStat {
  date: string
  count: number
}

interface AdminStats {
  users: {
    total: number
    active: number
    admins: number
    regular: number
  }
  translations: {
    total: number
    thisWeek: number
    byType: { spanish_to_braille: number; braille_to_spanish: number }
    last7Days?: DayStat[]
  }
  keyboard: {
    totalSessions: number
    energySaved: number
    co2Reduced: number
    last7Days?: DayStat[]
  }
  ai: {
    totalInteractions: number
    avgAccuracy: number
    avgResponseTime: number
    last7Days?: DayStat[]
  }
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [stats, setStats] = useState<AdminStats>({
    users: { total: 0, active: 0, admins: 0, regular: 0 },
    translations: { 
      total: 0, 
      thisWeek: 0, 
      byType: { spanish_to_braille: 0, braille_to_spanish: 0 },
      last7Days: []
    },
    keyboard: { 
      totalSessions: 0, 
      energySaved: 0, 
      co2Reduced: 0,
      last7Days: []
    },
    ai: { 
      totalInteractions: 0, 
      avgAccuracy: 0, 
      avgResponseTime: 0,
      last7Days: []
    },
  })
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [hasLoadedData, setHasLoadedData] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "mock">("disconnected")
  const [apiResponses, setApiResponses] = useState<Record<string, any>>({})
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Función para generar datos de ejemplo para gráficas
  const generateMockChartData = (baseCount: number = 0): DayStat[] => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        count: Math.max(0, baseCount + Math.floor(Math.random() * 10) - 5)
      })
    }
    return days
  }

  // Función para cargar datos con manejo de errores mejorado
  const loadDataSafely = useCallback(async (url: string) => {
    try {
      console.log(`🔄 Cargando datos de: ${url}`)

      const response = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.warn(`❌ Error ${response.status} al cargar ${url}`)
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Datos cargados exitosamente de ${url}:`, data)

      // Guardar respuesta para debug
      setApiResponses((prev) => ({
        ...prev,
        [url]: {
          data,
          timestamp: new Date().toISOString(),
          status: response.status,
        },
      }))

      return { success: true, data, isMockData: data.isMockData || false }
    } catch (error: any) {
      console.error(`❌ Error al cargar ${url}:`, error)

      // Guardar error para debug
      setApiResponses((prev) => ({
        ...prev,
        [url]: {
          error: error.message,
          timestamp: new Date().toISOString(),
          status: "error",
        },
      }))

      return { success: false, error, isMockData: true }
    }
  }, [])

  // Función memoizada para cargar usuarios
  const loadUsers = useCallback(async () => {
    console.log("📊 Cargando usuarios...")
    const result = await loadDataSafely("/api/admin/users")

    if (result.success && result.data.users) {
      setUsers(result.data.users)
      console.log(`✅ ${result.data.users.length} usuarios cargados`)

      if (result.data.users.length > 0) {
        setFeedback([
          {
            _id: "1",
            userId: result.data.users[0]._id,
            userName: result.data.users[0].name,
            message: "La aplicación es muy útil, pero sería mejor si tuviera más opciones de personalización.",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "2",
            userId: result.data.users[1]?._id || "2",
            userName: result.data.users[1]?.name || "Usuario Demo",
            message: "Encontré un error al traducir textos largos. A veces se queda cargando indefinidamente.",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            _id: "3",
            userId: result.data.users[2]?._id || "3",
            userName: result.data.users[2]?.name || "María García",
            message: "¡Excelente herramienta! Me ha ayudado mucho en mis estudios de Braille.",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ])
      }

      return result.isMockData
    } else {
      console.warn("⚠️ No se pudieron cargar usuarios, usando datos vacíos")
      setUsers([])
      return true
    }
  }, [loadDataSafely])

  // Función memoizada para cargar estadísticas
const loadStats = useCallback(async () => {
  console.log("📈 Cargando estadísticas...")

  const [usersResult, translationsResult, keyboardResult, aiResult, statsResult] = await Promise.all([
    loadDataSafely("/api/admin/users"),
    loadDataSafely("/api/admin/translations"),
    loadDataSafely("/api/admin/keyboard-stats"),
    loadDataSafely("/api/admin/ai-stats"),
    loadDataSafely("/api/admin/stats"),
  ])

  const hasRealData = usersResult.success || translationsResult.success || keyboardResult.success || aiResult.success
  const allMockData =
    usersResult.isMockData && translationsResult.isMockData && keyboardResult.isMockData && aiResult.isMockData

  // ✅ CORRECCIÓN: Manejar el formato real de tu JSON
  let translationsLast7Days = [];
  
  if (statsResult.success && statsResult.data) {
    // Si tu /api/admin/stats devuelve el JSON con totalTranslations y last7Days
   if (statsResult.data.last7Days) {
  translationsLast7Days = statsResult.data.last7Days.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    }),
    count: day.count
  }));
}
  } else {
    // Fallback a datos generados
    translationsLast7Days = generateMockChartData(Math.floor((translationsResult.data?.stats?.total || 0) / 7));
  }

  setStats({
    users: {
      total: usersResult.data?.stats?.total || 0,
      active: usersResult.data?.stats?.active || 0,
      admins: usersResult.data?.stats?.admins || 0,
      regular: usersResult.data?.stats?.regular || 0,
    },
    translations: {
      // ✅ CORRECCIÓN: Usar los datos reales de tu JSON
      total: statsResult.data?.totalTranslations || translationsResult.data?.stats?.total || 0,
      thisWeek: Math.floor((statsResult.data?.totalTranslations || translationsResult.data?.stats?.total || 0) * 0.15),
      byType: {
        spanish_to_braille: statsResult.data?.translationsByType?.TEXT_TO_BRAILLE || 
          translationsResult.data?.stats?.byType?.find((t: any) => t._id === "TEXT_TO_BRAILLE")?.count || 0,
        braille_to_spanish: statsResult.data?.translationsByType?.BRAILLE_TO_TEXT || 
          translationsResult.data?.stats?.byType?.find((t: any) => t._id === "BRAILLE_TO_TEXT")?.count || 0,
      },
      last7Days: translationsLast7Days,
    },
    keyboard: {
      totalSessions: keyboardResult.data?.stats?.totalSessions || 0,
      energySaved: keyboardResult.data?.stats?.totalEnergySaved || 0,
      co2Reduced: keyboardResult.data?.stats?.totalCO2Reduced || 0,
      last7Days: generateMockChartData(Math.floor((keyboardResult.data?.stats?.totalSessions || 0) / 7)),
    },
    ai: {
      totalInteractions: aiResult.data?.stats?.totalInteractions || 0,
      avgAccuracy: aiResult.data?.stats?.avgAccuracy || 0,
      avgResponseTime: aiResult.data?.stats?.avgResponseTime || 0,
      last7Days: generateMockChartData(Math.floor((aiResult.data?.stats?.totalInteractions || 0) / 7)),
    },
  })

  console.log("📊 Estadísticas cargadas:", { hasRealData, allMockData })
  return allMockData
}, [loadDataSafely])

  // Función memoizada para cargar todos los datos
  const loadAllData = useCallback(async () => {
    if (hasLoadedData) return

    setIsLoadingData(true)
    console.log("🚀 Iniciando carga de datos del panel...")

    try {
      const [usersMockData, statsMockData] = await Promise.all([loadUsers(), loadStats()])

      const usingMockData = usersMockData || statsMockData

      if (usingMockData) {
        setConnectionStatus("mock")
        console.log("⚠️ Usando datos de prueba")
      } else {
        setConnectionStatus("connected")
        console.log("✅ Conectado a base de datos real")
      }

      setHasLoadedData(true)
    } catch (error) {
      console.error("❌ Error al cargar datos:", error)
      setConnectionStatus("disconnected")
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar los datos del panel",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }, [hasLoadedData, loadUsers, loadStats, toast])

  // useEffect principal
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const storedUser = localStorage.getItem("user")

        if (!storedUser) {
          router.push("/login")
          return
        }

        const userData = JSON.parse(storedUser)

        if (userData.role !== "admin") {
          toast({
            title: "Acceso denegado",
            description: "No tienes permisos para acceder a esta página",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setIsAdmin(true)
        await loadAllData()
      } catch (error) {
        console.error("Error al verificar el estado de administrador:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar el panel de administración",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [router, toast, loadAllData])

  const handleAddUser = async () => {
    try {
      setIsLoadingData(true)

      const newUser = {
        name: "Nuevo Usuario",
        email: "nuevo@example.com",
        password: "password123", // Contraseña temporal
        role: "user",
      }

      const response = await fetch("/api/admin/users/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al crear usuario")
      }

      // Añadir el usuario creado al estado
      setUsers((prev) => [
        ...prev,
        {
          ...result.user,
          createdAt: result.user.createdAt || new Date().toISOString(),
        },
      ])

      // Iniciar edición del nuevo usuario
      setEditingUser(result.user._id)
      setEditName(result.user.name)
      setEditEmail(result.user.email)
      setEditRole(result.user.role)

      toast({
        title: "Usuario añadido",
        description: "Se ha añadido un nuevo usuario. Edita sus detalles.",
      })
    } catch (error: any) {
      console.error("Error al añadir usuario:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo añadir el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      setIsLoadingData(true)

      const response = await fetch(`/api/admin/users/manage?id=${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al eliminar usuario")
      }

      setUsers((prev) => prev.filter((user) => user._id !== id))

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente.",
      })
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user._id)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditRole(user.role)
  }

  const handleSaveUser = async (id: string) => {
    try {
      setIsLoadingData(true)

      const response = await fetch("/api/admin/users/manage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
          name: editName,
          email: editEmail,
          role: editRole,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar usuario")
      }

      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, name: editName, email: editEmail, role: editRole } : user)),
      )

      setEditingUser(null)

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente.",
      })
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleDeleteFeedback = (id: string) => {
    setFeedback((prev) => prev.filter((item) => item._id !== id))
    toast({
      title: "Feedback eliminado",
      description: "El feedback ha sido eliminado correctamente.",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const downloadReport = () => {
    toast({
      title: "Descargando reporte",
      description: "El reporte se está generando y descargando",
    })
  }

  const refreshData = async () => {
    setHasLoadedData(false)
    await loadAllData()
  }

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo)
  }

  const goToDiagnostico = () => {
    router.push("/admin/diagnostico")
  }

  // Configuraciones de gráficas
  const translationsChartData = {
    labels: stats.translations.last7Days?.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Traducciones por día',
        data: stats.translations.last7Days?.map(stat => stat.count) || [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  const keyboardChartData = {
    labels: stats.keyboard.last7Days?.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Sesiones de teclado',
        data: stats.keyboard.last7Days?.map(stat => stat.count) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: '#22c55e',
        borderWidth: 1,
      }
    ]
  }

  const aiChartData = {
    labels: stats.ai.last7Days?.map(stat => stat.date) || [],
    datasets: [
      {
        label: 'Interacciones IA',
        data: stats.ai.last7Days?.map(stat => stat.count) || [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  const translationTypesData = {
    labels: ['Español → Braille', 'Braille → Español'],
    datasets: [
      {
        data: [stats.translations.byType.spanish_to_braille, stats.translations.byType.braille_to_spanish],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderColor: ['#2563eb', '#059669'],
        borderWidth: 2,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <div className="flex items-center gap-2">
            {connectionStatus === "connected" && (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Conectado</span>
              </div>
            )}
            {connectionStatus === "mock" && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Database className="h-4 w-4" />
                <span className="text-sm">Datos de prueba</span>
              </div>
            )}
            {connectionStatus === "disconnected" && (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Sin conexión</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoadingData}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`} />
            {isLoadingData ? "Actualizando..." : "Actualizar"}
          </Button>
          <Button variant="outline" onClick={goToDiagnostico}>
            <Bug className="mr-2 h-4 w-4" />
            Diagnóstico
          </Button>
          <Button onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* Alerta de estado de conexión */}
      {connectionStatus === "mock" && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-blue-800 font-medium">Usando datos de demostración</p>
              <p className="text-blue-700 text-sm">
                Las APIs están devolviendo datos de prueba. Configura MongoDB para ver datos reales.
              </p>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={goToDiagnostico}>
                  <Bug className="mr-2 h-4 w-4" />
                  Ejecutar diagnóstico
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {connectionStatus === "disconnected" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <p className="text-red-800 font-medium">Sin conexión a la base de datos</p>
              <p className="text-red-700 text-sm">No se pueden cargar datos. Verifica la configuración de MongoDB.</p>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={goToDiagnostico}>
                  <Bug className="mr-2 h-4 w-4" />
                  Ejecutar diagnóstico
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Totales</p>
                <h3 className="text-2xl font-bold">{stats.users.total}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-green-500">+{Math.floor(stats.users.total * 0.1)}</span> nuevos este mes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Traducciones</p>
                <h3 className="text-2xl font-bold">{stats.translations.total}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-green-500">+{stats.translations.thisWeek}</span> esta semana
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energía Ahorrada</p>
                <h3 className="text-2xl font-bold">{stats.keyboard.energySaved.toFixed(1)} kWh</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Keyboard className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-green-500">-{stats.keyboard.co2Reduced.toFixed(1)} kg</span> de CO2
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precisión IA</p>
                <h3 className="text-2xl font-bold">{stats.ai.avgAccuracy.toFixed(1)}%</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-green-500">{stats.ai.avgResponseTime.toFixed(1)}s</span> tiempo de respuesta
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Usuarios ({users.length})
          </TabsTrigger>
          <TabsTrigger value="translations">
            <BarChart3 className="mr-2 h-4 w-4" />
            Traducciones ({stats.translations.total})
          </TabsTrigger>
          <TabsTrigger value="keyboard">
            <Keyboard className="mr-2 h-4 w-4" />
            Teclado ({stats.keyboard.totalSessions})
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="mr-2 h-4 w-4" />
            IA ({stats.ai.totalInteractions})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <History className="mr-2 h-4 w-4" />
            Feedback ({feedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios registrados en la plataforma</CardDescription>
                </div>
                <Button onClick={handleAddUser}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando usuarios...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay usuarios registrados</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ejecuta el script de datos de prueba o registra usuarios manualmente
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium border-b bg-muted/50">
                    <div>Nombre</div>
                    <div>Email</div>
                    <div>Rol</div>
                    <div>Fecha de registro</div>
                    <div className="text-right">Acciones</div>
                  </div>
                  <div className="divide-y">
                    {users.map((user) => (
                      <div key={user._id} className="grid grid-cols-5 p-4 items-center hover:bg-muted/30">
                        {editingUser === user._id ? (
                          <>
                            <div>
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="max-w-[200px]"
                              />
                            </div>
                            <div>
                              <Input
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="max-w-[200px]"
                              />
                            </div>
                            <div>
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                              </select>
                            </div>
                            <div>{formatDate(user.createdAt)}</div>
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleSaveUser(user._id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-muted-foreground">{user.email}</div>
                            <div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === "admin"
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {user.role === "admin" ? "Administrador" : "Usuario"}
                              </span>
                            </div>
                            <div className="text-muted-foreground">{formatDate(user.createdAt)}</div>
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Traducciones</CardTitle>
              <CardDescription>Análisis de las traducciones realizadas en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de traducciones</p>
                        <h3 className="text-2xl font-bold">{stats.translations.total}</h3>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Español → Braille</p>
                        <h3 className="text-2xl font-bold">{stats.translations.byType.spanish_to_braille}</h3>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Braille → Español</p>
                        <h3 className="text-2xl font-bold">{stats.translations.byType.braille_to_spanish}</h3>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {stats.translations.total === 0 ? (
                <div className="text-center py-8 bg-muted rounded-lg">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay traducciones registradas</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Las traducciones aparecerán aquí cuando los usuarios usen el traductor
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 bg-muted rounded-lg">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Gráficas detalladas disponibles después de instalar dependencias
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ejecuta: <code className="bg-background px-2 py-1 rounded">npm install recharts</code>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyboard">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Teclado Ecológico</CardTitle>
              <CardDescription>Análisis del impacto ambiental del teclado Braille Arduino</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sesiones totales</p>
                        <h3 className="text-2xl font-bold">{stats.keyboard.totalSessions}</h3>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <Keyboard className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Energía ahorrada</p>
                        <h3 className="text-2xl font-bold">{stats.keyboard.energySaved.toFixed(1)} kWh</h3>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <LineChart className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">CO2 reducido</p>
                        <h3 className="text-2xl font-bold">{stats.keyboard.co2Reduced.toFixed(1)} kg</h3>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <PieChart className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center py-8 bg-muted rounded-lg">
                <Keyboard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {stats.keyboard.totalSessions === 0
                    ? "No hay datos del teclado ecológico"
                    : "Gráficas de impacto ambiental disponibles después de instalar dependencias"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de IA</CardTitle>
              <CardDescription>Análisis del rendimiento de los modelos de inteligencia artificial</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Interacciones totales</p>
                        <h3 className="text-2xl font-bold">{stats.ai.totalInteractions}</h3>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Brain className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Precisión promedio</p>
                        <h3 className="text-2xl font-bold">{stats.ai.avgAccuracy.toFixed(1)}%</h3>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <LineChart className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tiempo de respuesta</p>
                        <h3 className="text-2xl font-bold">{stats.ai.avgResponseTime.toFixed(1)}s</h3>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <PieChart className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center py-8 bg-muted rounded-lg">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {stats.ai.totalInteractions === 0
                    ? "No hay interacciones de IA registradas"
                    : "Análisis detallado de IA disponible después de instalar dependencias"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback de Usuarios</CardTitle>
              <CardDescription>Revisa los comentarios y sugerencias de los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              {feedback.length > 0 ? (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <Card key={item._id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{item.userName}</CardTitle>
                            <CardDescription>{formatDate(item.createdAt)}</CardDescription>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteFeedback(item._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{item.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay feedback de usuarios</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botón flotante para mostrar/ocultar debug info */}
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={toggleDebugInfo} className="bg-white shadow-md">
          <Bug className="h-4 w-4 mr-2" />
          {showDebugInfo ? "Ocultar debug" : "Mostrar debug"}
        </Button>
      </div>
    </div>
  )
}
