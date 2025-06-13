import { MongoClient, type Db } from "mongodb"

// Configuración de la conexión a MongoDB
const MONGODB_URI =
  "mongodb+srv://morningstar180421:M.star2216@cluster0.53gcs.mongodb.net/easybraille?retryWrites=true&w=majority"
const MONGODB_DB = "easybraille"

// Variables para almacenar la conexión
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

// Opciones de conexión mejoradas
const options = {
  connectTimeoutMS: 30000, // Aumentar timeout de conexión
  socketTimeoutMS: 45000, // Aumentar timeout de socket
  serverSelectionTimeoutMS: 60000, // Aumentar timeout de selección de servidor
  maxPoolSize: 10, // Limitar el número de conexiones en el pool
  minPoolSize: 5, // Mantener un mínimo de conexiones
  maxIdleTimeMS: 120000, // Tiempo máximo de inactividad
  retryWrites: true,
  retryReads: true,
}

export async function connectToDatabase() {
  try {
    // Si ya tenemos una conexión, la reutilizamos
    if (cachedClient && cachedDb) {
      console.log("✅ Usando conexión a MongoDB existente")
      return { client: cachedClient, db: cachedDb }
    }

    // Si no hay una conexión, creamos una nueva
    console.log("🔄 Conectando a MongoDB Atlas...")
    console.log(`🌐 URI: ${MONGODB_URI.substring(0, 20)}...`)

    if (!MONGODB_URI) {
      throw new Error("Por favor, define la variable de entorno MONGODB_URI")
    }

    if (!MONGODB_DB) {
      throw new Error("Por favor, define la variable de entorno MONGODB_DB")
    }

    // Crear un nuevo cliente de MongoDB con opciones mejoradas
    const client = new MongoClient(MONGODB_URI, options)

    // Conectar al cliente
    await client.connect()
    console.log("✅ Conectado a MongoDB Atlas")

    // Obtener la base de datos
    const db = client.db(MONGODB_DB)
    console.log(`✅ Base de datos seleccionada: ${MONGODB_DB}`)

    // Verificar la conexión con una operación simple
    await db.command({ ping: 1 })
    console.log("✅ Conexión verificada con ping")

    // Guardar la conexión en caché
    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error: any) {
    console.error("❌ Error al conectar a MongoDB:", error)

    // Información detallada sobre el error
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

// Función para obtener la colección de usuarios
export async function getUsersCollection() {
  try {
    const { db } = await connectToDatabase()
    return db.collection("users")
  } catch (error) {
    console.error("❌ Error al obtener la colección de usuarios:", error)
    throw error
  }
}

// Función para obtener la colección de traducciones
export async function getTranslationsCollection() {
  try {
    const { db } = await connectToDatabase()
    return db.collection("translations")
  } catch (error) {
    console.error("❌ Error al obtener la colección de traducciones:", error)
    throw error
  }
}

// Función para obtener la colección de interacciones de IA
export async function getAiInteractionsCollection() {
  try {
    const { db } = await connectToDatabase()
    return db.collection("ai_interactions")
  } catch (error) {
    console.error("❌ Error al obtener la colección de interacciones de IA:", error)
    throw error
  }
}

// Función para obtener la colección de estadísticas del teclado
export async function getKeyboardStatsCollection() {
  try {
    const { db } = await connectToDatabase()
    return db.collection("keyboard_stats")
  } catch (error) {
    console.error("❌ Error al obtener la colección de estadísticas del teclado:", error)
    throw error
  }
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
