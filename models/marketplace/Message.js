import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String
    },

    images: [
      {
        type: String
      }
    ],

    audio: {
      type: String
    },

    messageType: {
      type: String,
      enum: ["text", "image", "audio"],
      required: true
    },
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId }],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId }],
    
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);