import mongoose from "mongoose";

const subModuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    parentModule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    isActive: {
      type: String,
      enum: ["true", "false"],
      default: "true",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdByName: {
      type: String,
      default: "system",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    modifiedByName: {
      type: String,
      default: "",
    },
    modifiedAt: {
      type: Date,
      default: null,
    },
    modifiedOn: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure name is unique under the same parent module
subModuleSchema.index({ name: 1, parentModule: 1 }, { unique: true });
// Ensure path is unique under the same parent module
subModuleSchema.index({ path: 1, parentModule: 1 }, { unique: true });

export default mongoose.model("SubModule", subModuleSchema);
