import express from "express";
import {
  getMyBookings,
  completeBooking,
  cancelBooking,
  rebookBooking,
  addReviewAndRating
} from "../../controllers/marketplace/bookingController.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/mine", getMyBookings);
router.patch("/complete/:bookingId", completeBooking);
router.patch("/cancel/:bookingId", cancelBooking);
router.patch("/rebook/:bookingId", rebookBooking);
router.patch("/review/:bookingId", addReviewAndRating);

export default router;