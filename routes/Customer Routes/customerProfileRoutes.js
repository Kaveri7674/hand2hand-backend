import express from "express";
import {
  getMyCustomerProfile,
  createOrUpdateCustomerProfile,
  updateCustomerProfileImage
} from "../../controllers/customercontrollers/customerProfileController.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import createUploader from "../../middleware/upload.js";

const router = express.Router();

const upload = createUploader("customer-profile");

router.get("/me", authMiddleware, getMyCustomerProfile);

router.post("/save", authMiddleware, createOrUpdateCustomerProfile);

router.put(
  "/image",
  authMiddleware,
  upload.single("image"),
  updateCustomerProfileImage
);

export default router;
