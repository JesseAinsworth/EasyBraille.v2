import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

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

    // Calcular el salto para la paginación
    const skip = (page - 1) * limit

    // Construir la consulta de búsqueda
    let query = {}
    if (search) {
      query = {
        $or: [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      }
    }

    // Obtener usuarios con paginación
    const users = await User.find(query)
      .select("-password -profileImage.data") // Excluir datos sensibles
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Obtener el total de usuarios para la paginación
    const total = await User.countDocuments(query)

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json(
      {
        error: "Error al obtener usuarios",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
