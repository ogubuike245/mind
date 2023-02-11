const Document = require("../model/document.model");
const Course = require("../model/Course.model");

exports.uploadDocumentPage = async (req, res) => {
  res.render("upload", { title: "UPLOAD DOCUMENT" });
};
exports.uploadDocument = async (req, res) => {
  try {
    const { title, description } = req.body;

    console.log(req.file);
    const newDoc = await new Document({
      title,
      description,
      file: req.file.path,
      originalName: req.file.originalname,
    });

    await newDoc.save();
    await Course.document.push(newDoc._id);

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};
