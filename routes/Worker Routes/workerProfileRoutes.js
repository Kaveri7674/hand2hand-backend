import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import createUploader from "../../middleware/upload.js";

import {
  getWorkerProfile,
  saveWorkerProfile,
  uploadProfileImage,
  uploadExperienceImages,
  deleteExperienceImage
} from "../../controllers/Worker Controllers/workerProfileController.js";

const router = express.Router();

const uploadProfile = createUploader("worker/profile");
const uploadExperience = createUploader("worker/experience");

router.get("/me", authMiddleware, getWorkerProfile);

router.post("/save", authMiddleware, saveWorkerProfile);

router.put(
  "/profile-image",
  authMiddleware,
  uploadProfile.single("image"),
  uploadProfileImage
);

router.put(
  "/experience",
  authMiddleware,
  uploadExperience.array("images", 10),
  uploadExperienceImages
);

router.delete(
  "/experience",
  authMiddleware,
  deleteExperienceImage
);

export default router;
