import { NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    // Asegurarnos de que la conexión esté establecida
    await dbConnect()

    // Verificar que la conexión y db existan
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("No se pudo establecer conexión con la base de datos")
    }

    // Ahora podemos acceder a db con seguridad
    const db = mongoose.connection.db

    // Eliminar el validador existente
    await db.command({
      collMod: "users",
      validator: {},
    })

    // Crear un nuevo validador más permisivo
    await db.command({
      collMod: "users",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              bsonType: "string",
              description: "Debe ser un string y es requerido",
            },
            email: {
              bsonType: "string",
              description: "Debe ser un email válido y es requerido",
            },
            password: {
              bsonType: "string",
              description: "Debe ser un string y es requerido",
            },
            // Permitir cualquier tipo para profileImage
            profileImage: {
              description: "Puede ser cualquier tipo",
            },
            resetPasswordToken: {
              bsonType: ["string", "null"],
              description: "Debe ser un string o null",
            },
            resetPasswordExpires: {
              bsonType: ["date", "null"],
              description: "Debe ser una fecha o null",
            },
            createdAt: {
              bsonType: "date",
              description: "Debe ser una fecha",
            },
          },
        },
      },
      validationLevel: "moderate",
    })

    return NextResponse.json({ message: "Esquema de base de datos actualizado exitosamente" })
  } catch (error: any) {
    console.error("Error al actualizar esquema:", error)
    return NextResponse.json(
      {
        message: "Error al actualizar esquema",
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

