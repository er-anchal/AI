import mongoose from "mongoose";

const FlipbookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    designIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserDesign",
      },
    ],

    coverDesignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDesign",
    },

    pdfUrl: {
      type: String,
    },

    type: {
      type: String,
      enum: ["image", "pdf"],
      default: "image",
    },

    coverImage: String,
  },
  { timestamps: true },
);

const FlipBook = mongoose.model("FlipBook", FlipbookSchema);

export default FlipBook;
