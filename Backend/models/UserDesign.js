import mongoose from "mongoose";

const UserDesignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },

    // name: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    canvasJson: {
      type: Object, // Fabric JSON
      required: true,
    },

    type: String,
    width: Number,
    height: Number,

    thumbnail: {
      type: String,
    },
    // mode: {
    //   type: String,
    //   enum: ["template", "user-design"],
    //   default: "user-design",
    // },
    // tags: { type: [String], default: [] },
    // canvasWidth: { type: Number },
    // canvasHeight: { type: Number },
    // version: { type: Number, default: 1 },
    // metadata: { type: Object, default: {} },
    isActive: {
      type: Number,
      default: 0,
    },
    deletedAt: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);
UserDesignSchema.index({ userId: 1, createdAt: -1 });

export const UserDesign = mongoose.model("UserDesign", UserDesignSchema);
