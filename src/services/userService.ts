import { getUsersCollection } from "@/lib/mongodb"
import type { User } from "@/models/User"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const collection = await getUsersCollection()
    return collection.findOne({ email }) as Promise<User | null>
  } catch (error) {
    console.error("Error finding user by email:", error)
    throw error
  }
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const collection = await getUsersCollection()
    return collection.findOne({ _id: new ObjectId(id) }) as Promise<User | null>
  } catch (error) {
    console.error("Error finding user by ID:", error)
    throw error
  }
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
  try {
    const collection = await getUsersCollection()

    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email)
    if (existingUser) {
      throw new Error("El usuario ya existe")
    }

    // Hash password
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
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  try {
    const collection = await getUsersCollection()

    // Don't allow updating email to one that already exists
    if (userData.email) {
      const existingUser = await findUserByEmail(userData.email)
      if (existingUser && existingUser._id !== id) {
        throw new Error("El email ya está en uso")
      }
    }

    // If updating password, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10)
    }

    const updateData = {
      ...userData,
      updatedAt: new Date(),
    }

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return findUserById(id)
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await findUserByEmail(email)
    if (!user) return null

    // Compare password with hashed password in database
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error("Error validating user:", error)
    throw error
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const collection = await getUsersCollection()
    return collection.find({}).toArray() as Promise<User[]>
  } catch (error) {
    console.error("Error getting all users:", error)
    throw error
  }
}
