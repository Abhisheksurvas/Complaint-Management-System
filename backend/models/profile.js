
app.get("/admin/profile", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE ADMIN PROFILE
app.put("/admin/profile", adminAuth, async (req, res) => {
  try {
    const { adminName, username, email, mobile, password } = req.body;

    const updateData = {
      adminName,
      username,
      email,
      mobile,
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await Admin.findByIdAndUpdate(req.adminId, updateData);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});
