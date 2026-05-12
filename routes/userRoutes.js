// // routes/user.js
// import express from "express";
// import User from "../models/User.js";

// const router = express.Router();

// // Update Profile
// router.put("/update/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true } // return updated document
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "Profile updated successfully", user: updatedUser });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
import express from "express";
import User from "../models/User.js";

const router = express.Router();


// ✅ Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ Update user
router.put("/update/:id", async (req, res) => {
  try {
    console.log("🛠 Update request received for ID:", req.params.id);
    console.log("📦 Data received:", req.body);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          contactNumber: req.body.contactNumber,
          address: req.body.address,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully ✅",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id/password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

  // Hash new password and save
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password updated successfully", user });
});

export default router;
