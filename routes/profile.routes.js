import express from "express";
import Profile from "../models/Profile.js";
import auth from "../middleware/auth.js";
import createUploader from "../utils/createUploader.js";

const router = express.Router();
const upload = createUploader("profile");

/* ---------------- GET MY PROFILE ---------------- */
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPDATE PROFILE ---------------- */
router.put("/me", auth, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPLOAD PROFILE IMAGE ---------------- */
router.put(
  "/image",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.profileImage = req.file.path; // Cloudinary URL
      await profile.save();

      res.json({ profileImage: profile.profileImage });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
