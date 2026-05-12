import express from "express";
import {
  getCustomerStats,
  getWorkerStats
} from "../../controllers/marketplace/profileStatsController.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/customer-stats",getCustomerStats);
router.get("/worker-stats", getWorkerStats);

export default router;