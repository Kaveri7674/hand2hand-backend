import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});
// console.log("Cloud Name:", process.env.CLOUD_NAME);
// console.log("API Key:", process.env.CLOUD_API_KEY);

export default cloudinary;

// All imports are executed BEFORE any code in server.js runs

// server.js imports routes
// routes import upload.js
// upload.js imports cloudinary.js
// cloudinary.js runs immediately
// process.env still empty

// REAL FIX
// import dotenv from "dotenv";
// dotenv.config();  
// at top of cloudinary.js