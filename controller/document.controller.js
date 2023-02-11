const Document = require("../model/document.model");
const Course = require("../model/course.model");

exports.uploadDocumentPage = async (req, res) => {
  res.render("upload", { title: "UPLOAD DOCUMENT" });
};
exports.uploadDocument = async (req, res) => {
  try {
    const { title, description } = req.body;

    const course = await Course.findOne({ title: title });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    console.log(req.file);
    const newDoc = new Document({
      title,
      description,
      file: req.file.path,
      originalName: req.file.originalname,
    });

    const savedDocument = await newDoc.save();
    course.documents.push(savedDocument._id);

    // return res.status(200).json({
    //   success: true,
    //   message: "Document uploaded successfully.",
    // });

    res.render("success", {
      title: "success",
      success: "Document uploaded successfully.",
    });
  } catch (err) {
    console.log(err);
    // return res.status(400).json({
    //   success: false,
    //   message: "An error occurred. Please try again later.",
    // });
    res.render("error", { title: "ERROR", error: err });
  }
};
