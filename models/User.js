import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "worker"], required: true },
    securityQuestions: [
      {
        question: { type: String },
        answer: { type: String }
      }
    ],


    firstname: { type: String },
    lastname:{ type: String },
    address: {
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
      state: { type: String, default: "" },
      district: { type: String, default: "" },
      mandal : { type: String, default: ""},
      village: { type:String, default: ""},
      street: { type: String, default: "" },
      landmark: { type: String, default: "" },
      house: { type: String, default: "" }
    },
    contactNumber: { type: String },
    email: { type: String },

    // Worker specific fields
    skills: [{ type: String }], // ["cook", "driver", "painter"]
    expectedAmount: { type: Number },
    rating: { type: Number, default: 0 },
    points: { type: Number, default: 0 },

    
    // Booking Info
    bookings: [
      {
        work: String,
        date: Date,
        time: String,
        customerAddress: String,
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;


// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
// {
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["customer", "worker"], required: true }
// },
// { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);
// export default User;