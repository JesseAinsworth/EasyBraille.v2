import { MongoClient, ServerApiVersion } from "mongodb"

// MongoDB connection URI
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://morningstar180421:M.star2216@cluster0.53gcs.mongodb.net/easybraille?retryWrites=true&w=majority"

// Create MongoDB client with proper options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

// Variable to store connection
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve connection between HMR reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("Failed to connect to MongoDB:", err)
      throw err
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production, it's better not to use a global variable
  clientPromise = client.connect().catch((err) => {
    console.error("Failed to connect to MongoDB:", err)
    throw err
  })
}

export default clientPromise

// Function to get the database
export async function getDatabase() {
  try {
    const client = await clientPromise
    return client.db("easybraille")
  } catch (error) {
    console.error("Error getting database:", error)
    throw error
  }
}

// Functions to access collections
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
