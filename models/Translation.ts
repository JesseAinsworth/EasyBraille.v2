import mongoose from "mongoose"

const TranslationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalText: { type: String, required: true },
  translatedText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // Añadir campo para almacenar la imagen original si se procesó una imagen
  originalImage: {
    data: Buffer,
    contentType: String,
  },
  // Añadir campo para almacenar la imagen procesada
  processedImage: {
    data: Buffer,
    contentType: String,
  },
})

export default mongoose.models.Translation || mongoose.model("Translation", TranslationSchema)

