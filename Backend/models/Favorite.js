// models/Favorite.js
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },
    canvasJson: { type: Object, required: true },
    type: String,
    width: Number,
    height: Number,
    thumbnail: { type: String }, // base64 preview
    isActive: {
      type: Number,
      default: 0,
    },
    deletedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Favorite", favoriteSchema);
