// import multer from "multer";
// import pkg from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const { CloudinaryStorage } = pkg;

// const createUploader = (folderName) => {
//   const storage = new CloudinaryStorage({
//     cloudinary,
//     params: async (req, file) => {
//       const isVideo = file.mimetype.startsWith("video");
//       const isAudio = file.mimetype.startsWith("audio");

//       return {
//         folder: `hand2hand/${folderName}`,
//         resource_type: isVideo || isAudio ? "video" : "image",
//         allowed_formats: isVideo
//           ? ["mp4", "mov", "avi"]
//           : isAudio
//           ? ["mp3", "wav", "m4a"]
//           : ["jpg", "jpeg", "png"]
//       };
//     }
//   });

//   return multer({ storage });
// };

// export default createUploader;
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import cloudinaryStorage from "multer-storage-cloudinary";

const createUploader = (folderName) => {
  const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: `hand2hand/${folderName}`,
    allowedFormats: ["jpg", "jpeg", "png", "mp4", "mov", "avi", "mp3", "wav", "m4a"],
  });

  return multer({ storage });
};

export default createUploader;