import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value

    // Obtener estadísticas de las interacciones con IA
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("No se pudo establecer conexión con la base de datos")
    }

    const db = mongoose.connection.db

    // Obtener el promedio de precisión
    const accuracyPipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgAccuracy: { $avg: "$accuracy" } } },
    ]

    const accuracyResult = await db.collection("aiinteractions").aggregate(accuracyPipeline).toArray()
    const avgAccuracy = accuracyResult.length > 0 ? accuracyResult[0].avgAccuracy : null

    // Obtener el total de interacciones
    const totalInteractions = await db.collection("aiinteractions").countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    })

    // Obtener el número de correcciones manuales
    const manualCorrectionCount = await db.collection("aiinteractions").countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      manualCorrection: { $exists: true, $ne: "" },
    })

    // Obtener las últimas interacciones
    const recentInteractions = await db
      .collection("aiinteractions")
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    return NextResponse.json({
      avgAccuracy: avgAccuracy ? Math.round(avgAccuracy) : 0,
      totalInteractions,
      manualCorrectionCount,
      recentInteractions,
      improvementRate: totalInteractions > 0 ? (manualCorrectionCount / totalInteractions) * 100 : 0,
    })
  } catch (error: any) {
    console.error("Error al obtener estadísticas de IA:", error)
    return NextResponse.json(
      {
        error: "Error al obtener estadísticas de IA",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

