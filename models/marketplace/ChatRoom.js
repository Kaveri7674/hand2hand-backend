import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],

    lastMessage: {
      type: String,
      default: ""
    },

    lastMessageType: {
      type: String,
      enum: ["text", "image", "audio"],
      default: "text"
    }
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate chats
chatRoomSchema.index({ participants: 1 });

export default mongoose.model("ChatRoom", chatRoomSchema);