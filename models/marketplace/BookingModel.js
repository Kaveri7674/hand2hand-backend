import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active"
    },
    rebooked: { type: Boolean, default: false },
    completedAt: Date,

    // rating given by customer
    rating: {
      type: Number,
      default: 0
    },

    // review text
    review: {
      type: String,
      default: ""
    },

    // to prevent multiple reviews
    reviewed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;  
