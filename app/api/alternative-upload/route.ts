import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { MongoClient, ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    // Obtener la cookie de sesión
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value

    // Obtener la imagen del formulario
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ message: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    // Convertir el archivo a un buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type

    // Conectar directamente a MongoDB sin usar Mongoose
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI no está definido")
    }

    const client = new MongoClient(MONGODB_URI)

    try {
      await client.connect()
      const db = client.db() // Obtener la base de datos predeterminada

      // Actualizar el usuario directamente en la colección
      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
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

      return NextResponse.json({ message: "Imagen subida exitosamente (método directo)", imageUrl })
    } finally {
      await client.close()
    }
  } catch (error: any) {
    console.error("Error al subir la imagen (método alternativo):", error)
    return NextResponse.json(
      {
        message: "Error al subir la imagen",
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

