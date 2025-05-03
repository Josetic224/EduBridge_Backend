const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const faqSchema = new Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
    trim: true,
    minlength: [5, "Question must be at least 5 characters long"],
    maxlength: [300, "Question cannot exceed 300 characters"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"]
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("FAQ", faqSchema);
