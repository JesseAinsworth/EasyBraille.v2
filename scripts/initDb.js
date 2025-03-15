const { MongoClient } = require("mongodb")
require("dotenv").config()

const uri = process.env.MONGODB_URI
const dbName = "easybraille"

async function initializeDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Conectado exitosamente a MongoDB")

    const db = client.db(dbName)

    // Check if collections exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Create users collection if it doesn't exist
    if (!collectionNames.includes("users")) {
      console.log("Creando colección de usuarios...")
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

      // Create indexes for users
      await db.collection("users").createIndex({ username: 1 }, { unique: true })
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      console.log("Índices de usuarios creados exitosamente")
    } else {
      console.log("La colección de usuarios ya existe")
    }

    // Create translations collection if it doesn't exist
    if (!collectionNames.includes("translations")) {
      console.log("Creando colección de traducciones...")
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

      // Create index for translations
      await db.collection("translations").createIndex({ userId: 1 })
      console.log("Índice de traducciones creado exitosamente")
    } else {
      console.log("La colección de traducciones ya existe")
    }

    console.log("Inicialización de la base de datos completada")
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err)
  } finally {
    await client.close()
    console.log("Conexión a MongoDB cerrada")
  }
}

initializeDatabase()

