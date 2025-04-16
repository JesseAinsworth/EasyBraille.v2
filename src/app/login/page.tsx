"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to authenticate
      // For demo purposes, we'll simulate a successful login
      setTimeout(() => {
        // Check if it's the admin user
        if (email === "admin@example.com" && password === "admin123") {
          // Store user info in localStorage
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: "1",
              name: "Administrador",
              email: "admin@example.com",
              role: "admin",
            }),
          )

          toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido, Administrador",
          })

          router.push("/admin")
        } else if (email === "user@example.com" && password === "user123") {
          // Store user info in localStorage
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: "2",
              name: "Usuario",
              email: "user@example.com",
              role: "user",
            }),
          )

          toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido de nuevo",
          })

          router.push("/translator")
        } else {
          toast({
            title: "Error de inicio de sesión",
            description:
              "Credenciales incorrectas. Para probar, usa admin@example.com/admin123 o user@example.com/user123",
            variant: "destructive",
          })
        }

        setIsLoading(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error durante el inicio de sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/reset-password" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
