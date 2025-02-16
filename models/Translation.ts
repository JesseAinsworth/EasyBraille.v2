import mongoose from "mongoose"

const TranslationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  braille: String,
  spanish: String,
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Translation || mongoose.model("Translation", TranslationSchema)

