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

    // URL para restablecer la contraseña
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Verificar si estamos en modo desarrollo y usar un transporter de prueba
    const isDevelopment = process.env.NODE_ENV !== "production"
    
    try {
      let transporter
      let info
      
      if (isDevelopment) {
        // En desarrollo, no enviar correo, solo simular
        console.log("Modo desarrollo: Simulando envío de correo")
        console.log(`Token de recuperación: ${resetToken}`)
        console.log(`URL de recuperación: ${resetUrl}`)
        
        // Devolver éxito en modo desarrollo sin intentar enviar correo
        return NextResponse.json({ 
          message: "Se ha generado un token de recuperación (modo desarrollo)", 
          resetToken, // Solo enviar el token en modo desarrollo
          resetUrl    // Solo enviar la URL en modo desarrollo
        })
      } else {
        // En producción, configurar transporter real
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        // Enviar correo electrónico
        info = await transporter.sendMail({
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
      }

      return NextResponse.json({ message: "Se ha enviado un correo de recuperación" })
    } catch (emailError: any) {
      console.error("Error al enviar correo:", emailError)
      
      // Si hay error al enviar el correo pero estamos en desarrollo, aún podemos proporcionar el token
      if (isDevelopment) {
        return NextResponse.json({ 
          message: "Error al enviar correo, pero se ha generado un token (modo desarrollo)", 
          resetToken, 
          resetUrl,
          error: emailError.message
        })
      }
      
      // En producción, revierte los cambios y reporta el error
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
      
      throw emailError // Re-lanzar para el manejador general
    }
  } catch (error: any) {
    console.error("Error al recuperar la contraseña:", error)
    return NextResponse.json(
      {
        error: "Error al enviar el correo de recuperación",
        message: error.message || "Error desconocido",
        code: error.code,
        command: error.command
      },
      { status: 500 }
    )
  }
}