import express from "express";
import fetch from "node-fetch"; // if using Node.js <18, install node-fetch

const router = express.Router();

/**
 * GET /api/pincode/:pincode
 * Returns state and district for a given Indian pincode
 */
router.get("/:pincode", async (req, res) => {
  const { pincode } = req.params;

  try {
    // Example using an open pincode API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data[0].Status === "Success") {
      const postOffice = data[0].PostOffice[0]; // take first entry
      return res.json({
        state: postOffice.State,
        district: postOffice.District,
        country: postOffice.Country
      });
    } else {
      return res.status(404).json({ message: "Pincode not found" });
    }
  } catch (err) {
    console.error("❌ Error fetching pincode data:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
