import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Translation from "@/models/Translation"
import AIInteraction from "@/models/AIInteraction"
import EcoKeyboard from "@/models/EcoKeyboard"
import bcrypt from "bcryptjs"

// Conectar a la base de datos antes de cualquier operación
const connectDB = async () => {
  await dbConnect()
}

// Funciones para User
export const createUser = async (userData: {
  username: string
  email: string
  password: string
  profileImage?: {
    data: Buffer
    contentType: string
  }
}) => {
  await connectDB()

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  // Crear el usuario
  const user = new User({
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
  })

  await user.save()
  return user
}

export const getUserById = async (userId: string) => {
  await connectDB()
  return await User.findById(userId)
}

export const getUserByEmail = async (email: string) => {
  await connectDB()
  return await User.findOne({ email })
}

export const updateUser = async (userId: string, updateData: any) => {
  await connectDB()

  // Si se actualiza la contraseña, hashearla
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
  }

  return await User.findByIdAndUpdate(userId, updateData, { new: true })
}

// Funciones para Translation
export const createTranslation = async (translationData: {
  userId: string
  originalText: string
  translatedText: string
  originalImage?: {
    data: Buffer
    contentType: string
  }
  processedImage?: {
    data: Buffer
    contentType: string
  }
}) => {
  await connectDB()
  const translation = new Translation({
    ...translationData,
    createdAt: new Date(),
  })

  await translation.save()
  return translation
}

export const getTranslationsByUserId = async (userId: string, limit = 10) => {
  await connectDB()
  return await Translation.find({ userId }).sort({ createdAt: -1 }).limit(limit)
}

// Funciones para AIInteraction
export const createAIInteraction = async (interactionData: {
  userId: string
  inputText: string
  expectedOutput: string
  manualCorrection?: string
  accuracy?: number
  inputImage?: {
    data: Buffer
    contentType: string
  }
}) => {
  await connectDB()
  const interaction = new AIInteraction({
    ...interactionData,
    createdAt: new Date(),
  })

  await interaction.save()
  return interaction
}

export const getAIInteractionsByUserId = async (userId: string, limit = 10) => {
  await connectDB()
  return await AIInteraction.find({ userId }).sort({ createdAt: -1 }).limit(limit)
}

// Funciones para EcoKeyboard
export const createOrUpdateEcoKeyboard = async (keyboardData: {
  userId: string
  configuration?: {
    layout?: string
    theme?: string
    sensitivity?: number
    customKeys?: Map<string, string>
  }
  action?: string
}) => {
  await connectDB()

  // Buscar configuración existente o crear una nueva
  let ecoKeyboard = await EcoKeyboard.findOne({ userId: keyboardData.userId })

  if (ecoKeyboard) {
    // Actualizar configuración existente
    if (keyboardData.configuration) {
      ecoKeyboard.configuration = {
        ...ecoKeyboard.configuration,
        ...keyboardData.configuration,
      }
    }

    // Añadir acción al historial si se proporciona
    if (keyboardData.action) {
      ecoKeyboard.history.push({
        action: keyboardData.action,
        timestamp: new Date(),
      })
    }

    await ecoKeyboard.save()
  } else {
    // Crear nueva configuración
    ecoKeyboard = new EcoKeyboard({
      userId: keyboardData.userId,
      configuration: keyboardData.configuration || {},
      history: keyboardData.action ? [{ action: keyboardData.action, timestamp: new Date() }] : [],
      createdAt: new Date(),
    })
    await ecoKeyboard.save()
  }

  return ecoKeyboard
}

export const getEcoKeyboardByUserId = async (userId: string) => {
  await connectDB()
  return await EcoKeyboard.findOne({ userId })
}

