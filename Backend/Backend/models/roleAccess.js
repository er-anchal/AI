import mongoose from "mongoose";

const RoleAccessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    moduleAccess: [
      {
        moduleName: String,
        permissions: {
          view: { type: Boolean, default: false },
          create: { type: Boolean, default: false },
          edit: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
        },
      },
    ],

    //  CREATED INFO
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdByName: String,

    createdOn: {
      type: String,
    },

    //  UPDATED INFO
    // modifiedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
    // modifiedByName: String,
    modifiedAt: {
      type: Date,
    },
    modifiedOn: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("RoleAccess", RoleAccessSchema);
