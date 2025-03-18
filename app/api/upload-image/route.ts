import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import mongoose from "mongoose"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value

    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ message: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    // Convertir el archivo a un buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type

    try {
      // Enfoque 1: Usar directamente el modelo de mongoose para encontrar y actualizar
      const user = await User.findById(userId)

      if (!user) {
        return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
      }

      // Actualizar manualmente los campos
      user.profileImage = {
        data: buffer,
        contentType: contentType,
      }

      // Guardar sin validación
      await user.save({ validateBeforeSave: false })

      // Crear una URL de datos para devolver al cliente
      const base64Image = buffer.toString("base64")
      const imageUrl = `data:${contentType};base64,${base64Image}`

      return NextResponse.json({ message: "Imagen subida exitosamente", imageUrl })
    } catch (updateError) {
      console.error("Error específico al actualizar usuario:", updateError)

      // Enfoque 2: Usar directamente la colección de MongoDB
      try {
        // Verificar que la conexión y db existan
        if (!mongoose.connection || !mongoose.connection.db) {
          throw new Error("No se pudo establecer conexión con la base de datos")
        }

        const db = mongoose.connection.db
        const result = await db.collection("users").updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          {
            $set: {
              "profileImage.data": buffer,
              "profileImage.contentType": contentType,
            },
          },
        )

        if (result.matchedCount === 0) {
          return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
        }

        // Crear una URL de datos para devolver al cliente
        const base64Image = buffer.toString("base64")
        const imageUrl = `data:${contentType};base64,${base64Image}`

        return NextResponse.json({ message: "Imagen subida exitosamente (método alternativo)", imageUrl })
      } catch (directDbError) {
        console.error("Error al usar método alternativo:", directDbError)
        throw directDbError // Re-lanzar para el manejador de errores principal
      }
    }
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

