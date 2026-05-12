import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import createUploader from "../../middleware/upload.js";

import {
  startChat,
  sendMessage,
  getMessages,
  getMyChats,
  searchUsers
} from "../../controllers/marketplace/chatController.js";


const router = express.Router();

router.use(authMiddleware);

// 🔥 create uploader instance
const upload = createUploader("chat");

router.post("/start", startChat);
router.post(
  "/message",
  upload.fields([
    { name: "images", maxCount: 3 },
    { name: "audio", maxCount: 1 }
  ]),
  sendMessage
);
router.get("/messages/:roomId", getMessages);
router.get("/my-chats", getMyChats);
router.get("/search-users", searchUsers);

export default router;