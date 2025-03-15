import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

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
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ message: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    // Convertir el archivo a un buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type

    // Actualizar el perfil del usuario con la imagen en la base de datos
    await User.findByIdAndUpdate(userId, {
      profileImage: {
        data: buffer,
        contentType: contentType,
      },
    })

    // Crear una URL de datos para devolver al cliente
    const base64Image = buffer.toString("base64")
    const imageUrl = `data:${contentType};base64,${base64Image}`

    return NextResponse.json({ message: "Imagen subida exitosamente", imageUrl })
  } catch (error: any) {
    console.error("Error al subir la imagen:", error)
    return NextResponse.json(
      {
        message: "Error al subir la imagen",
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

