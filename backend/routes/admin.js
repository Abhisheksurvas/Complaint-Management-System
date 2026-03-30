const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin'); // path to your Admin model
const { sendWelcomeEmail } = require('../services/emailService');

router.post('/signup', async (req, res) => {
  const { adminName, email, username, password, mobile } = req.body;

  try {
    
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    // Create new admin
    const newAdmin = new Admin({ adminName, email, username, password, mobile });
    await newAdmin.save();

    // Send Welcome Email
    await sendWelcomeEmail(email, username);

    res.status(201).json({ message: 'Admin signed up successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

module.exports = router;
