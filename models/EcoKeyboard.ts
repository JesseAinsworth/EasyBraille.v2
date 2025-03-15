import mongoose from "mongoose"

const EcoKeyboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  configuration: {
    layout: { type: String, default: "standard" },
    theme: { type: String, default: "light" },
    sensitivity: { type: Number, default: 5, min: 1, max: 10 },
    customKeys: { type: Map, of: String, default: {} },
  },
  history: [
    {
      action: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.EcoKeyboard || mongoose.model("EcoKeyboard", EcoKeyboardSchema)

