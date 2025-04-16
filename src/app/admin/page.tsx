"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Users, History, Settings, PlusCircle, Trash2, Edit, Save, X, BarChart3 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface FeedbackItem {
  id: string
  userId: string
  userName: string
  message: string
  createdAt: string
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is admin
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== "admin") {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    setIsAdmin(true)

    // Load mock data
    const mockUsers: User[] = [
      {
        id: "1",
        name: "Administrador",
        email: "admin@example.com",
        role: "admin",
        createdAt: "2023-01-01T10:00:00Z",
      },
      {
        id: "2",
        name: "Usuario",
        email: "user@example.com",
        role: "user",
        createdAt: "2023-01-15T14:30:00Z",
      },
      {
        id: "3",
        name: "María López",
        email: "maria@example.com",
        role: "user",
        createdAt: "2023-02-10T09:15:00Z",
      },
      {
        id: "4",
        name: "Carlos Rodríguez",
        email: "carlos@example.com",
        role: "user",
        createdAt: "2023-03-05T16:45:00Z",
      },
    ]

    const mockFeedback: FeedbackItem[] = [
      {
        id: "1",
        userId: "2",
        userName: "Usuario",
        message: "La aplicación es muy útil, pero sería mejor si tuviera más opciones de personalización.",
        createdAt: "2023-04-10T11:20:00Z",
      },
      {
        id: "2",
        userId: "3",
        userName: "María López",
        message: "Encontré un error al traducir textos largos. A veces se queda cargando indefinidamente.",
        createdAt: "2023-04-15T09:30:00Z",
      },
      {
        id: "3",
        userId: "4",
        userName: "Carlos Rodríguez",
        message: "¡Excelente herramienta! Me ha ayudado mucho en mis estudios de Braille.",
        createdAt: "2023-04-20T14:45:00Z",
      },
    ]

    setUsers(mockUsers)
    setFeedback(mockFeedback)
  }, [router, toast])

  const handleAddUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: "Nuevo Usuario",
      email: "nuevo@example.com",
      role: "user",
      createdAt: new Date().toISOString(),
    }

    setUsers([...users, newUser])
    setEditingUser(newUser.id)
    setEditName(newUser.name)
    setEditEmail(newUser.email)
    setEditRole(newUser.role)

    toast({
      title: "Usuario añadido",
      description: "Se ha añadido un nuevo usuario. Edita sus detalles.",
    })
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id))

    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado correctamente.",
    })
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user.id)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditRole(user.role)
  }

  const handleSaveUser = (id: string) => {
    setUsers(
      users.map((user) => (user.id === id ? { ...user, name: editName, email: editEmail, role: editRole } : user)),
    )

    setEditingUser(null)

    toast({
      title: "Usuario actualizado",
      description: "Los datos del usuario han sido actualizados correctamente.",
    })
  }

  const handleDeleteFeedback = (id: string) => {
    setFeedback(feedback.filter((item) => item.id !== id))

    toast({
      title: "Feedback eliminado",
      description: "El feedback ha sido eliminado correctamente.",
    })
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <History className="mr-2 h-4 w-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios registrados en la plataforma</CardDescription>
                </div>
                <Button onClick={handleAddUser}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-4 font-medium border-b">
                  <div>Nombre</div>
                  <div>Email</div>
                  <div>Rol</div>
                  <div>Fecha de registro</div>
                  <div className="text-right">Acciones</div>
                </div>
                <div className="divide-y">
                  {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-5 p-4 items-center">
                      {editingUser === user.id ? (
                        <>
                          <div>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="max-w-[200px]"
                            />
                          </div>
                          <div>
                            <Input
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="max-w-[200px]"
                            />
                          </div>
                          <div>
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="user">Usuario</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </div>
                          <div>{new Date(user.createdAt).toLocaleDateString("es-ES")}</div>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleSaveUser(user.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>{user.name}</div>
                          <div>{user.email}</div>
                          <div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {user.role === "admin" ? "Administrador" : "Usuario"}
                            </span>
                          </div>
                          <div>{new Date(user.createdAt).toLocaleDateString("es-ES")}</div>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback de Usuarios</CardTitle>
              <CardDescription>Revisa los comentarios y sugerencias de los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              {feedback.length > 0 ? (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{item.userName}</CardTitle>
                            <CardDescription>{new Date(item.createdAt).toLocaleDateString("es-ES")}</CardDescription>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteFeedback(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{item.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay feedback de usuarios</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Ajusta la configuración general de la plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nombre del sitio</Label>
                  <Input id="siteName" defaultValue="EasyBraille" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descripción del sitio</Label>
                  <Textarea id="siteDescription" defaultValue="Traductor de Braille a Español y viceversa" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de contacto</Label>
                  <Input id="contactEmail" defaultValue="contacto@easybraille.com" />
                </div>
                <Button>Guardar cambios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>Resumen de actividad en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Usuarios</h3>
                      </div>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Feedback</h3>
                      </div>
                      <p className="text-2xl font-bold">{feedback.length}</p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Traducciones (últimos 7 días)</h3>
                    </div>
                    <div className="h-40 flex items-end justify-between gap-2 pt-4">
                      {[45, 30, 60, 80, 55, 90, 70].map((value, index) => (
                        <div key={index} className="relative flex-1">
                          <div
                            className="bg-primary rounded-t w-full absolute bottom-0"
                            style={{ height: `${value}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span>Sáb</span>
                      <span>Dom</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
