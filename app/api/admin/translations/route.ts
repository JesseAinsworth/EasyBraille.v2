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
    const userRoleCookie = cookieStore.get("userRole")

    // Verificar autenticación y rol de administrador
    if (!sessionCookie || !userRoleCookie || userRoleCookie.value !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const userId = searchParams.get("userId") || ""

    // Calcular el salto para la paginación
    const skip = (page - 1) * limit

    // Construir la consulta de búsqueda
    const query: any = {}

    if (userId) {
      query.userId = userId
    }

    if (search) {
      query.$or = [
        { originalText: { $regex: search, $options: "i" } },
        { translatedText: { $regex: search, $options: "i" } },
      ]
    }

    // Obtener traducciones con paginación
    const translations = (await Translation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()) as unknown as ITranslation[]

    // Obtener el total de traducciones para la paginación
    const total = await Translation.countDocuments(query)

    // Obtener información de usuarios para mostrar nombres en lugar de IDs
    const userIds = [...new Set(translations.map((t) => t.userId))]
    const users = (await User.find({ _id: { $in: userIds } })
      .select("username email")
      .lean()) as unknown as IUser[]

    // Crear un mapa de usuarios para búsqueda rápida
    const userMap: Record<string, IUser> = {}

    users.forEach((user) => {
      const id = user._id.toString()
      userMap[id] = user
    })

    // Añadir información de usuario a cada traducción
    const translationsWithUserInfo = translations.map((translation) => {
      const userId = translation.userId.toString()
      return {
        ...translation,
        user: userMap[userId] || { username: "Usuario desconocido" },
      }
    })

    return NextResponse.json({
      translations: translationsWithUserInfo,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
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
