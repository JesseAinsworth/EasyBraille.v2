import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import AIInteraction from "@/models/AIInteraction"
import User from "@/models/User"
import type { Document } from "mongoose"

interface IUser extends Document {
  _id: string
  username: string
}

export async function GET(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")
    const roleCookie = cookieStore.get("user_role")

    if (!sessionCookie || !roleCookie || roleCookie.value !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const url = new URL(req.url)
    const timeRange = url.searchParams.get("timeRange") || "week"

    // Calcular fecha de inicio según el rango de tiempo
    const startDate = new Date()
    switch (timeRange) {
      case "day":
        startDate.setDate(startDate.getDate() - 1)
        break
      case "month":
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case "week":
      default:
        startDate.setDate(startDate.getDate() - 7)
        break
    }

    // Obtener métricas de IA
    const totalInteractions = await AIInteraction.countDocuments({
      createdAt: { $gte: startDate },
    })

    // Calcular precisión promedio
    const accuracyResult = await AIInteraction.aggregate([
      { $match: { createdAt: { $gte: startDate }, accuracy: { $exists: true } } },
      { $group: { _id: null, avgAccuracy: { $avg: "$accuracy" } } },
    ])

    const avgAccuracy = accuracyResult.length > 0 ? Math.round(accuracyResult[0].avgAccuracy) : 0

    // Obtener traducciones automáticas (sin corrección manual)
    const autoTranslations = await AIInteraction.countDocuments({
      createdAt: { $gte: startDate },
      manualCorrection: { $exists: false },
    })

    // Calcular porcentaje de correcciones manuales
    const manualCorrections =
      totalInteractions > 0 ? Math.round(((totalInteractions - autoTranslations) / totalInteractions) * 100) : 0

    // Obtener interacciones recientes
    const recentInteractions = await AIInteraction.find().sort({ createdAt: -1 }).limit(10).lean()

    // Enriquecer con información de usuario
    const userIds = recentInteractions.map((interaction) => interaction.userId).filter(Boolean) as string[]

    const users =
      userIds.length > 0 ? ((await User.find({ _id: { $in: userIds } }, { username: 1 }).lean()) as IUser[]) : []

    const userMap = users.reduce(
      (map, user) => {
        map[user._id.toString()] = user.username
        return map
      },
      {} as Record<string, string>,
    )

    const enrichedInteractions = recentInteractions.map((interaction) => ({
      ...interaction,
      username:
        interaction.userId && userMap[interaction.userId.toString()]
          ? userMap[interaction.userId.toString()]
          : "Usuario desconocido",
    }))

    // Obtener datos para gráficos
    // Precisión por día
    const accuracyByDay = await AIInteraction.aggregate([
      { $match: { createdAt: { $gte: startDate }, accuracy: { $exists: true } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          avgAccuracy: { $avg: "$accuracy" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    // Uso por tipo
    const usageByType = await AIInteraction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    return NextResponse.json({
      totalInteractions,
      avgAccuracy,
      autoTranslations,
      manualCorrections,
      recentInteractions: enrichedInteractions,
      accuracyByDay,
      usageByType,
    })
  } catch (error: any) {
    console.error("Error al obtener métricas de IA:", error)
    return NextResponse.json(
      {
        error: "Error al obtener métricas de IA",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

