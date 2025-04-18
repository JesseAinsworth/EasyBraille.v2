import { getUsersCollection } from "@/lib/mongodb"
import type { User } from "@/models/User"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function findUserByEmail(email: string): Promise<User | null> {
  const collection = await getUsersCollection()
  return collection.findOne({ email }) as Promise<User | null>
}

export async function findUserById(id: string): Promise<User | null> {
  const collection = await getUsersCollection()
  return collection.findOne({ _id: new ObjectId(id) }) as Promise<User | null>
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
  const collection = await getUsersCollection()

  // Verificar si el usuario ya existe
  const existingUser = await findUserByEmail(userData.email)
  if (existingUser) {
    throw new Error("El usuario ya existe")
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const now = new Date()
  const newUser: User = {
    ...userData,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newUser as any)
  return {
    ...newUser,
    _id: result.insertedId.toString(),
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  const collection = await getUsersCollection()

  // No permitir actualizar el email a uno que ya existe
  if (userData.email) {
    const existingUser = await findUserByEmail(userData.email)
    if (existingUser && existingUser._id !== id) {
      throw new Error("El email ya está en uso")
    }
  }

  // Si se actualiza la contraseña, hashearla
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10)
  }

  const updateData = {
    ...userData,
    updatedAt: new Date(),
  }

  await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

  return findUserById(id)
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  // No devolver la contraseña
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword as User
}

export async function getAllUsers(): Promise<User[]> {
  const collection = await getUsersCollection()
  return collection.find({}).toArray() as Promise<User[]>
}
