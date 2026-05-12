import mongoose from "mongoose";
const customerPostSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    serviceNeeded: {
      type: String,
      required: true
    },

    dateOfService: {
      type: Date,
      required: true
    },

    durationDays: {
      type: Number,
      required: true
    },

    budgetPerDay: {
      type: Number,
      required: true
    },

    // budgetPerDay: String,

    phone: String,

    // address: {
    //   street: String,
    //   city: String,
    //   state: String,
    //   pincode: String
    // },
    address: String,

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: false
      }
    },
    description: String,
    additionalRequirements: String,

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

customerPostSchema.index({ location: "2dsphere" });

export default mongoose.model("CustomerPost", customerPostSchema);
