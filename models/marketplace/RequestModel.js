import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    postType: {
      type: String,
      enum: ["WorkerPost", "CustomerPost"],
      required: true
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "postType"
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Selected", "Rejected", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

// 🔒 Compound unique index
requestSchema.index(
  { postId: 1, sender: 1 },
  { unique: true }
);

export default mongoose.model("Request", requestSchema);
