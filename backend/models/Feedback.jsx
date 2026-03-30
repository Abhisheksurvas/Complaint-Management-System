const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;