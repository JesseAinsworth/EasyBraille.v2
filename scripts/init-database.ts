import mongoose from "mongoose"
import { config } from "dotenv"

// Cargar variables de entorno
config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Por favor define la variable de entorno MONGODB_URI")
}

async function initDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Conectado a MongoDB")

    // Definir esquemas
    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      profileImage: {
        data: Buffer,
        contentType: String,
      },
      resetPasswordToken: String,
      resetPasswordExpires: Date,
      createdAt: { type: Date, default: Date.now },
    })

    const TranslationSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      originalText: { type: String, required: true },
      translatedText: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      originalImage: {
        data: Buffer,
        contentType: String,
      },
      processedImage: {
        data: Buffer,
        contentType: String,
      },
    })

    const AIInteractionSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      inputText: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      manualCorrection: { type: String },
      accuracy: { type: Number, min: 0, max: 100 },
      createdAt: { type: Date, default: Date.now },
      inputImage: {
        data: Buffer,
        contentType: String,
      },
    })

    const EcoKeyboardSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      configuration: {
        layout: { type: String, default: "standard" },
        theme: { type: String, default: "light" },
        sensitivity: { type: Number, default: 5, min: 1, max: 10 },
        customKeys: { type: Map, of: String, default: {} },
      },
      history: [
        {
          action: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
      createdAt: { type: Date, default: Date.now },
    })

    // Crear modelos
    const models = mongoose.connection.models

    if (!models.User) mongoose.model("User", UserSchema)
    if (!models.Translation) mongoose.model("Translation", TranslationSchema)
    if (!models.AIInteraction) mongoose.model("AIInteraction", AIInteractionSchema)
    if (!models.EcoKeyboard) mongoose.model("EcoKeyboard", EcoKeyboardSchema)

    console.log("Modelos creados exitosamente")

    // Crear índices
    const db = mongoose.connection.db

    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("translations").createIndex({ userId: 1 })
    await db.collection("aiinteractions").createIndex({ userId: 1 })
    await db.collection("ecokeyboards").createIndex({ userId: 1 }, { unique: true })

    console.log("Índices creados exitosamente")
    console.log("Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect()
    console.log("Desconectado de MongoDB")
  }
}

// Ejecutar la función si este archivo se ejecuta directamente
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error en el script de inicialización:", error)
      process.exit(1)
    })
}

