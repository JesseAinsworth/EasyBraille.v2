import { MongoClient, type Db } from "mongodb"

// Configuración de la conexión a MongoDB
const MONGODB_URI =
  "mongodb+srv://morningstar180421:M.star2216@cluster0.53gcs.mongodb.net/easybraille?retryWrites=true&w=majority"
const MONGODB_DB = "easybraille"

// Variables para almacenar la conexión en caché
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

// Opciones de conexión mejoradas
const options = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 120000,
  retryWrites: true,
  retryReads: true,
}

// Función para conectar a MongoDB (usada internamente)
export async function connectToDatabase() {
  try {
    if (cachedClient && cachedDb) {
      console.log("✅ Usando conexión a MongoDB existente")
      return { client: cachedClient, db: cachedDb }
    }

    console.log("🔄 Conectando a MongoDB Atlas...")
    console.log(`🌐 URI: ${MONGODB_URI.substring(0, 20)}...`)

    if (!MONGODB_URI) {
      throw new Error("Por favor, define la variable de entorno MONGODB_URI")
    }
    if (!MONGODB_DB) {
      throw new Error("Por favor, define la variable de entorno MONGODB_DB")
    }

    const client = new MongoClient(MONGODB_URI, options)
    await client.connect()
    console.log("✅ Conectado a MongoDB Atlas")

    const db = client.db(MONGODB_DB)
    console.log(`✅ Base de datos seleccionada: ${MONGODB_DB}`)

    await db.command({ ping: 1 })
    console.log("✅ Conexión verificada con ping")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error: any) {
    console.error("❌ Error al conectar a MongoDB:", error)
    if (error.name === "MongoNetworkError") {
      console.error("❌ Error de red de MongoDB. Verifica tu conexión a internet.")
    } else if (error.message.includes("ENOTFOUND")) {
      console.error("❌ No se pudo resolver el nombre de host. Verifica la URI de MongoDB.")
    } else if (error.message.includes("timed out")) {
      console.error("❌ La conexión a MongoDB ha excedido el tiempo de espera.")
    }
    throw error
  }
}

// Nueva función para obtener solo la base de datos (exportada)
export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

// Función para obtener la colección de usuarios
export async function getUsersCollection() {
  const db = await getDatabase()
  return db.collection("users")
}

// Función para obtener la colección de traducciones
export async function getTranslationsCollection() {
  const db = await getDatabase()
  return db.collection("translations")
}

// Función para obtener la colección de interacciones de IA
export async function getAiInteractionsCollection() {
  const db = await getDatabase()
  return db.collection("ai_interactions")
}

// Función para obtener la colección de estadísticas del teclado
export async function getKeyboardStatsCollection() {
  const db = await getDatabase()
  return db.collection("keyboard_stats")
}

// Función para cerrar la conexión (útil para pruebas)
export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log("✅ Conexión a MongoDB cerrada")
  }
}
