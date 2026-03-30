const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

router.post("/", async (req, res) => {
  try {
    const { date, description, rating } = req.body;

    if (!date || !description || !rating) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const feedback = new Feedback({
      date,
      description,
      rating,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
