const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json()); // ✅ This is enough — no need for bodyParser

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/complaint";
mongoose
  .connect(MONGODB_URI, {})
  .then(() => console.log(`MongoDB Connected to ${MONGODB_URI}`))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// user Models
// const User = mongoose.model("User", new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// }));
const User = mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },        // full name
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },      // mobile number
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: null }, // base64 encoded image
}));
// Admin Model

const Admin = mongoose.model("Admin", new mongoose.Schema({
  adminName: { type: String, required: true }, // full name
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },      // mobile number
  password: { type: String, required: true },
}));
// Complaint Model
const Complaint = mongoose.model("Complaint", new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  complaintText: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  subLocation: { type: String },
  roomNo: { type: String },
  image: { 
    data: Buffer,
    contentType: String,
  },
  status: { type: String, default: 'Yet to Begin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true }));

const Status = mongoose.model('Status', new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  complaintText: { type: String, required: true },
  location: { type: String, required: true },
  subLocation: { type: String },
  status: {
    type: String,
    enum: ['Yet to Begin', 'In Progress', 'Resolved', 'Rejected', 'Pending'],
    required: true
  },
  updatedAt: { type: Date, default: Date.now },
}));

const Event = mongoose.model("Event", new mongoose.Schema({
  date: { type: String, required: true },
  department: { type: String, required: true },
  title: { type: String, required: true },
  venue: { type: String, required: true },
  time: { type: String, required: true },
  timePeriod: { type: String, enum: ["AM", "PM"], required: true },
  description: { type: String },
}, { timestamps: true }));

const Feedback = mongoose.model("Feedback", new mongoose.Schema({
  date: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: Number, required: true },
}, { timestamps: true }));

// User Routes
app.post("/user/signup", async (req, res) => {
  const {fullName, username, email, mobile, gender, password } = req.body;
  try {
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ error: "Mobile number must be 10 digits" });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? "Email already registered" : "Username already taken" 
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name: fullName, username, email, mobile, gender, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User signup successful!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
});
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};
// User Login
app.post("/user/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid username" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ 
      message: "Login successful!",
      token,
      user: { username: user.username, email: user.email }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});
// Admin Routes
app.post('/admin/signup', async (req, res) => {
  try {
    const { adminName, username, email, mobile, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ error: "Mobile number must be 10 digits" });
    }
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      if (existingAdmin.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(400).json({ error: 'Username already taken' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ adminName, username, email, mobile, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin signup successful!' });
  } catch (error) {
    console.error('Admin Signup Error:', error);
    res.status(500).json({ error: 'Admin signup failed. Please try again.' });
  }
});
// Admin Login
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid username' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ 
      message: 'Admin login successful!',
      token,
      admin: { username: admin.username, email: admin.email }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});
// User Profile
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("User Profile Error:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// Update User Profile
app.put("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const { fullName, username, email, mobile, profilePicture } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Optional: Add check for existing username/email if changed
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: "Username already taken" });
      user.username = username;
    }
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: "Email already taken" });
      user.email = email;
    }

    if (fullName) user.name = fullName;
    if (mobile) user.mobile = mobile;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json({ message: "Profile updated successfully!", user });
  } catch (error) {
    console.error("Update User Profile Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Admin Profile
app.get("/api/admin/profile", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching admin profile for ID:", req.user.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      console.log("Invalid Admin ID format:", req.user.id);
      return res.status(400).json({ error: "Invalid admin ID format" });
    }

    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      console.log("Admin not found for ID:", req.user.id);
      return res.status(404).json({ error: "Admin not found" });
    }
    
    console.log("Admin found:", admin.username);
    res.json({ admin });
  } catch (error) {
    console.error("Admin Profile Error:", error);
    res.status(500).json({ error: "Failed to load admin profile", details: error.message });
  }
});

// Complaint Routes
app.post("/submit-complaint", upload.single("image"), async (req, res) => {
  try {
    const { username, email, complaintText, date, location, subLocation, roomNo } = req.body;
    const complaint = new Complaint({
      username,
      email,
      complaintText,
      date,
      location,
      subLocation,
      roomNo: ["mess", "garden"].includes(location) ? undefined : roomNo,
    });
    if (req.file) {
      complaint.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }
    await complaint.save();

    const initialStatus = new Status({
      complaintId: complaint._id,
      complaintText: complaint.complaintText,
      location: complaint.location,
      subLocation: complaint.subLocation,
      status: 'Yet to Begin',
    });
    await initialStatus.save();

    res.status(201).json({ message: "Complaint submitted successfully!" });
  } catch (error) {
    console.error("Complaint Submission Error:", error);
    res.status(500).json({ error: "Failed to submit complaint" });
  }
});

app.get("/get-complaints", async (req, res) => {
  try {
    const { username } = req.query;
    const filter = username ? { username } : {};
    const complaints = await Complaint.find(filter);
    const complaintsWithImages = complaints.map(complaint => {
      if (complaint.image?.data) {
        const base64Image = complaint.image.data.toString("base64");
        return {
          ...complaint._doc,
          image: `data:${complaint.image.contentType};base64,${base64Image}`,
        };
      }
      return { ...complaint._doc, image: null };
    });
    res.status(200).json(complaintsWithImages);
  } catch (error) {
    console.error("Fetch Complaints Error:", error);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// ✅ ✅ ✅ CORRECTED STATUS UPDATE ROUTE ✅ ✅ ✅
app.post("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Update status request:", { id, status });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId:", id);
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    // Validate status value
    const validStatuses = ["Yet to Begin", "In Progress", "Resolved", "Rejected", "Pending"];
    if (!status || !validStatuses.includes(status)) {
      console.log("Invalid status:", status);
      return res.status(400).json({
        message: "Status is required and must be: " + validStatuses.join(", ")
      });
    }

    // Find and update Complaint by _id
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log("Complaint not found:", id);
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    complaint.updatedAt = new Date();
    await complaint.save();

    // Create new Status entry
    const newStatusEntry = new Status({
      complaintId: complaint._id,
      complaintText: complaint.complaintText,
      location: complaint.location,
      subLocation: complaint.subLocation,
      status,
      updatedAt: new Date(),
    });
    await newStatusEntry.save();

    console.log("Status updated successfully:", { id, status });
    // ✅ Success response
    res.status(200).json({ message: "Status updated successfully!" });

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
});

// Get status records (latest status for each complaint)
app.get('/get-status', async (req, res) => {
  try {
    const { email, username } = req.query;

    const pipeline = [
      {
        $sort: { updatedAt: -1 }
      },
      {
        $group: {
          _id: '$complaintId',
          latestStatus: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestStatus' }
      },
      {
        $lookup: {
          from: 'complaints',
          localField: 'complaintId',
          foreignField: '_id',
          as: 'complaintId'
        }
      },
      {
        $unwind: '$complaintId'
      }
    ];

    if (email || username) {
      const orConditions = [];
      if (email) orConditions.push({ 'complaintId.email': email });
      if (username) orConditions.push({ 'complaintId.username': username });
      
      pipeline.push({
        $match: {
          $or: orConditions
        }
      });
    }

    const statuses = await Status.aggregate(pipeline);
    res.json(statuses);
  } catch (error) {
    console.error("Fetch Status Error:", error);
    res.status(500).json({ message: 'Error fetching status data' });
  }
});

// Get recent status history (all updates, sorted by date, limited)
app.get('/api/recent-history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    console.log(`Fetching recent history (limit: ${limit})...`);
    
    // Check if Status collection exists/has data
    const statusCount = await Status.countDocuments();
    console.log(`Total status records: ${statusCount}`);

    const recentHistory = await Status.aggregate([
      {
        $sort: { updatedAt: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'complaints',
          localField: 'complaintId',
          foreignField: '_id',
          as: 'complaintId'
        }
      },
      {
        $unwind: {
          path: '$complaintId',
          preserveNullAndEmptyArrays: true // Change to true to see status updates even if complaint was deleted
        }
      }
    ]);

    console.log(`Found ${recentHistory.length} recent history records`);
    res.json(recentHistory);
  } catch (error) {
    console.error("Fetch Recent History Error:", error);
    res.status(500).json({ message: 'Error fetching recent history', error: error.message });
  }
});

// Event Routes
app.post("/admin/post-event", async (req, res) => {
  try {
    const { date, department, title, venue, time, timePeriod, description } = req.body;
    const event = new Event({ date, department, title, venue, time, timePeriod, description });
    await event.save();
    res.status(201).json({ success: true, message: "Event posted successfully!" });
  } catch (error) {
    console.error("Event Posting Error:", error);
    res.status(500).json({ success: false, error: "Failed to post event" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Fetch Events Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
});

// ✅ DELETE single event
app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// ✅ UPDATE single event
app.put("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// Feedback Routes
// =====================
// Feedback Routes
// =====================

// Add feedback
app.post("/api/feedback", async (req, res) => {
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
      rating: Number(rating),
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully!",
    });
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
});

// Get all feedbacks
app.get("/api/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Fetch Feedback Error:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// ✅ DELETE single feedback (THIS FIXES YOUR ERROR)
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid feedback ID" });
    }

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Delete Feedback Error:", error);
    res.status(500).json({ message: "Failed to delete feedback" });
  }
});

// ✅ DELETE all feedbacks
app.delete("/api/feedback", async (req, res) => {
  try {
    await Feedback.deleteMany({});
    res.status(200).json({ message: "All feedbacks deleted successfully" });
  } catch (error) {
    console.error("Delete All Feedback Error:", error);
    res.status(500).json({ message: "Failed to delete all feedbacks" });
  }
});

app.delete("/delete-complaint/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const deletedComplaint = await Complaint.findByIdAndDelete(id);

    if (!deletedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Also delete related status records
    await Status.deleteMany({ complaintId: id });

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Delete Complaint Error:", error);
    res.status(500).json({ message: "Server error while deleting complaint" });
  }
});

app.delete("/delete-all-complaints", async (req, res) => {
  try {
    await Complaint.deleteMany({});
    await Status.deleteMany({});

    res.status(200).json({ message: "All complaints deleted successfully" });
  } catch (error) {
    console.error("Delete All Complaints Error:", error);
    res.status(500).json({ message: "Server error while deleting all complaints" });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));