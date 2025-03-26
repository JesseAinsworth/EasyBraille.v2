import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
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
  },
  {
    // Desactivar la validación estricta para permitir campos adicionales
    strict: false,
  },
)

// Verificar si el modelo ya existe antes de crearlo
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User

