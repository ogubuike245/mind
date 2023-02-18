const Document = require("../model/document.model");
const Submission = require("../model/submissions.model");
const User = require("../model/user.model");
const { handleErrors } = require("../utils/errorHandling.utils");

exports.submitDocumentPage = async (req, res) => {
  const {id } = req.params;
  const document = await Document.findOne({_id : id});
  console.log(document)
  res.render("submissions", { title: "SUBMIT DOCUMENT", document });
};

exports.submitDocument = async (req, res) => {
  try {
    // Get the file details
    const path = req.file.path;
    const originalName = req.file.originalname;

    // Get the document ID from the request body
    const { id } = req.body;

    // Get the logged-in user
    const { _id, email } = req.user;

    // Check if the user exists
    const user = await User.findOne({ _id }).lean();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the document exists
    const document = await Document.findOne({ _id: id, type: "assignment" }).select("_id type").lean();

    if (!document) {
      throw new Error("Document not found or not an assignment");
    }

  

    // Save the submission object to the database
    const submission = await Submission.create({
      path: path,
      originalName: originalName,
      submittedBy: user._id,
      documentSubmittedTo: document._id,
    });
    

    // Render a success page
    res.render("success", { title: "SUCCESS", success: "Submission done successfully.", });
  } catch (err) {
    // Log the error to the console
    console.log(err);

    handleErrors(err, res);
  }
};

