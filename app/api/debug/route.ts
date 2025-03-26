import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import mongoose from "mongoose"
import Translation from "@/models/Translation"

export async function GET(req: Request) {
  try {
    await dbConnect()

    // Verificar que la conexión y db existan
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("No se pudo establecer conexión con la base de datos")
    }

    // Ahora TypeScript sabe que db está definido
    const db = mongoose.connection.db

    // Obtener información sobre las colecciones
    const collections = await db.listCollections().toArray()

    // Obtener estadísticas de cada colección
    const stats: Record<string, { count: number }> = {}
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments()
      stats[collection.name] = { count }
    }

    // Verificar la conexión a la base de datos
    const connectionStatus = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    }

    // Verificar los modelos registrados
    const registeredModels = Object.keys(mongoose.models)

    // Verificar la estructura del esquema de Translation
    const translationSchema = Translation.schema.obj

    return NextResponse.json({
      connectionStatus,
      collections,
      stats,
      registeredModels,
      translationSchema,
    })
  } catch (error: any) {
    console.error("Error en diagnóstico:", error)
    return NextResponse.json(
      {
        error: "Error en diagnóstico",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// Ruta para probar la inserción de una traducción
export async function POST(req: Request) {
  try {
    await dbConnect()

    const { userId, originalText, translatedText } = await req.json()

    // Verificar que userId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          error: "userId no es un ObjectId válido",
          userId,
        },
        { status: 400 },
      )
    }

    // Intentar crear y guardar una traducción
    const translation = new Translation({
      userId: new mongoose.Types.ObjectId(userId),
      originalText,
      translatedText,
      createdAt: new Date(),
    })

    try {
      const savedTranslation = await translation.save()
      return NextResponse.json({
        success: true,
        message: "Traducción guardada exitosamente",
        translation: savedTranslation,
      })
    } catch (saveError: any) {
      // Capturar errores de validación
      if (saveError.name === "ValidationError") {
        const validationErrors = Object.keys(saveError.errors).map((field) => ({
          field,
          message: saveError.errors[field].message,
        }))
        return NextResponse.json(
          {
            error: "Error de validación",
            validationErrors,
          },
          { status: 400 },
        )
      }

      // Otros errores de MongoDB
      return NextResponse.json(
        {
          error: "Error al guardar en MongoDB",
          name: saveError.name,
          code: saveError.code,
          message: saveError.message,
          stack: process.env.NODE_ENV === "development" ? saveError.stack : undefined,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error en prueba de inserción:", error)
    return NextResponse.json(
      {
        error: "Error en prueba de inserción",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

