const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin'); 

// router.get('/profile', async (req, res) => {
//   try {
//     const admin = await Admin.findOne();
//     if (!admin) {
//       return res.status(404).json({ error: 'Admin profile not found' });
//     }

//     res.status(200).json({
//       adminName: admin.adminName || admin.username,
//       username: admin.username,
//       email: admin.email,
//       mobile: admin.mobile || '',
//     });
//   } catch (error) {
//     console.error('Fetch profile error:', error);
//     res.status(500).json({ error: 'Failed to fetch profile' });
//   }
// });

// // PUT /admin/profile
// router.put('/profile', async (req, res) => {
//   try {
//     const { adminName, username, email, mobile, password } = req.body;

//     const admin = await Admin.findOne();
//     if (!admin) {
//       return res.status(404).json({ error: 'Admin not found' });
//     }

//     const updateFields = {};
//     if (adminName !== undefined) updateFields.adminName = adminName;
//     if (username !== undefined) updateFields.username = username;
//     if (email !== undefined) updateFields.email = email;
//     if (mobile !== undefined) updateFields.mobile = mobile;

//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       updateFields.password = hashedPassword;
//     }
//    Object.assign(admin, updateFields);
//     await admin.save();

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       adminName: admin.adminName || admin.username,
//       username: admin.username,
//       email: admin.email,
//       mobile: admin.mobile || '',
//     });
//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({ error: 'Failed to update profile' });
//   }
// });
// GET /user/profile — Protected route
app.get("/user/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Map to expected fields (match your frontend)
    res.json({
      fullName: user.username, // or add a real fullName field later
      username: user.username,
      email: user.email,
      mobile: "", // ⚠️ Your User model doesn't have 'mobile'!
      gender: "", // ⚠️ Missing in model!
      role: "student", // since it's /user/, assume student
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});
module.exports = router;