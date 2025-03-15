import mongoose from "mongoose"

const TranslationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalText: { type: String, required: true },
  translatedText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Translation || mongoose.model("Translation", TranslationSchema)

