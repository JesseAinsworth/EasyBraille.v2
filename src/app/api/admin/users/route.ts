import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API: Verificando autenticación...")

    // Verificar que el usuario sea administrador
    const user = await getUserFromToken(request)

    if (!user) {
      console.log("❌ API: No se encontró usuario autenticado")
      return NextResponse.json({ error: "No autorizado - Token inválido o expirado" }, { status: 401 })
    }

    console.log("✅ API: Usuario autenticado:", { email: user.email, role: user.role })

    if (user.role !== "admin") {
      console.log("❌ API: Usuario no es administrador:", user.role)
      return NextResponse.json({ error: "Acceso denegado - Se requieren permisos de administrador" }, { status: 403 })
    }

    console.log("🔄 API: Cargando usuarios...")

    try {
      const usersCollection = await getUsersCollection()
      console.log("✅ API: Colección de usuarios obtenida")

      // Obtener todos los usuarios (sin contraseñas)
      const users = await usersCollection
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray()

      console.log(`✅ API: ${users.length} usuarios encontrados`)

      // Estadísticas de usuarios
      const totalUsers = users.length
      const activeUsers = users.filter((u) => u.isActive !== false).length
      const adminUsers = users.filter((u) => u.role === "admin").length
      const regularUsers = users.filter((u) => u.role === "user").length

      // Usuarios registrados por mes (últimos 6 meses)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const usersByMonth = await usersCollection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: sixMonthsAgo },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 },
          },
        ])
        .toArray()

      return NextResponse.json({
        users: users.map((user) => ({
          ...user,
          _id: user._id.toString(),
        })),
        stats: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          regular: regularUsers,
          byMonth: usersByMonth,
        },
      })
    } catch (dbError: any) {
      console.error("❌ API Error de base de datos:", dbError.message)

      // Si hay error de conexión a MongoDB, devolver datos de prueba
      console.log("⚠️ API: Devolviendo datos de prueba")
      const mockUsers = [
        {
          _id: "admin_id",
          name: "Administrador",
          email: "admin@example.com",
          role: "admin",
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        {
          _id: "user_id",
          name: "Usuario Demo",
          email: "user@example.com",
          role: "user",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true,
        },
      ]

      return NextResponse.json({
        users: mockUsers,
        stats: {
          total: 2,
          active: 2,
          admins: 1,
          regular: 1,
          byMonth: [],
        },
        isMockData: true,
        error: dbError.message,
      })
    }
  } catch (error: any) {
    console.error("❌ API Error general:", error.message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
