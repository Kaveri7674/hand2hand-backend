import express from "express";
import {
  createWorkerPost,
  getNearbyWorkerPosts,
  getMyWorkerPosts,
  updateWorkerPost,
  deleteWorkerPost,
  toggleWorkerPostStatus
} from "../../controllers/Worker Controllers/workerPostController.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createWorkerPost);
router.get("/nearby", getNearbyWorkerPosts);
router.get("/mine", getMyWorkerPosts);
router.put("/:id", updateWorkerPost);
router.delete("/:id", deleteWorkerPost);
router.patch("/:id/toggle", toggleWorkerPostStatus);

export default router;