import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "../../../lib/mongodb"
import User from "../../../models/User"

export async function POST(req: Request) {
  await dbConnect()

  const { username, password } = await req.json()

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = new User({ username, password: hashedPassword })
    await user.save()
    return NextResponse.json({ message: "Usuario registrado exitosamente" })
  } catch (error) {
    return NextResponse.json({ message: "Error al registrar usuario" }, { status: 400 })
  }
}
