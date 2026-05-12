import CustomerProfile from "../../models/CustomerModels/CustomerProfile.js";

/* ================= GET PROFILE ================= */

export const getMyCustomerProfile = async (req, res) => {
  try {
    let profile = await CustomerProfile.findOne({
      user: req.user._id
    });

    if (!profile) {
      return res.json(null); // profile not created yet
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE OR UPDATE PROFILE ================= */

export const createOrUpdateCustomerProfile = async (req, res) => {
  try {
    const existingProfile = await CustomerProfile.findOne({
      user: req.user._id
    });

    if (existingProfile) {
      const updated = await CustomerProfile.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        { new: true }
      );

      return res.json(updated);
    }

    const newProfile = await CustomerProfile.create({
      ...req.body,
      user: req.user._id
    });

    res.json(newProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE PROFILE IMAGE ================= */

export const updateCustomerProfileImage = async (req, res) => {
  try {
    const profile = await CustomerProfile.findOne({
      user: req.user._id
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.profileImage = req.file.path;
    await profile.save();

    res.json({ profileImage: profile.profileImage });
  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
