const bcrypt = require("bcrypt");
const moment = require("moment");
const Document = require("../models/document.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Submission = require("../models/submissions.model");
const { handleErrors } = require("../utils/errorHandling.utils");

// const { Document, Submission, User, Course } = require("../models");

exports.uploadDocumentPage = async (request, response) => {
  const course = await Course.find().sort({ title: 1 });
  response.render("course/upload", { title: "UPLOAD DOCUMENT", course });
};

exports.uploadDocument = async (request, response) => {
  try {
    const { title, code, description, heading, type } = request.body;
    const course = await Course.findOne({ code: code });
    // console.log(request.file);

    // If the course is not found, return a 404 error message
    if (!course) {
      return response.status(400).json({ error: "Course not found." });
    }

    if (!request.file) {
      return response.status(400).json({ error: "Select File to Upload" });
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
      course: course._id,
      password: hashedPassword,
      downloadedBy: [],
    });

    // Generate a download link for the document
    newDoc.downloadLink = `http://localhost:5000/api/v1/course/download/${newDoc.id}`;

    // Save the document to the database
    const savedDocument = await newDoc.save();
    // Add the saved document to the course

    course.documents.push(savedDocument._id);
    // course.updated_at = Date.now();

    await course.save();

    // Redirect the user to the course details page
    response.status(200).json({
      success: true,
      redirect: `/api/v1/course/details/${code}`,
    });
  } catch (err) {
    // Log the error to the console
    console.log(err);
    // Render an error page
    // response.status(400).json({ error: err });
    handleErrors(err, response);
  }
};

exports.downloadDocumentPage = async (req, res) => {
  const document = await Document.findById(req.params.id);
  res.render("course/download", { title: "DOWNLOAD DOCUMENT", file: document });
};

// This function downloads a document from the database.
exports.downloadDocument = async (request, response) => {
  try {
    // Find the document by its ID
    const file = await Document.findById(request.params.id).populate("course");

    // Find the user who requested the download
    const user = await User.findById(request.user);

    // If the file doesn't exist, return a bad request error
    if (!file) return response.status(400).send("File not found");

    // If the file has a password, check if it matches the one provided by the user
    if (file.password) {
      if (!request.body.password)
        // If the password was not provided, render the download page with the file information
        return response.render("course/download", { title: "DOWNLOAD", file });

      const passwordMatch = await bcrypt.compare(
        request.body.password,
        file.password
      );
      if (!passwordMatch)
        // If the password doesn't match, render the download page with an error message
        return response.render("course/download", {
          error: "incorrect password",
          title: "DOWNLOAD",
          file,
        });
    }

    // Update the download information for the file
    const hasUserDownloadedFile = file.downloadedBy.includes(user._id);
    if (!hasUserDownloadedFile) {
      file.downloadedBy.push(user._id);
      file.downloadCount++;
    }
    await file.save();

    // Update the download information for the user
    const hasFileBeenDownloadedByUser = user.downloads.includes(file._id);
    if (!hasFileBeenDownloadedByUser) {
      user.downloads.push(file._id);
      await user.save();
    }

    // Download the file
    await response.download(file.path, file.originalName);

    // Redirect to the course details page
    response.redirect(`/api/v1/course/details/${file.course.code}`);
  } catch (err) {
    // Log the error
    console.log(err);

    // Render an error page
    response.render("error", { title: "ERROR", error: err });
  }
};

// VIEW DOCUMENT DETAILS

exports.documentDetailsPage = async (req, res) => {
  const { id } = req.params;

  try {
    // If the user is an admin, find all submissions for the current document
    if (req.user.role === "admin") {
      const document = await Document.findById(id)
        .populate("downloadedBy")
        .populate("submissions");

      const submissions = await Submission.find({
        documentSubmittedTo: document._id,
      })
        .populate("submittedBy")
        .populate("documentSubmittedTo");

      // Render the document details page, passing the document and the submission/submissions to the template
      res.render("course/document", {
        title: "Document info",
        document,
        submissions,
      });
    } else {
      // If the user is not an admin, find their submission (if any) for the current document
      const document = await Document.findById(id);

      // Render the document details page, passing the document to the template
      res.render("course/document", {
        title: "DOCUMENT DETAIL",
        document,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.editDocumentPage = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id);
    res.render("course/editDocument", { title: "Edit Document", document });
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
    ).populate("course");

    // FIND THE COURSE RELATED TO THE DOCUMENT
    const course = await Course.findOne(document.course._id);

    // UPDATE THE COURSE UPDATED_at FIELD
    course.updated_at = Date.now();
    await course.save();

    // REDIRECT TO THE DOCUMENT DETAILS PAGE
    res.redirect(`/api/v1/course/document/${document._id}`);
  } catch (error) {
    console.log(error);
    res.render("error", { title: "Error", error });
  }
};

// Display all documents for a given course
exports.document_list = function (req, res) {
  Document.find({ course: req.params.courseId })
    .populate("submissions")
    .exec(function (err, documents) {
      if (err) {
        return next(err);
      }
      // Render the chart view with the document data
      res.render("user/dashboard", { documents });
    });
};
