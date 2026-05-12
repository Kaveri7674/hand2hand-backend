import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "post_created",
        "request_sent",
        "request_received",
        "request_accepted",
        "booking_created",
        "booking_cancelled",
        "booking_completed",
        "review_added",
        "rating_added",
        "rebooked",
        "post_updated"
      ]
    },

    // optional references

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    },

    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request"
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId
    },

    isRead: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification",notificationSchema);

export default Notification;