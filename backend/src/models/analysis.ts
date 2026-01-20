import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    bloomLevel: { type: String, required: true },
    confidence: { type: Number, required: true },
    explanation: { type: String },
    category: { type: String }, // LOTS / MOTS / HOTS
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);
