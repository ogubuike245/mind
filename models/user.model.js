const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  selectedCourses: [
    {
      type: [mongoose.Schema.Types.ObjectId],
      unique: true,
      ref: "Course",
    },
  ],
  downloads: [
    {
      type: [mongoose.Schema.Types.ObjectId],
      unique: true,
      ref: "Document",
    },
  ],
  submissions: [
    {
      type: [mongoose.Schema.Types.ObjectId],
      unique: true,
      ref: "Submission",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
