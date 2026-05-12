import express from "express";
import {
  createRequest,
  getRequestsForPost,
  acceptRequest,
  rejectRequest,
  cancelRequest
} from "../../controllers/marketplace/requestController.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 All routes require authentication
router.use(authMiddleware);

// Send request to a post
router.post("/", createRequest);

// Get all requests for a specific post
router.get("/:postType/:postId", getRequestsForPost);

// Accept a request
router.patch("/accept/:requestId", acceptRequest);

// Reject a request
router.patch("/reject/:requestId", rejectRequest);

// Cancel a request (sender cancels)
router.patch("/cancel/:requestId", cancelRequest);

export default router;
