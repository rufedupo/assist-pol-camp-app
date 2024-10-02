import mongoose from "mongoose";

const LeaderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  indications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Indication" }]
});

export default mongoose.models.Leader || mongoose.model("Leader", LeaderSchema);