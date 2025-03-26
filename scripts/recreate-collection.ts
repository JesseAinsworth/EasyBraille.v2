import mongoose from "mongoose"
import { config } from "dotenv"

// Cargar variables de entorno
config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Por favor define la variable de entorno MONGODB_URI")
}

async function recreateCollection() {
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

    // Verificar si la colección existe
    const collections = await db.listCollections({ name: "translations" }).toArray()

    if (collections.length > 0) {
      // Eliminar la colección existente
      await db.collection("translations").drop()
      console.log("Colección 'translations' eliminada")
    }

    // Crear la colección con el esquema correcto
    await db.createCollection("translations", {
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
          },
        },
      },
    })

    console.log("Colección 'translations' recreada con éxito")

    // Crear índice
    await db.collection("translations").createIndex({ userId: 1 })
    console.log("Índice creado en la colección 'translations'")
  } catch (error) {
    console.error("Error al recrear colección:", error)
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect()
    console.log("Desconectado de MongoDB")
  }
}

// Ejecutar la función
recreateCollection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error en el script:", error)
    process.exit(1)
  })

