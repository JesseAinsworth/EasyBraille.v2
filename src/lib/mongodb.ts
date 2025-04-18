import { MongoClient, ServerApiVersion } from "mongodb"
import type { AiInteraction } from "@/models/AiInteraction"
import type { EcoKeyboard } from "@/models/EcoKeyboard"
import type { Translation } from "@/models/Translation"
import type { User } from "@/models/User"

// URI de conexión a MongoDB
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://morningstar180421:M.star2216@cluster0.53gcs.mongodb.net/easybraille?retryWrites=true&w=majority"

// Crear un cliente de MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

// Variable para almacenar la conexión
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  clientPromise = client.connect()
}

export default clientPromise

// Función para obtener la base de datos
export async function getDatabase() {
  const client = await clientPromise
  return client.db("easybraille")
}

// Funciones para acceder a colecciones con tipos
export async function getAiInteractionsCollection() {
  const db = await getDatabase()
  return db.collection<AiInteraction>("aiinteractions")
}

export async function getEcoKeyboardsCollection() {
  const db = await getDatabase()
  return db.collection<EcoKeyboard>("ecokeyboards")
}

export async function getTranslationsCollection() {
  const db = await getDatabase()
  return db.collection<Translation>("translations")
}

export async function getUsersCollection() {
  const db = await getDatabase()
  return db.collection<User>("users")
}
