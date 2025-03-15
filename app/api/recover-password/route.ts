import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import nodemailer from "nodemailer"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { email } = await req.json()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "No se encontró un usuario con ese correo electrónico" }, { status: 404 })
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(20).toString("hex")
    const resetTokenExpiration = Date.now() + 3600000 // 1 hora

    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpiration
    await user.save()

    // Configurar el transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // URL para restablecer la contraseña
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    // Enviar correo electrónico
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Recuperación de contraseña - EasyBraille",
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña para EasyBraille.</p>
        <p>Haz clic en el siguiente enlace para continuar el proceso:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `,
    })

    return NextResponse.json({ message: "Se ha enviado un correo de recuperación" })
  } catch (error: any) {
    console.error("Error al recuperar la contraseña:", error)
    return NextResponse.json(
      {
        error: "Error al enviar el correo de recuperación",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

