import express from "express";
import {
  createCustomerPost,
  getMyCustomerPosts,
  updateCustomerPost,
  deleteCustomerPost,
  getCustomerPosts,
} from "../../controllers/customercontrollers/customerPostController.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createCustomerPost);
// 👇 IMPORTANT: put this BEFORE "/mine" ... 
//If you put /mine first, Express might treat "mine" as /.
router.get("/", getCustomerPosts);

router.get("/mine", getMyCustomerPosts);
router.put("/:id", updateCustomerPost);
router.delete("/:id", deleteCustomerPost);

export default router;