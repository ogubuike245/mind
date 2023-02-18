const bcrypt = require("bcrypt");
const Document = require("../model/document.model");
const Course = require("../model/course.model");
const User = require("../model/user.model");
const Submission = require('../model/submissions.model');


exports.uploadDocumentPage = async (request, response) => {
  const course = await Course.find();
  response.render("upload", { title: "UPLOAD DOCUMENT", course });
};

exports.uploadDocument = async (request, response) => {
  try {
    const { title, description, originalName, heading, type } = request.body;
    const course = await Course.findOne({ title: title });

    // If the course is not found, return a 404 error message
    if (!course) {
      return response.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    // Create a new document object
    const newDoc = new Document({
      path: request.file.path,
      originalName: request.file.originalname,
      heading,
      type,
      description,
      title,
      password: hashedPassword,
    });

    // Generate a download link for the document
    newDoc.downloadLink = `http://localhost:5000/api/v1/course/download/${newDoc.id}`;

    // Save the document to the database
    const savedDocument = await newDoc.save();
    // Add the saved document to the course
    course.documents.push(savedDocument._id);
    await course.save();

    // Redirect the user to the course details page
    response.redirect(`/api/v1/course/details/${newDoc.title}`);
  } catch (err) {
    // Log the error to the console
    console.log(err);
    // Render an error page
    response.render("error", { title: "ERROR", error: err });
  }
};

exports.downloadDocumentPage = async (req, res) => {
  const document = await Document.findById(req.params.id);
  res.render("download", { title: "DOWNLOAD DOCUMENT", file: document });
};

// This function downloads a document from the database.
exports.downloadDocument = async (request, response) => {
  try {
    // Find the document by its ID
    const file = await Document.findById(request.params.id);

    // Find the user who requested the download
    const user = await User.findById(request.user);

    // If the file doesn't exist, return a bad request error
    if (!file) return response.status(400).send("File not found");

    // If the file has a password, check if it matches the one provided by the user
    if (file.password) {
      if (!request.body.password)
        // If the password was not provided, render the download page with the file information
        return response.render("download", { title: "DOWNLOAD", file });

      const passwordMatch = await bcrypt.compare(
        request.body.password,
        file.password
      );
      if (!passwordMatch)
        // If the password doesn't match, render the download page with an error message
        return response.render("download", {
          error: "incorrect password",
          title: "DOWNLOAD",
          file,
        });
    }

    // Update the download information for the file
    file.downloadedBy.push(user._id);
    file.downloadCount++;
    await file.save();

    // Update the download information for the user
    user.downloads.push(file._id);
    await user.save();

    // Download the file
    response.download(file.path, file.originalName);

    // Redirect to the course details page
    response.redirect(`/api/v1/course/details/${file.title}`);
  } catch (err) {
    // Log the error
    console.log(err);

    // Render an error page
    response.render("error", { title: "ERROR", error: err });
  }
};

// VIEW DOCUMENT DETAILS


exports.documentDetailsPage = async (request, response) => {
  // Extract the document ID from the URL parameters
  const { id } = request.params;
  try {
    // Find the document by its ID
    const content = await Document.findById(id);
    let submission = null;

    // Check if the current user is an admin
    if (request.user.role === "admin") {
      // Find all submissions for the current document
      const submissions = await Submission.find({
        documentSubmittedTo: content._id,
      }).populate("submittedBy").populate("documentSubmittedTo")
      .exec();

      // Render the document details page, passing the document and all submissions to the template
      response.render("document", {
        document: content,
        submissions: submissions,
        title: "DOCUMENT DETAIL",
      });
    } else {
      // Find the submission for the current document and user
      submission = await Submission.findOne({
        documentSubmittedTo: content._id,
        submittedBy: request.user._id,
      }).populate("submittedBy").populate("documentSubmittedTo")
      .exec();

      // Render the document details page, passing the document and the submission (if any) to the template
      response.render("document", {
        document: content,
        submission: submission,
        title: "DOCUMENT DETAIL",
      });
    }
  } catch (error) {
    // Log any errors that occur
    console.log(error);
  }
};



exports.editDocumentPage = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id);
    res.render("editDocument", { title: "Edit Document", document });
  } catch (error) {
    console.log(error);
    res.render("error", { title: "Error", error });
  }
};

exports.editDocument = async (req, res) => {
  try {
    const { id } = req.body;

    const document = await Document.findByIdAndUpdate(
      { _id: id },
      { ...req.body, updated_at: Date.now() }
    );
    res.redirect(`/api/v1/course/document/${document._id}`);

    res.render("success", {
      title: "Success",
      success: "Course updated successfully.",
    });
  } catch (error) {
    console.log(error);
    res.render("error", { title: "Error", error });
  }
};
