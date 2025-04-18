"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Upload, User, Lock, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg?height=128&width=128")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setName(parsedUser.name || "")
    setEmail(parsedUser.email || "")

    // Cargar avatar si existe
    if (parsedUser.avatarUrl) {
      setAvatarUrl(parsedUser.avatarUrl)
    }
  }, [router])

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular actualización de perfil
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          name,
          email,
          avatarUrl,
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))

        toast({
          title: "Perfil actualizado",
          description: "Tu información de perfil ha sido actualizada correctamente.",
        })
      }

      setIsLoading(false)
    }, 1000)
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden.",
        variant: "destructive",
      })
      return
    }

    // En una aplicación real, verificaríamos la contraseña actual
    // Para esta demo, simplemente simulamos la actualización
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsLoading(false)
    }, 1000)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // En una aplicación real, subiríamos el archivo a un servidor
      // Para esta demo, usamos FileReader para obtener una URL de datos
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setAvatarUrl(imageUrl)

        // Actualizar el avatar en el usuario
        if (user) {
          const updatedUser = {
            ...user,
            avatarUrl: imageUrl,
          }

          localStorage.setItem("user", JSON.stringify(updatedUser))

          toast({
            title: "Avatar actualizado",
            description: "Tu imagen de perfil ha sido actualizada correctamente.",
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  if (!user) {
    return null // Se redirigirá en el useEffect
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Configuración de la cuenta</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información personal</CardTitle>
                <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Imagen de perfil</CardTitle>
                <CardDescription>Actualiza tu foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Subir imagen
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      setAvatarUrl("/placeholder.svg?height=128&width=128")

                      // Actualizar el avatar en el usuario
                      if (user) {
                        const updatedUser = {
                          ...user,
                          avatarUrl: "/placeholder.svg?height=128&width=128",
                        }

                        localStorage.setItem("user", JSON.stringify(updatedUser))

                        toast({
                          title: "Avatar restablecido",
                          description: "Tu imagen de perfil ha sido restablecida.",
                        })
                      }
                    }}
                  >
                    Restablecer
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tokens de seguridad</CardTitle>
                <CardDescription>Administra los tokens de acceso a tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Sesión actual</p>
                        <p className="text-sm text-muted-foreground">Navegador: {navigator.userAgent.split(" ")[0]}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Activa
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Aplicación móvil</p>
                        <p className="text-sm text-muted-foreground">Último acceso: Nunca</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Revocar
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Ver todas las sesiones activas
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones por correo electrónico</p>
                    <p className="text-sm text-muted-foreground">
                      Recibe actualizaciones importantes por correo electrónico
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Activar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de seguridad</p>
                    <p className="text-sm text-muted-foreground">
                      Recibe alertas sobre actividad sospechosa en tu cuenta
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Activar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de nuevas funciones</p>
                    <p className="text-sm text-muted-foreground">
                      Mantente al día con las últimas actualizaciones de la plataforma
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Activar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
