const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },

  originalName: {
    type: String,
    required: true,
  },
  submittedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique:true
    },
  ],

  documentSubmittedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
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

module.exports = mongoose.model("Submission", SubmissionSchema);
