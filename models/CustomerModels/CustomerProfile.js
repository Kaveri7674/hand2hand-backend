// import mongoose from "mongoose";

// const addressSchema = new mongoose.Schema(
//   {
//     country: { type: String, default: "" },
//     pincode: { type: String, default: "" },
//     state: { type: String, default: "" },
//     district: { type: String, default: "" },
//     mandal: { type: String, default: "" },
//     village: { type: String, default: "" },
//     street: { type: String, default: "" },
//     landmark: { type: String, default: "" },
//     house: { type: String, default: "" }
//   },
//   { _id: false }
// );

// const profileSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       unique: true
//     },

//     role: {
//       type: String,
//       enum: ["customer", "worker"],
//       required: true
//     },

//     name: { type: String, default: "" },
//     phone: { type: String, default: "" },
//     email: { type: String, default: "" },

//     profileImage: {
//       type: String,
//       default: "https://i.pravatar.cc/300"
//     },

//     address: { type: String, default: "" },
//     addressDetails: addressSchema,

//     // Customer-only (future use)
//     savedWorkers: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "User" }
//     ],

//     // Worker-only (future use)
//     skills: [{ type: String }],
//     expectedAmount: { type: Number },
//     rating: { type: Number, default: 0 }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Profile", profileSchema);
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  country: String,
  pincode: String,
  state: String,
  district: String,
  mandal: String,
  village: String,
  street: String,
  landmark: String,
  house: String
}, { _id: false });

const customerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    name: String,
    email: String,
    phone: String,
    profileImage: String,

    address: String,
    addressDetails: addressSchema,

    preferences: [String],
    rating: { type: Number, default: 0 },

    //     // Customer-only (future use)
    //     savedWorkers: [
    //       { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    //     ],

    // dynamic stats (will calculate later)
    jobsBooked: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    savedWorkers: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("CustomerProfile", customerProfileSchema);
