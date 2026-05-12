import express from "express";

import {
  getMyNotifications,
  markAsRead
} from "../../controllers/marketplace/notificationController.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// all routes need login
router.use(authMiddleware);
// get my notifications
router.get("/mine",getMyNotifications);
router.patch("/read/:notificationId",markAsRead);


export default router;