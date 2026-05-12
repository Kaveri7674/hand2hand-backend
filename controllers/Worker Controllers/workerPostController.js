import WorkerPost from "../../models/WorkerModels/WorkerPost.js";
import WorkerProfile from "../../models/WorkerModels/WorkerProfile.js";
import Request from "../../models/marketplace/RequestModel.js";

// CREATE WORKER POST
export const createWorkerPost = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Only workers can create posts" });
    }

    const {
      service,
      expectedSalaryPerDay,
      experienceYears,
      availableFrom,
      phone,
      address,
      coordinates,
      additionalInfo
    } = req.body;

    const newPost = await WorkerPost.create({
      worker: req.user._id,
      service,
      expectedSalaryPerDay,
      experienceYears,
      availableFrom,
      phone,
      address,
      location: {
        type: "Point",
        coordinates: [0, 0]
      },
      additionalInfo
    });

    res.status(201).json({
      message: "Worker post created successfully",
      post: newPost
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//To filter posts by loccation,service, minSalary, minExperience
export const getNearbyWorkerPosts = async (req, res) => {
  try {

    const { service, minSalary, minExperience, rating } = req.query;

    const query = {};

    if (service && service !== "All") {
      query.service = service;
    }

    if (minSalary) {
      query.expectedSalaryPerDay = { $gte: Number(minSalary) };
    }

    if (minExperience) {
      query.experienceYears = { $gte: Number(minExperience) };
    }

    const posts = await WorkerPost.find(query)
      // .populate("worker", "username");
      .populate("worker", "username profileImage")

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {

        const profile = await WorkerProfile.findOne({
          user: post.worker._id
        });

        const request = await Request.findOne({
          sender: req.user._id,
          postId: post._id,
          postType: "WorkerPost"
        });

        return {
          ...post.toObject(),
          profileImage: profile?.profileImage || "",
          rating: profile?.stats?.rating || 0,

          requestStatus: request?.status || null,
          requestId: request?._id || null
        };

      })
    );

    res.status(200).json({ posts: enrichedPosts });

  } catch (error) {
    console.log("Worker posts error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET MY WORKER POSTS
export const getMyWorkerPosts = async (req, res) => {
  try {
    const posts = await WorkerPost.find({
      worker: req.user._id
    }).sort({ createdAt: -1 });

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const profile = await WorkerProfile.findOne({
          user: post.worker
        });

        return {
          ...post.toObject(),
          profileImage: profile?.profileImage || "",
          workerName: profile?.name || "",
          rating: profile?.stats?.rating || 0
        };
      })
    );

    res.status(200).json({ posts: enrichedPosts });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE WORKER POST
export const updateWorkerPost = async (req, res) => {
  try {
    const post = await WorkerPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.worker.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    post.name = req.body.name;
    post.service = req.body.service;
    post.expectedSalaryPerDay = req.body.expectedSalaryPerDay;
    post.experienceYears = req.body.experienceYears;
    post.availableFrom = req.body.availableFrom;
    post.phone = req.body.phone;
    post.additionalInfo = req.body.additionalInfo;
    if (req.body.coordinates) {
      post.location = {
        type: "Point",
        coordinates: req.body.coordinates
      };
    }
    post.address = req.body.address;

    const updatedPost = await post.save();

    res.status(200).json({
      message: "Worker post updated",
      post: updatedPost
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE WORKER POST
export const deleteWorkerPost = async (req, res) => {
  try {
    const post = await WorkerPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//TOGGLE WORKER POST STATUS
export const toggleWorkerPostStatus = async (req, res) => {
  try {
    const post = await WorkerPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.isActive = !post.isActive;
    await post.save();

    res.status(200).json({ post });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};