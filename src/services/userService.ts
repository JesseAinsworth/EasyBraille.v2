import { ObjectId } from "mongodb"
import { hash, compare } from "bcryptjs"
import { getUsersCollection } from "@/lib/mongodb"
import { type User, type CreateUserData, type UpdateUserData, validateUserData } from "@/models/User"

export async function createUser(userData: CreateUserData): Promise<User> {
  // Validar datos
  const validation = validateUserData(userData)
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${validation.errors.join(", ")}`)
  }

  const usersCollection = await getUsersCollection()

  // Verificar si el usuario ya existe
  const existingUser = await usersCollection.findOne({ email: userData.email })
  if (existingUser) {
    throw new Error("El usuario ya existe")
  }

  // Hashear la contraseña
  const hashedPassword = await hash(userData.password, 10)

  // Crear el usuario
  const newUser: Omit<User, "_id"> = {
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    password: hashedPassword,
    role: userData.role || "user",
    avatarUrl: userData.avatarUrl,
    createdAt: new Date(),
    isActive: true,
  }

  const result = await usersCollection.insertOne(newUser)

  return {
    ...newUser,
    _id: result.insertedId,
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const usersCollection = await getUsersCollection()
  return await usersCollection.findOne({ _id: new ObjectId(userId) })
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const usersCollection = await getUsersCollection()
  return await usersCollection.findOne({ email: email.toLowerCase().trim() })
}

export async function updateUser(userId: string, updateData: UpdateUserData): Promise<User | null> {
  const usersCollection = await getUsersCollection()

  const updateFields: UpdateUserData = {
    ...updateData,
    updatedAt: new Date(),
  }

  // Si se está actualizando la contraseña, hashearla
  if (updateData.password) {
    updateFields.password = await hash(updateData.password, 10)
  }

  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: updateFields },
    { returnDocument: "after" },
  )

  return result
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user) {
    return null
  }

  const isValid = await compare(password, user.password)
  if (!isValid) {
    return null
  }

  // Actualizar último login
  await updateUser(user._id!.toString(), { lastLogin: new Date() })

  return user
}

export async function getAllUsers(): Promise<User[]> {
  const usersCollection = await getUsersCollection()
  return await usersCollection.find({}).toArray()
}

export async function deleteUser(userId: string): Promise<boolean> {
  const usersCollection = await getUsersCollection()
  const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) })
  return result.deletedCount === 1
}
