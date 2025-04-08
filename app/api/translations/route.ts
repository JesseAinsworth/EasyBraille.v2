import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import Translation from "@/models/Translation"
import User from "@/models/User"
import type mongoose from "mongoose"

// Definir interfaces para los tipos de documentos
interface IUser {
  _id: mongoose.Types.ObjectId
  username: string
  email: string
}

interface ITranslation {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  originalText: string
  translatedText: string
  createdAt: Date
}

export async function GET(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(req.url)
    const skip = Number.parseInt(searchParams.get("skip") || "0")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Filtrar por el usuario actual
    const filter = { userId: sessionCookie.value }

    // Obtener traducciones con paginación
    const translations = (await Translation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()) as unknown as ITranslation[]

    // Obtener el total de traducciones para la paginación
    const total = await Translation.countDocuments(filter)

    // Extraer los IDs de usuario únicos
    const userIds = translations
      .map((translation) => translation.userId.toString())
      .filter((value, index, self) => self.indexOf(value) === index) // Eliminar duplicados

    // Obtener información de usuarios si hay traducciones
    let userMap: Record<string, string> = {}

    if (userIds.length > 0) {
      const users = (await User.find({ _id: { $in: userIds } })
        .select("_id username")
        .lean()) as unknown as IUser[]

      // Crear un mapa de ID de usuario a nombre de usuario
      userMap = users.reduce<Record<string, string>>((map, user) => {
        map[user._id.toString()] = user.username
        return map
      }, {})
    }

    // Enriquecer las traducciones con nombres de usuario
    const enrichedTranslations = translations.map((translation) => ({
      ...translation,
      username:
        translation.userId && userMap[translation.userId.toString()]
          ? userMap[translation.userId.toString()]
          : "Usuario",
    }))

    return NextResponse.json(enrichedTranslations)
  } catch (error: any) {
    console.error("Error al obtener traducciones:", error)
    return NextResponse.json(
      {
        error: "Error al obtener traducciones",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
