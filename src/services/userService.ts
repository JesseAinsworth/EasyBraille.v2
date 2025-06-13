import { getUsersCollection } from "@/lib/mongodb"
import { hash, compare } from "bcryptjs"
import { ObjectId } from "mongodb"
import { createToken } from "@/lib/auth"

// Función para crear un nuevo usuario
export async function createUser(userData: any) {
  try {
    console.log("🔄 userService: Creando usuario:", userData.email)

    const usersCollection = await getUsersCollection()

    // Verificar si el email ya existe
    const existingUser = await usersCollection.findOne({ email: userData.email })
    if (existingUser) {
      console.log("❌ userService: Email ya registrado:", userData.email)
      throw new Error("El email ya está registrado")
    }

    // Hash de la contraseña
    const hashedPassword = await hash(userData.password, 10)

    // Crear el nuevo usuario
    const newUser = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insertar en la base de datos
    const result = await usersCollection.insertOne(newUser)
    console.log("✅ userService: Usuario creado con ID:", result.insertedId)

    // Devolver el usuario creado con su ID
    return {
      ...newUser,
      _id: result.insertedId,
    }
  } catch (error: any) {
    console.error("❌ userService ERROR al crear usuario:", error)
    throw error
  }
}

// Función para actualizar un usuario existente
export async function updateUser(userId: string, updateData: any) {
  try {
    console.log("🔄 userService: Actualizando usuario:", userId)

    const usersCollection = await getUsersCollection()

    // Convertir ID a ObjectId si es posible
    let objectId
    try {
      objectId = new ObjectId(userId)
    } catch (error) {
      console.log("⚠️ userService: ID no válido, usando como string:", userId)
      objectId = userId
    }

    // Si hay una nueva contraseña, hashearla
    if (updateData.password) {
      updateData.password = await hash(updateData.password, 10)
    }

    // Añadir fecha de actualización
    updateData.updatedAt = new Date()

    // Actualizar el usuario
    const result = await usersCollection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!result) {
      console.log("❌ userService: Usuario no encontrado:", userId)
      throw new Error("Usuario no encontrado")
    }

    console.log("✅ userService: Usuario actualizado:", userId)
    return result
  } catch (error: any) {
    console.error("❌ userService ERROR al actualizar usuario:", error)
    throw error
  }
}

// Función para eliminar un usuario
export async function deleteUser(userId: string) {
  try {
    console.log("🔄 userService: Eliminando usuario:", userId)

    const usersCollection = await getUsersCollection()

    // Convertir ID a ObjectId si es posible
    let objectId
    try {
      objectId = new ObjectId(userId)
    } catch (error) {
      console.log("⚠️ userService: ID no válido, usando como string:", userId)
      objectId = userId
    }

    // Eliminar el usuario
    const result = await usersCollection.deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      console.log("❌ userService: Usuario no encontrado:", userId)
      throw new Error("Usuario no encontrado")
    }

    console.log("✅ userService: Usuario eliminado:", userId)
    return true
  } catch (error: any) {
    console.error("❌ userService ERROR al eliminar usuario:", error)
    throw error
  }
}

// Función para autenticar un usuario
export async function authenticateUser(email: string, password: string) {
  try {
    console.log("🔄 userService: Autenticando usuario:", email)

    const usersCollection = await getUsersCollection()

    // Buscar el usuario por email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      console.log("❌ userService: Usuario no encontrado:", email)
      throw new Error("Credenciales inválidas")
    }

    // Verificar la contraseña
    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      console.log("❌ userService: Contraseña incorrecta para:", email)
      throw new Error("Credenciales inválidas")
    }

    console.log("✅ userService: Usuario autenticado:", email)

    // Generar token JWT
    const token = createToken(user)

    // Devolver usuario y token (sin la contraseña)
    const { password: _, ...userWithoutPassword } = user

    return {
      user: {
        ...userWithoutPassword,
        _id: user._id.toString(),
      },
      token,
    }
  } catch (error: any) {
    console.error("❌ userService ERROR al autenticar usuario:", error)
    throw error
  }
}

// Función para obtener un usuario por ID
export async function getUserById(userId: string) {
  try {
    console.log("🔄 userService: Obteniendo usuario por ID:", userId)

    const usersCollection = await getUsersCollection()

    // Convertir ID a ObjectId si es posible
    let objectId
    try {
      objectId = new ObjectId(userId)
    } catch (error) {
      console.log("⚠️ userService: ID no válido, usando como string:", userId)
      objectId = userId
    }

    // Buscar el usuario
    const user = await usersCollection.findOne({ _id: objectId })

    if (!user) {
      console.log("❌ userService: Usuario no encontrado:", userId)
      return null
    }

    console.log("✅ userService: Usuario encontrado:", userId)

    // Devolver usuario sin la contraseña
    const { password, ...userWithoutPassword } = user

    return {
      ...userWithoutPassword,
      _id: user._id.toString(),
    }
  } catch (error: any) {
    console.error("❌ userService ERROR al obtener usuario:", error)
    throw error
  }
}

// Función para obtener todos los usuarios
export async function getAllUsers() {
  try {
    console.log("🔄 userService: Obteniendo todos los usuarios")

    const usersCollection = await getUsersCollection()

    // Obtener todos los usuarios
    const users = await usersCollection.find({}).toArray()

    console.log(`✅ userService: ${users.length} usuarios encontrados`)

    // Devolver usuarios sin contraseñas
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return {
        ...userWithoutPassword,
        _id: user._id.toString(),
      }
    })
  } catch (error: any) {
    console.error("❌ userService ERROR al obtener usuarios:", error)
    throw error
  }
}
