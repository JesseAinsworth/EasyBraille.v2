import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "../../../lib/mongodb"
import User from "../../../models/User"

export async function POST(req: Request) {
  await dbConnect()

  const { username, password } = await req.json()

  const user = await User.findOne({ username })

  if (user && (await bcrypt.compare(password, user.password))) {
    // En una aplicación real, aquí generarías un token JWT
    return NextResponse.json({ message: "Inicio de sesión exitoso" })
  } else {
    return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
  }
}

