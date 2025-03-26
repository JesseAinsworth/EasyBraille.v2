import { createUser, createTranslation, createAIInteraction, createOrUpdateEcoKeyboard } from "@/lib/db-utils"

const seedDatabase = async () => {
  try {
    console.log("Iniciando la carga de datos de ejemplo...")

    // 1. Crear un usuario de ejemplo
    const user = await createUser({
      username: "usuario_ejemplo",
      email: "ejemplo@easybraille.com",
      password: "contraseña123",
    })

    console.log(`Usuario creado con ID: ${user._id}`)

    // 2. Crear algunas traducciones de ejemplo
    const translations = [
      {
        userId: user._id,
        originalText: "⠁⠃⠉",
        translatedText: "abc",
      },
      {
        userId: user._id,
        originalText: "⠓⠕⠇⠁",
        translatedText: "hola",
      },
    ]

    for (const translation of translations) {
      await createTranslation(translation)
    }

    console.log(`${translations.length} traducciones creadas`)

    // 3. Crear algunas interacciones con IA de ejemplo
    const aiInteractions = [
      {
        userId: user._id,
        inputText: "⠁⠃⠉",
        expectedOutput: "abc",
        manualCorrection: "",
        accuracy: 100,
      },
      {
        userId: user._id,
        inputText: "⠓⠕⠇⠁",
        expectedOutput: "hola",
        manualCorrection: "",
        accuracy: 95,
      },
    ]

    for (const interaction of aiInteractions) {
      await createAIInteraction(interaction)
    }

    console.log(`${aiInteractions.length} interacciones con IA creadas`)

    // 4. Crear configuración de teclado ecológico
    const ecoKeyboard = await createOrUpdateEcoKeyboard({
      userId: user._id,
      configuration: {
        layout: "standard",
        theme: "dark",
        sensitivity: 7,
      },
      action: "Configuración inicial",
    })

    console.log(`Configuración de teclado ecológico creada para el usuario ${user._id}`)

    console.log("Carga de datos de ejemplo completada con éxito")
  } catch (error) {
    console.error("Error al cargar datos de ejemplo:", error)
  }
}

// Ejecutar la función si este archivo se ejecuta directamente
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error en el script de carga:", error)
      process.exit(1)
    })
}

