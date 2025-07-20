import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import {
  getUsersCollection,
  getTranslationsCollection,
  getEcoKeyboardsCollection,
  getAiInteractionsCollection,
} from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario sea administrador
    const user = await getUserFromToken(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener todas las colecciones
    const [usersCollection, translationsCollection, keyboardCollection, aiCollection] = await Promise.all([
      getUsersCollection(),
      getTranslationsCollection(),
      getEcoKeyboardsCollection(),
      getAiInteractionsCollection(),
    ])

    // Estadísticas de usuarios
    const totalUsers = await usersCollection.countDocuments()
    const activeUsers = await usersCollection.countDocuments({ isActive: true })
    const adminUsers = await usersCollection.countDocuments({ role: "admin" })

    // Estadísticas de traducciones - CORREGIDO
    const totalTranslations = await translationsCollection.countDocuments()
    const translationsThisWeek = await translationsCollection.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })

    // Contar por tipo de traducción
    const translationsByType = await translationsCollection
      .aggregate([
        {
          $group: {
            _id: "$translationType",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Estadísticas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const translationsByMonth = await translationsCollection
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

    // Estadísticas del teclado
    const totalKeyboardSessions = await keyboardCollection.countDocuments()
    const totalEnergySaved = await keyboardCollection
      .aggregate([{ $group: { _id: null, total: { $sum: "$energySaved" } } }])
      .toArray()

    // Estadísticas de IA
    const totalAiInteractions = await aiCollection.countDocuments()
    const avgAccuracy = await aiCollection
      .aggregate([{ $group: { _id: null, avg: { $avg: "$metadata.confidence" } } }])
      .toArray()

    // Estadísticas de IA por mes
    const aiByMonth = await aiCollection
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

    console.log("📊 Estadísticas calculadas:", {
      totalTranslations,
      translationsThisWeek,
      translationsByType,
      translationsByMonth,
      totalUsers,
      totalAiInteractions,
      aiByMonth,
    })

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          regular: totalUsers - adminUsers,
        },
        translations: {
          total: totalTranslations,
          thisWeek: translationsThisWeek,
          byType: translationsByType,
          last6Months: translationsByMonth,
        },
        keyboard: {
          totalSessions: totalKeyboardSessions,
          energySaved: totalEnergySaved[0]?.total || 0,
          co2Reduced: (totalEnergySaved[0]?.total || 0) * 0.25,
        },
        ai: {
          totalInteractions: totalAiInteractions,
          avgAccuracy: (avgAccuracy[0]?.avg || 0) * 100,
          avgResponseTime: 1.2,
          last6Months: aiByMonth,
        },
      },
      isMockData: false,
    })
  } catch (error) {
    console.error("❌ Error fetching admin stats:", error)

    return NextResponse.json(
      {
        error: "Error al cargar estadísticas",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
