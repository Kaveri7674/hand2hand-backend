import mongoose from "mongoose";

const workerPostSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    service: {
      type: String,
      required: true,
      trim: true
    },

    expectedSalaryPerDay: {
      type: Number,
      required: true
    },

    experienceYears: {
      type: Number,
      required: true
    },

    availableFrom: {
      type: Date,
      required: true
    },

    phone: String,

    // address: {
    //   street: String,
    //   city: String,
    //   state: String,
    //   pincode: String
    // },
    address: String,

    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     default: "Point"
    //   },
    //   coordinates: {
    //     type: [Number], // [longitude, latitude]
    //     required: true
    //   }
    // },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },

    additionalInfo: String,

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

workerPostSchema.index({ location: "2dsphere" });

export default mongoose.model("WorkerPost", workerPostSchema);
