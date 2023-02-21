const Document = require("../models/document.model");
const Submission = require("../models/submissions.model");
const User = require("../models/user.model");
// const { handleErrors } = require("../utils/errorHandling.utils");

exports.submitDocumentPage = async (req, res) => {
  // Get the document ID from the request parameters
  const { id } = req.params;
  // Find the document with the given ID
  const document = await Document.findOne({ _id: id });
  // Get the logged-in user
  const user = req.user;
  // Find a previous submission by the user for this document
  const submission = await Submission.findOne({
    documentSubmittedTo: document._id,
    submittedBy: user._id,
  });
  // Check if the user has already submitted a document for this assignment
  const isSubmitted = !!submission;
  // Render the submission page with the document and submission status
  res.render("course/submissions", {
    title: "SUBMIT DOCUMENT",
    document,
    isSubmitted,
  });
};

exports.submitDocument = async (req, response) => {
  try {
    // Get the file details
    const path = req.file.path;
    const originalName = req.file.originalname;

    // Get the document ID from the request body
    const { id } = req.body;

    // Get the logged-in user
    const { _id } = req.user;

    // Check if the user exists
    const user = await User.findOne({ _id });

    if (!user) {
      // If user not found, return an error response
      return response.status(400).json({ error: "User not found" });
    }

    // Check if the document exists and is an assignment
    const document = await Document.findOne({ _id: id, type: "assignment" })
      .select("_id type submissions")
      .populate("submissions");

    if (!document) {
      // If document not found or not an assignment, return an error response
      return response
        .status(400)
        .json({ error: "Document not found or not an assignment" });
    }

    // Check if the user has already submitted a document for this assignment
    const previousSubmission = await Submission.findOne({
      submittedBy: user._id,
      documentSubmittedTo: document._id,
    }).lean();

    if (previousSubmission) {
      // If user has already submitted a document, return an error response
      return response.status(400).json({
        error: "You have already submitted a document for this assignment.",
      });
    }

    // Save the submission object to the database
    const submission = await Submission({
      path: path,
      originalName: originalName,
      submittedBy: user._id,
      documentSubmittedTo: document._id,
    });
    await submission.save();

    // Add the submission to the document and save the document
    document.submissions.push(submission._id);
    await document.save();

    // Add the submission to the user and save the user
    user.submissions.push(submission._id);
    await user.save();

    // Return a success response with redirect URL
    response.status(200).json({
      success: "Submission done successfully.",
      redirect: `/api/v1/course/document/${document._id}`,
    });
  } catch (err) {
    // Log the error to the console
    console.log(err);
    // handleErrors(err, response);
  }
};
