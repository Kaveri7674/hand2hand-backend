import WorkerProfile from "../../models/WorkerModels/WorkerProfile.js";

export const getWorkerProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(200).json(null);
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const saveWorkerProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      bio,
      services,
      socialLinks
    } = req.body;

    let profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new WorkerProfile({
        user: req.user._id
      });
    }

    profile.name = name;
    profile.phone = phone;
    profile.email = email;
    profile.address = address;
    profile.bio = bio;
    profile.services = services;
    profile.socialLinks = socialLinks;

    await profile.save();

    res.json(profile);

  } catch (err) {
    res.status(500).json({ message: "Save failed" });
  }
};


export const uploadProfileImage = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.profileImage = req.file.path;

    await profile.save();

    res.json({ profileImage: profile.profileImage });

  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};


// TO UPLOAD IMAGES IN EXPERIENCE SECTION
export const uploadExperienceImages = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (!Array.isArray(profile.experienceMedia)) {
      profile.experienceMedia = [];
    }

    const newImages = req.files.map(file => ({
      url: file.path
    }));

    profile.experienceMedia.push(...newImages);

    await profile.save();

    res.json(profile.experienceMedia);

  } catch (err) {
    console.log("❌ Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};


// DELETE IMAGE
export const deleteExperienceImage = async (req, res) => {
  try {
    const { url } = req.body;

    const profile = await WorkerProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.experienceMedia = profile.experienceMedia.filter(
      img => img.url !== url
    );

    await profile.save();

    res.json(profile.experienceMedia);

  } catch (err) {
    console.log("❌ Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// export const deleteExperienceImage = async (req, res) => {
//   try {
//     const { url } = req.body;

//     const profile = await WorkerProfile.findOne({ user: req.user._id });

//     if (!profile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     profile.experienceMedia = profile.experienceMedia.filter(
//       item => item.url !== url
//     );

//     await profile.save();

//     res.json(profile.experienceMedia);

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Delete failed" });
//   }
// };
