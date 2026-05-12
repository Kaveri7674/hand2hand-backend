import Booking from "../../models/marketplace/BookingModel.js";
import CustomerProfile from "../../models/CustomerModels/CustomerProfile.js";

/* ================= CUSTOMER STATS ================= */

export const getCustomerStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ customer: userId })
      .populate({
        path: "request",
        populate: { path: "postId" }
      });

    let jobsBooked = 0;
    let activeJobs = 0;
    let totalSpent = 0;

    let uniqueWorkers = new Set();

    for (let booking of bookings) {

      const request = booking.request;
      const post = request?.postId;

      let salary = 0;

      if (request?.postType === "WorkerPost") {
        salary = post?.expectedSalaryPerDay || 0;
      }

      if (request?.postType === "CustomerPost") {
        salary = post?.budgetPerDay || 0;
      }

      // ✅ Track unique workers
      if (booking.worker && booking.status === "Completed"){
        uniqueWorkers.add(booking.worker.toString());
      }

      if (booking.status === "Completed") {
        jobsBooked++;
        totalSpent += salary;
      }

      if (booking.status === "Active") {
        activeJobs++;
      }
    }

    res.json({
      jobsBooked,
      activeJobs,
      totalSpent,
      savedWorkers: uniqueWorkers.size
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Customer stats error" });
  }
};


/* ================= WORKER STATS ================= */

export const getWorkerStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ FIRST: Fetch bookings WITH populate
    const bookings = await Booking.find({ worker: userId })
      .populate({
        path: "request",
        populate: { path: "postId" }
      })
      .populate("customer", "username");

    // ✅ SECOND: Extract customer IDs
    const customerIds = bookings.map(b => b.customer._id);

    // ✅ THIRD: Fetch all customer profiles
    const customerProfiles = await CustomerProfile.find({
      user: { $in: customerIds }
    });

    // ✅ FOURTH: Create map
    const customerMap = {};

    customerProfiles.forEach(profile => {
      customerMap[profile.user.toString()] = profile.name;
    });

    // =========================

    let jobsDone = 0;
    let totalBookings = bookings.length;
    let moneyEarnedThisMonth = 0;

    let totalRating = 0;
    let totalReviews = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const reviews = [];

    for (let booking of bookings) {

      const request = booking.request;
      const post = request?.postId;

      let salary = 0;

      if (request?.postType === "WorkerPost") {
        salary = post?.expectedSalaryPerDay || 0;
      }

      if (request?.postType === "CustomerPost") {
        salary = post?.budgetPerDay || 0;
      }

      // ✅ COMPLETED
      if (booking.status === "Completed") {
        jobsDone++;

        if (booking.completedAt) {
          const completedDate = new Date(booking.completedAt);

          if (
            completedDate.getMonth() === currentMonth &&
            completedDate.getFullYear() === currentYear
          ) {
            moneyEarnedThisMonth += salary;
          }
        }
      }

      // ✅ REVIEWS
      if (booking.reviewed) {
        totalReviews++;
        totalRating += booking.rating;

        reviews.push({
          customerName:
            customerMap[booking.customer._id.toString()] ||
            booking.customer.username ||
            "User",

          // ✅ THIS IS CUSTOMER USER ID (IMPORTANT)
          customerId: booking.customer._id,

          // ✅ THIS IS USERNAME (if you need it)
          customerUsername: booking.customer.username,

          rating: booking.rating,
          review: booking.review,
          date: booking.completedAt
        });
      }
    }

    const rating =
      totalReviews === 0 ? 0 : totalRating / totalReviews;

    const successRate =
      totalBookings === 0
        ? 0
        : (jobsDone / totalBookings) * 100;

    res.json({
      jobsDone,
      moneyEarnedThisMonth,
      rating: Number(rating.toFixed(1)),
      totalReviews,
      successRate: Number(successRate.toFixed(1)),
      reviews
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Worker stats error" });
  }
};