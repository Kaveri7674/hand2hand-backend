import CustomerPost from "../../models/CustomerModels/CustomerPost.js";
import CustomerProfile from "../../models/CustomerModels/CustomerProfile.js";
import Request from "../../models/marketplace/RequestModel.js";

// CREATE
export const createCustomerPost = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can create posts" });
    }

    const {
      serviceNeeded,
      address,
      phone,
      dateOfService,
      durationDays,
      budgetPerDay,
      description,
      additionalRequirements,
      coordinates
    } = req.body;

    const newPost = await CustomerPost.create({
      customer: req.user._id,
      serviceNeeded,
      phone,
      dateOfService,
      durationDays,
      budgetPerDay,
      description,
      additionalRequirements,
      location: {
        type: "Point",
        coordinates
      },
      address
    });

    res.status(201).json({
      message: "Customer post created successfully",
      post: newPost
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY POSTS
// export const getMyCustomerPosts = async (req, res) => {
//   try {
//     const posts = await CustomerPost.find({
//       customer: req.user._id
//     }).sort({ createdAt: -1 });

//     res.status(200).json({ posts });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const getMyCustomerPosts = async (req, res) => {
  try {
    const posts = await CustomerPost.find({
      customer: req.user._id
    }).sort({ createdAt: -1 });

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const profile = await CustomerProfile.findOne({
          user: post.customer
        });

        return {
          ...post.toObject(),
          profileImage: profile?.profileImage || "",
          customerName: profile?.name || ""
        };
      })
    );

    res.status(200).json({ posts: enrichedPosts });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//To get customer posts in worker side including post'sstatus
export const getCustomerPosts = async (req, res) => {
  try {
    const { service, minSalary, minExperience } = req.query;

    const query = {};

    if (service && service !== "All Jobs") {
      query.serviceNeeded = service;
    }

    if (minSalary) {
      query.budgetPerDay = { $gte: Number(minSalary) };
    }

    if (minExperience) {
      query.requiredExperience = { $gte: Number(minExperience) };
    }

    const posts = await CustomerPost.find(query)
      // .populate("customer", "username")
      .populate("customer", "username profileImage")
      .sort({ createdAt: -1 });

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {

        // 🔹 Get customer profile
        const profile = await CustomerProfile.findOne({
          user: post.customer._id
        });

        // 🔹 Check if THIS worker already sent request
        const request = await Request.findOne({
          sender: req.user._id,
          postId: post._id,
          postType: "CustomerPost"
        });

        return {
          ...post.toObject(),
          profileImage: profile?.profileImage || "",
          customerName: profile?.name || post.customer.username,
          requestStatus: request?.status || null, 
          requestId: request?._id || null  // 👈 IMPORTANT
        };
      })
    );

    res.status(200).json({ posts: enrichedPosts });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATES THE POST
export const updateCustomerPost = async (req, res) => {
  try {
    const post = await CustomerPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 🔥 FIXED HERE
    if (post.customer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    post.serviceNeeded = req.body.serviceNeeded;
    post.phone = req.body.phone;
    post.dateOfService = req.body.dateOfService;
    post.durationDays = req.body.durationDays;
    post.description = req.body.description;
    post.budgetPerDay = req.body.budgetPerDay;
    post.additionalRequirements = req.body.additionalRequirements;
    post.location = {
      type: "Point",
      coordinates: req.body.coordinates
    };
    post.address = req.body.address;

    const updatedPost = await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteCustomerPost = async (req, res) => {
  try {
    const post = await CustomerPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

