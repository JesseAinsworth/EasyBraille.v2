export interface User {
    _id?: string
    name: string
    email: string
    password: string // En una aplicación real, esto sería un hash
    role: "user" | "admin"
    avatarUrl?: string
    createdAt: Date
    updatedAt: Date
  }
  