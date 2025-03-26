import mongoose from "mongoose"
import { config } from "dotenv"

// Cargar variables de entorno
config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Por favor define la variable de entorno MONGODB_URI")
}

async function updateCollectionSchema() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Conectado a MongoDB")

    // Verificar que la conexión y db existan
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("No se pudo establecer conexión con la base de datos")
    }

    // Ahora TypeScript sabe que db está definido
    const db = mongoose.connection.db

    // Actualizar el esquema de validación de la colección translations
    await db.command({
      collMod: "translations",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "originalText", "translatedText"],
          properties: {
            userId: {
              bsonType: "objectId",
              description: "Debe ser un ObjectId y es requerido",
            },
            originalText: {
              bsonType: "string",
              description: "Debe ser un string y es requerido",
            },
            translatedText: {
              bsonType: "string",
              description: "Debe ser un string y es requerido",
            },
            createdAt: {
              bsonType: "date",
              description: "Debe ser una fecha",
            },
            originalImage: {
              bsonType: "object",
              properties: {
                data: {
                  bsonType: "binData",
                  description: "Debe ser datos binarios",
                },
                contentType: {
                  bsonType: "string",
                  description: "Debe ser un string",
                },
              },
            },
            processedImage: {
              bsonType: "object",
              properties: {
                data: {
                  bsonType: "binData",
                  description: "Debe ser datos binarios",
                },
                contentType: {
                  bsonType: "string",
                  description: "Debe ser un string",
                },
              },
            },
          },
        },
      },
      validationLevel: "moderate",
    })

    console.log("Esquema de validación actualizado correctamente")
  } catch (error) {
    console.error("Error al actualizar esquema de validación:", error)
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect()
    console.log("Desconectado de MongoDB")
  }
}

// Ejecutar la función
updateCollectionSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error en el script:", error)
    process.exit(1)
  })

