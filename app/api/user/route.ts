import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Crear un objeto de usuario sin la contraseña
    const userObject = user.toObject()
    delete userObject.password

    // Convertir la imagen a base64 si existe
    if (userObject.profileImage && userObject.profileImage.data) {
      const base64Image = userObject.profileImage.data.toString("base64")
      userObject.profileImage = `data:${userObject.profileImage.contentType};base64,${base64Image}`
    } else {
      userObject.profileImage = "https://via.placeholder.com/200"
    }

    return NextResponse.json(userObject)
  } catch (error: any) {
    console.error("Error al obtener datos del usuario:", error)
    return NextResponse.json(
      {
        error: "Error al obtener datos del usuario",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

