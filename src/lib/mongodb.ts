import { MongoClient } from "mongodb"

// MongoDB connection URI
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/easybraille"

// Create MongoDB client (no necesita ServerApi para local)
const client = new MongoClient(uri)

// Variable to store connection
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("❌ Falló la conexión a MongoDB local:", err)
      throw err
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  clientPromise = client.connect().catch((err) => {
    console.error("❌ Falló la conexión a MongoDB local:", err)
    throw err
  })
}

export default clientPromise

// Función para obtener la base de datos
export async function getDatabase() {
  try {
    const client = await clientPromise
    return client.db("easybraille")
  } catch (error) {
    console.error("❌ Error al obtener la base de datos:", error)
    throw error
  }
}

// Accesos a colecciones
export async function getAiInteractionsCollection() {
  const db = await getDatabase()
  return db.collection("aiinteractions")
}

export async function getEcoKeyboardsCollection() {
  const db = await getDatabase()
  return db.collection("ecokeyboards")
}

export async function getTranslationsCollection() {
  const db = await getDatabase()
  return db.collection("translations")
}

export async function getUsersCollection() {
  const db = await getDatabase()
  return db.collection("users")
}
