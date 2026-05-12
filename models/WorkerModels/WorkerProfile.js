import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    rating: Number,

    review: String,

    date: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);


const workerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  name: String,
  phone: String,
  email: String,
  address: String,
  bio: String,

  profileImage: {
    type: String,
    default: ""
  },

  services: [String],

  socialLinks: {
    instagram: String,
    facebook: String
  },

//   experienceImages: [String],
    experienceMedia: [
    {
        url: String,
        // type: String // "image" or "video"
    }
    ],
  
  // ✅ NEW — reviews list
  reviews: [reviewSchema],

  stats: {
    jobsDone: { type: Number, default: 0 },
    moneyEarnedThisMonth: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: {type: Number,default: 0},
    successRate: { type: Number, default: 0 }
  }

}, { timestamps: true });

export default mongoose.model("WorkerProfile", workerProfileSchema);
