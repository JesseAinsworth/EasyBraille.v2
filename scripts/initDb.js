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
              bsonType: ["object", "null"],
              properties: {
                data: {
                  bsonType: ["binData", "null"],
                  description: "Debe ser un binData o null",
                },
                contentType: {
                  bsonType: ["string", "null"],
                  description: "Debe ser un string o null",
                },
              },
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
    })

    console.log("Colección de usuarios creada exitosamente")

    // Crear índices para usuarios
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })

    // Crear colección de traducciones
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

    console.log("Colección de traducciones creada exitosamente")
    await db.collection("translations").createIndex({ userId: 1 })

    // Crear colección de interacciones con IA
    await db.createCollection("aiinteractions", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "inputText", "expectedOutput"],
          properties: {
            userId: {
              bsonType: "objectId",
              description: "Debe ser un ObjectId y es requerido",
            },
            inputText: {
              bsonType: "string",
              description: "Debe ser un string y es requerido",
            },
            expectedOutput: {
              bsonType: "string",
              description: "Debe ser un string y es requerido",
            },
            manualCorrection: {
              bsonType: "string",
              description: "Debe ser un string",
            },
            accuracy: {
              bsonType: "number",
              minimum: 0,
              maximum: 100,
              description: "Debe ser un número entre 0 y 100",
            },
            createdAt: {
              bsonType: "date",
              description: "Debe ser una fecha",
            },
          },
        },
      },
    })

    console.log("Colección de interacciones con IA creada exitosamente")
    await db.collection("aiinteractions").createIndex({ userId: 1 })

    // Crear colección de teclado ecológico
    await db.createCollection("ecokeyboards", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId"],
          properties: {
            userId: {
              bsonType: "objectId",
              description: "Debe ser un ObjectId y es requerido",
            },
            configuration: {
              bsonType: "object",
              properties: {
                layout: {
                  bsonType: "string",
                  description: "Debe ser un string",
                },
                theme: {
                  bsonType: "string",
                  description: "Debe ser un string",
                },
                sensitivity: {
                  bsonType: "number",
                  minimum: 1,
                  maximum: 10,
                  description: "Debe ser un número entre 1 y 10",
                },
                customKeys: {
                  bsonType: "object",
                  description: "Debe ser un objeto",
                },
              },
            },
            history: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["action", "timestamp"],
                properties: {
                  action: {
                    bsonType: "string",
                    description: "Debe ser un string",
                  },
                  timestamp: {
                    bsonType: "date",
                    description: "Debe ser una fecha",
                  },
                },
              },
            },
            createdAt: {
              bsonType: "date",
              description: "Debe ser una fecha",
            },
          },
        },
      },
    })

    console.log("Colección de teclado ecológico creada exitosamente")
    await db.collection("ecokeyboards").createIndex({ userId: 1 }, { unique: true })

    console.log("Todas las colecciones e índices creados exitosamente")
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err)
  } finally {
    await client.close()
    console.log("Conexión a MongoDB cerrada")
  }
}

initializeDatabase()

