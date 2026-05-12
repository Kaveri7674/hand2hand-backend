import Request from "../../models/marketplace/RequestModel.js";
import WorkerPost from "../../models/WorkerModels/WorkerPost.js";
import CustomerPost from "../../models/CustomerModels/CustomerPost.js";
import Booking from "../../models/marketplace/BookingModel.js";
import WorkerProfile from "../../models/WorkerModels/WorkerProfile.js";
import CustomerProfile from "../../models/CustomerModels/CustomerProfile.js";
import {createNotification} from "./notificationController.js";

// CREATE REQUEST
export const createRequest = async (req, res) => {
  try {
    const { postId, postType } = req.body;

    const senderId = req.user._id;
    const senderRole = req.user.role;

    // ✅ 1. Validate postType first
    if (postType !== "WorkerPost" && postType !== "CustomerPost") {
      return res.status(400).json({ message: "Invalid post type" });
    }

    // ✅ 2. Role validation BEFORE DB query
    if (postType === "WorkerPost" && senderRole !== "customer") {
      return res.status(403).json({
        message: "Only customers can request worker posts"
      });
    }

    if (postType === "CustomerPost" && senderRole !== "worker") {
      return res.status(403).json({
        message: "Only workers can request customer posts"
      });
    }

    // ✅ 3. Fetch post AFTER validation
    let post;

    if (postType === "WorkerPost") {
      post = await WorkerPost.findById(postId);
    } else {
      post = await CustomerPost.findById(postId);
    }

    if (!post || !post.isActive) {
      return res.status(404).json({
        message: "Post not found or inactive"
      });
    }

    // ✅ 4. Prevent sending request to own post
    if (
      post.worker?.toString() === senderId.toString() ||
      post.customer?.toString() === senderId.toString()
    ) {
      return res.status(400).json({
        message: "Cannot send request to your own post"
      });
    }

    // ✅ 5. Check if already selected request exists for this post
    const existingSelected = await Request.findOne({
      postId,
      postType,
      status: "Selected"
    });

    if (existingSelected) {
      return res.status(400).json({
        message: "Post already engaged"
      });
    }

    const receiverId = post.worker || post.customer;

    // ✅ 6. Create request
    const newRequest = await Request.create({
      postType,
      postId,
      sender: senderId,
      receiver: receiverId
    });

    // ✅ notify receiver
    await createNotification({
      user: receiverId,
      title: "New Request",
      message: "Someone sent request to your post",
      type: "request_received",
      request: newRequest._id
    });


    // ✅ notify sender
    await createNotification({
      user: senderId,
      title: "Request Sent",
      message: "Your request was sent",
      type: "request_sent",
      request: newRequest._id
    });


    res.status(201).json({
      message: "Request sent successfully",
      request: newRequest
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already sent a request for this post."
      });
    }

    res.status(500).json({ message: error.message });
  }
};


// GET ALL REQUESTS FOR A POST
export const getRequestsForPost = async (req, res) => {
  try {
    const { postId, postType } = req.params;
    const userId = req.user._id;

    let post;

    if (postType === "WorkerPost") {
      post = await WorkerPost.findById(postId);

      if (!post || post.worker.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    if (postType === "CustomerPost") {
      post = await CustomerPost.findById(postId);

      if (!post || post.customer.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const requests = await Request.find({
      postId,
      postType
    })
      .populate("sender", "username role")
      .lean();

    const enrichedRequests = await Promise.all(
      requests.map(async (reqItem) => {

        let profile;

        if (reqItem.sender.role === "worker") {
          profile = await WorkerProfile.findOne({ user: reqItem.sender._id });
        } else {
          profile = await CustomerProfile.findOne({ user: reqItem.sender._id });
        }

        return {
          ...reqItem,
          profileImage: profile?.profileImage || "",
          name: profile?.name || "",
          phone: profile?.phone || "",
          email: profile?.email || "",
          address: profile?.address || ""
        };
      })
    );

    res.status(200).json({ requests: enrichedRequests });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET A REQUEST
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      sender: req.user._id
    })
    .sort({ createdAt: -1 });

    res.status(200).json({ requests });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACCEPT REQUEST
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // ✅ ADD POST ACTIVE CHECK HERE
    let post;

    if (request.postType === "WorkerPost") {
      post = await WorkerPost.findById(request.postId);
    } else {
      post = await CustomerPost.findById(request.postId);
    }

    if (!post || !post.isActive) {
      return res.status(400).json({ message: "Post is no longer active" });
    }

    // Check if another request already selected
    const alreadySelected = await Request.findOne({
      postId: request.postId,
      postType: request.postType,
      status: "Selected"
    });

    if (alreadySelected) {
      return res.status(400).json({ message: "Another request already selected" });
    }

    // Mark this request as selected
    request.status = "Selected";
    await request.save();

    post.isActive = false;
    await post.save();

    // Reject all other pending requests
    await Request.updateMany(
    {
      postId: request.postId,
      postType: request.postType,
      _id: { $ne: request._id },
      status: "Pending"
    },
    { status: "Rejected" }
    );

    // Create booking
    let workerId, customerId;

    if (request.postType === "WorkerPost") {
      workerId = request.receiver;
      customerId = request.sender;
    } else {
      workerId = request.sender;
      customerId = request.receiver;
    }

    const booking = await Booking.create({
      request: request._id,
      worker: workerId,
      customer: customerId
    });

    //To send notifications
    await createNotification({
      user: request.sender,
      title: "Request Accepted",
      message: "Your request was accepted",
      type: "request_accepted",
      request: request._id
    });

    await createNotification({
      user: workerId,
      title: "Job Started",
      message: "Booking created",
      type: "booking_created",
      booking: booking._id
    });

    await createNotification({
      user: customerId,
      title: "Job Started",
      message: "Booking created",
      type: "booking_created",
      booking: booking._id
    });
    //up to here only
    
    res.status(200).json({
      message: "Request accepted and booking created",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// REJECT REQUEST
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    request.status = "Rejected";
    await request.save();

    res.status(200).json({ message: "Request rejected" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL REQUEST
export const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Cannot cancel processed request" });
    }

    request.status = "Cancelled";
    await request.deleteOne();

    res.status(200).json({message: "Request cancelled and removed"});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
