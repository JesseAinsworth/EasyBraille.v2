import { NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import User from "../../../models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { token, password } = await req.json()

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Actualizar el usuario
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return NextResponse.json({ message: "Contraseña restablecida con éxito" })
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error)
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 })
  }
}

