import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.warn("MONGODB_URI no está definido en las variables de entorno. Usando una conexión de prueba.")
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    // Si no hay URI de MongoDB, usar una conexión de prueba para desarrollo
    const uri = MONGODB_URI || "mongodb://localhost:27017/easybraille_dev"

    console.log("Conectando a MongoDB...")
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log("Conexión a MongoDB establecida")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise

    // Verificar que la conexión tenga una base de datos
    if (!mongoose.connection.db) {
      console.warn("La conexión a la base de datos no está completamente establecida")
      // Esperar un poco más para asegurar que la conexión esté lista
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!mongoose.connection.db) {
        throw new Error("No se pudo establecer conexión con la base de datos")
      }
    }

    return cached.conn
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error)
    cached.promise = null
    throw error
  }
}

export default dbConnect

