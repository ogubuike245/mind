const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "default",
  },
  path: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  originalName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    minlength: [3, "MINIMUM LENGTH OF PASSWORD IS 3 NUMBERS"],
  },
  downloadCount: {
    type: Number,
    required: true,
    default: 0,
  },

  downloadedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
  ],

  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
    },
  ],

  downloadLink: String,

  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Document", DocumentSchema);
