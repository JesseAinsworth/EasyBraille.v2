import mongoose from "mongoose"

const AIInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  inputText: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  manualCorrection: { type: String },
  accuracy: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
  // Añadir campo para almacenar la imagen de entrada si se procesó una imagen
  inputImage: {
    data: Buffer,
    contentType: String,
  },
})

export default mongoose.models.AIInteraction || mongoose.model("AIInteraction", AIInteractionSchema)

