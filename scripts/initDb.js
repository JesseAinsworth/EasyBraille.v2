const { MongoClient } = require("mongodb")
require("dotenv").config()

const uri = process.env.MONGODB_URI
const dbName = "easybraille"

async function initializeDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  try {
    await client.connect()
    console.log("Conectado exitosamente a MongoDB")

    const db = client.db(dbName)

    // Crear colección de usuarios
    await db.createCollection("users", {
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
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
              description: "Debe ser un email válido y es requerido",
            },
            password: {
              bsonType: "string",
              description: "Debe ser un string y es requerido",
            },
            profileImage: {
              bsonType: "string",
              description: "Debe ser un string",
            },
            resetPasswordToken: {
              bsonType: "string",
              description: "Debe ser un string",
            },
            resetPasswordExpires: {
              bsonType: "date",
              description: "Debe ser una fecha",
            },
            createdAt: {
              bsonType: "date",
              description: "Debe ser una fecha",
            },
          },
        },
      },
    })

    console.log("Colección de usuarios creada exitosamente")

    // Crear índices
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })

    console.log("Índices creados exitosamente")

    // Crear colección de traducciones
    await db.createCollection("translations", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "braille", "spanish"],
          properties: {
            userId: {
              bsonType: "objectId",
              description: "Debe ser un ObjectId y es requerido",
            },
            braille: {
              bsonType: "string",
              description: "Debe ser un string y es requerido",
            },
            spanish: {
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

    console.log("Colección de traducciones creada exitosamente")

    // Crear índice para búsquedas rápidas de traducciones por usuario
    await db.collection("translations").createIndex({ userId: 1 })

    console.log("Índice de traducciones creado exitosamente")
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err)
  } finally {
    await client.close()
    console.log("Conexión a MongoDB cerrada")
  }
}

initializeDatabase()

require("dotenv").config();

console.log("MongoDB URI:", process.env.MONGODB_URI); // <-- Agrega esta línea para depurar
