const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  status: String
});

module.exports = mongoose.model('Complaint', complaintSchema);
