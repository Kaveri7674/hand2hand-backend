import Booking from "../../models/marketplace/BookingModel.js";
import Request from "../../models/marketplace/RequestModel.js";

import WorkerPost from "../../models/WorkerModels/WorkerPost.js";
import CustomerPost from "../../models/CustomerModels/CustomerPost.js";

import WorkerProfile from "../../models/WorkerModels/WorkerProfile.js";
import CustomerProfile from "../../models/CustomerModels/CustomerProfile.js";



// ✅ GET MY BOOKINGS 
export const getMyBookings = async (req, res) => {
  try {

    const userId = req.user._id;

    const bookings = await Booking.find({
      $or: [
        { worker: userId },
        { customer: userId }
      ]
    })
      .populate("worker", "username")
      .populate("customer", "username")
      .populate({
        path: "request",
        populate: {
          path: "postId"
        }
      })
      .sort({ createdAt: -1 });


    const result = [];

    for (let booking of bookings) {

      const request = booking.request;
      const post = request?.postId;

      let service = "";
      let salary = "";
      let address = "";
      let phone = "";
      let date = booking.createdAt;

      // ======================
      // POST DATA
      // ======================

      if (request.postType === "WorkerPost") {

        service = post?.service || "";
        salary = post?.expectedSalaryPerDay || "";
        address = post?.address || "";
        phone = post?.phone || "";

      }

      if (request.postType === "CustomerPost") {

        service = post?.serviceNeeded || "";
        salary = post?.budgetPerDay || "";
        address = post?.address || "";
        phone = post?.phone || "";

      }


      // ======================
      // WORKER PROFILE
      // ======================

      let workerProfile =
        await WorkerProfile.findOne({
          user: booking.worker._id
        });

      // ======================
      // CUSTOMER PROFILE
      // ======================

      let customerProfile =
        await CustomerProfile.findOne({
          user: booking.customer._id
        });


      result.push({

        _id: booking._id,
        status: booking.status,
        rebooked: booking.rebooked,
        completedAt: booking.completedAt,

        rating: booking.rating,
        review: booking.review,
        reviewed: booking.reviewed,

        worker: {
          _id: booking.worker._id,
          username: booking.worker.username,
          name: workerProfile?.name || "",
          profileImage:workerProfile?.profileImage || "",
          phone: workerProfile?.phone || "",
          address: workerProfile?.address || "",
          rating:workerProfile?.stats?.rating || 0
        },

        customer: {
          _id: booking.customer._id,
          username: booking.customer.username,
          name: customerProfile?.name || "",
          profileImage:customerProfile?.profileImage || "",
          phone: customerProfile?.phone || "",
          address: customerProfile?.address || ""
          // address:booking.customer.address
        },

        service,
        salary,
        address,
        phone,
        date

      });

    }

    res.json(result);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error fetching bookings"
    });

  }
};


// ✅ COMPLETE BOOKING
// export const completeBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const userId = req.user._id;

//     const booking = await Booking.findById(bookingId);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     // Only worker or customer can complete
//     if (
//       booking.worker.toString() !== userId.toString() &&
//       booking.customer.toString() !== userId.toString()
//     ) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     if (booking.status !== "Active") {
//       return res.status(400).json({ message: "Booking already processed" });
//     }

//     booking.status = "Completed";
//     booking.completedAt = new Date();
//     await booking.save();

//     // 🔥 DELETE THE POST AFTER COMPLETION
//     // const request = await Request.findById(booking.request);

//     // if (request.postType === "WorkerPost") {
//     //   await WorkerPost.findByIdAndDelete(request.postId);
//     // } else {
//     //   await CustomerPost.findByIdAndDelete(request.postId);
//     // }

//     res.status(200).json({
//       message: "Booking completed and post deleted"
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const completeBooking = async (req, res) => {
  try {

    const userId = req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // only customer can complete

    if (
      booking.customer.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        message:
          "Only customer can complete booking"
      });
    }

    if (booking.status === "Completed") {
      return res.json({
        message: "Already completed"
      });
    }

    if (booking.status === "Cancelled") {
      return res.json({
        message: "Cancelled booking"
      });
    }

    booking.status = "Completed";
    booking.completedAt = new Date();

    await booking.save();

    res.json({
      message: "Booking completed"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error completing booking"
    });

  }
};


// ✅ CANCEL BOOKING
export const cancelBooking = async (req, res) => {
  try {

    const userId = req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(
      bookingId
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // must be worker or customer

    const isWorker =
      booking.worker.toString() ===
      userId.toString();

    const isCustomer =
      booking.customer.toString() ===
      userId.toString();

    if (!isWorker && !isCustomer) {
      return res.status(403).json({
        message: "Not allowed"
      });
    }

    if (booking.status === "Completed") {
      return res.json({
        message:
          "Completed cannot be cancelled"
      });
    }

    booking.status = "Cancelled";

    await booking.save();

    res.json({
      message: "Booking cancelled"
    });

  } catch (err) {

    res.status(500).json({
      message: "Error cancelling"
    });

  }
};

// ✅ REBOOK BOOKING
export const rebookBooking = async (
  req,
  res
) => {
  try {

    const userId = req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(
      bookingId
    );

    if (!booking) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    const isWorker =
      booking.worker.toString() ===
      userId.toString();

    const isCustomer =
      booking.customer.toString() ===
      userId.toString();

    if (!isWorker && !isCustomer) {
      return res.status(403).json({
        message: "Not allowed"
      });
    }

    if (booking.rebooked) {
      return res.json({
        message:
          "Already rebooked once"
      });
    }

    if (booking.status !== "Cancelled") {
      return res.json({
        message:
          "Only cancelled can rebook"
      });
    }

    booking.status = "Active";
    booking.rebooked = true;

    await booking.save();

    res.json({
      message: "Rebooked"
    });

  } catch (err) {

    res.status(500).json({
      message: "Error rebook"
    });

  }
};

// ✅ Add Review And Rating
export const addReviewAndRating =
  async (req, res) => {
    try {

      const userId = req.user._id;

      const { bookingId } = req.params;

      const { rating, review } = req.body;

      const booking =
        await Booking.findById(
          bookingId
        );

      if (!booking) {
        return res.status(404).json({
          message: "Not found"
        });
      }

      if (
        booking.customer.toString() !==
        userId.toString()
      ) {
        return res.status(403).json({
          message:
            "Only customer can review"
        });
      }

      if (
        booking.status !== "Completed"
      ) {
        return res.json({
          message:
            "Complete first"
        });
      }

      if (booking.reviewed) {
        return res.json({
          message:
            "Already reviewed"
        });
      }

      // save in booking

      booking.rating = rating;
      booking.review = review;
      booking.reviewed = true;

      await booking.save();

      // update worker profile

      const workerProfile =
        await WorkerProfile.findOne({
          user: booking.worker
        });

      if (workerProfile) {

        workerProfile.reviews.push({
          customer: booking.customer,
          rating,
          review
        });

        // const total = workerProfile.stats.totalReviews;
        // const avg = workerProfile.stats.rating;

        // const newAvg = (avg * total + rating) / (total + 1);

        // workerProfile.stats.rating = newAvg;
        // workerProfile.stats.totalReviews = total + 1;

        await workerProfile.save();
      }

      res.json({
        message: "Review added"
      });

    } catch (err) {

      res.status(500).json({
        message:
          "Error adding review"
      });

    }
  };