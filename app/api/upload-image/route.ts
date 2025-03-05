import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "../../../lib/mongodb"
import User from "../../../models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value // Asumiendo que el valor de la cookie es el userId

    const formData = await req.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    // Aquí deberías implementar la lógica para subir la imagen a un servicio de almacenamiento
    // y obtener la URL de la imagen subida. Por ahora, usaremos una URL de ejemplo.
    const imageUrl = `/uploads/${image.name}`

    await User.findByIdAndUpdate(userId, { profileImage: imageUrl })

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error al subir la imagen:", error)
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
  }
}

