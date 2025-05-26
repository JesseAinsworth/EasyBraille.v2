import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { findUserByEmail } from "@/services/userService"
import bcrypt from "bcryptjs"

// Configuración de NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          // Error si falta email o contraseña
          return null
        }

        try {
          const user = await findUserByEmail(credentials.email)

          if (!user) {
            // No existe un usuario con el email proporcionado
            return null
          }

          // Comparar la contraseña proporcionada con la guardada en la base de datos
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            // Si la contraseña no es válida, retornar null
            return null
          }

          // Si todo es válido, retornar el objeto de usuario
          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Error durante la autenticación:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",  // Usamos JWT para la sesión
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email  // Opcional: Agregar más detalles si lo necesitas
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string  // Opcional: Agregar más detalles si lo necesitas
      }
      return session
    },
  },
  pages: {
    signIn: "/login", // Página personalizada para el login
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key", // Usar una clave secreta segura en producción
}
