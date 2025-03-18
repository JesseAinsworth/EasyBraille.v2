import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
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

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
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
    cached.promise = null
    throw error
  }
}

export default dbConnect

