const Document = require("../models/document.model");
const Submission = require("../models/submissions.model");
const User = require("../models/user.model");
const { handleErrors } = require("../utils/errorHandling.utils");

exports.submitDocumentPage = async (req, res) => {
  const { id } = req.params;
  const document = await Document.findOne({ _id: id });
  const user = req.user;

  const submission = await Submission.findOne({
    documentSubmittedTo: document._id,
    submittedBy: user._id,
  });

  const isSubmitted = !!submission;

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
    const user = await User.findOne({ _id }).lean();

    if (!user) {
      return response.status(400).json({ error: "User not found" });
    }

    // Check if the document exists
    const document = await Document.findOne({ _id: id, type: "assignment" })
      .select("_id type")
      .lean();

    if (!document) {
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
      return response.status(400).json({
        error: "You have already submitted a document for this assignment.",
      });
    }

    // Save the submission object to the database
    await Submission.create({
      path: path,
      originalName: originalName,
      submittedBy: user._id,
      documentSubmittedTo: document._id,
    });

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
