// Importar las dependencias necesarias
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Credenciales predeterminadas del administrador
const DEFAULT_ADMIN_USERNAME = "admin"
const DEFAULT_ADMIN_EMAIL = "admin@easybraille.com"
const DEFAULT_ADMIN_PASSWORD = "admin123" // En producción, usar una contraseña segura

async function setupAdmin() {
  try {
    // Obtener la URI de MongoDB de las variables de entorno o usar una por defecto
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/easybraille_dev"

    console.log("Conectando a MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("Conexión establecida a MongoDB")

    // Verificar si ya existe un esquema de usuario, si no, crearlo
    let UserModel
    try {
      UserModel = mongoose.model("User")
      console.log("Modelo de Usuario ya existe")
    } catch (error) {
      console.log("Creando modelo de Usuario...")
      const UserSchema = new mongoose.Schema(
        {
          username: { type: String, required: true, unique: true },
          email: { type: String, required: true, unique: true },
          password: { type: String, required: true },
          role: { type: String, enum: ["user", "admin"], default: "user" },
          profileImage: {
            data: Buffer,
            contentType: String,
          },
          resetPasswordToken: String,
          resetPasswordExpires: Date,
          createdAt: { type: Date, default: Date.now },
        },
        { strict: false },
      )

      UserModel = mongoose.model("User", UserSchema)
    }

    // Verificar si ya existe un administrador
    const existingAdmin = await UserModel.findOne({ role: "admin" })

    if (existingAdmin) {
      console.log("Ya existe un administrador con username:", existingAdmin.username)
      console.log("Si necesitas restablecer la contraseña, usa la función de recuperación de contraseña")
    } else {
      // Crear el administrador predeterminado
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10)

      const adminUser = new UserModel({
        username: DEFAULT_ADMIN_USERNAME,
        email: DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      })

      await adminUser.save()
      console.log("Administrador predeterminado creado con éxito")
    }

    console.log("\n=== CREDENCIALES DE ADMINISTRADOR ===")
    console.log(`Username: ${DEFAULT_ADMIN_USERNAME}`)
    console.log(`Email: ${DEFAULT_ADMIN_EMAIL}`)
    console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`)
    console.log("=====================================")
    console.log("\nPor seguridad, cambia estas credenciales en producción.")
  } catch (error) {
    console.error("Error al configurar el administrador:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Desconectado de MongoDB")
  }
}

// Ejecutar la función
setupAdmin()
