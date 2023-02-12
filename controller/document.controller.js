const Document = require("../model/document.model");
const Course = require("../model/course.model");

// UPLOAD DOCUMENT

exports.uploadDocumentPage = async (req, res) => {
  res.render("upload", { title: "UPLOAD DOCUMENT" });
};
exports.uploadDocument = async (req, res) => {
  try {
    const { title, description, originalName, heading, type } = req.body;

    const course = await Course.findOne({ title: title });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newDoc = await new Course({
      path: req.file.path,
      originalName: req.file.originalname,
      heading,
      type,
      description,
      title,
      password: hashedPassword,
    });

    course.downloadLink = `http://localhost:5000/api/v1/course/download/${course.id}`;
    const savedCourse = await course.save();
    console.log(savedCourse);
    res.redirect(`/api/v1/course/details/${savedCourse.title}`);

    const savedDocument = await newDoc.save();
    course.documents.push(savedDocument._id);
    await course.save();

    res.render("success", {
      title: "success",
      success: "Document uploaded successfully.",
    });
  } catch (err) {
    console.log(err);
    res.render("error", { title: "ERROR", error: err });
  }
};

// DOWNLOAD DOCUMENT

// PAGE
exports.downloadDocumentPage = async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.render("download", { title: "DOWNLOAD DOCUMENT", file: course });
};

// FUNCTION
exports.downloadDocument = async (req, res) => {
  try {
    const { title, description, originalName, heading, type } = req.body;

    const course = await Course.findOne({ title: title });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newDoc = await new Course({
      path: req.file.path,
      originalName: req.file.originalname,
      heading,
      type,
      description,
      title,
      password: hashedPassword,
    });

    course.downloadLink = `http://localhost:5000/api/v1/course/download/${course.id}`;
    const savedCourse = await course.save();
    console.log(savedCourse);
    res.redirect(`/api/v1/course/category/${savedCourse.title}`);

    const savedDocument = await newDoc.save();
    course.documents.push(savedDocument._id);
    await course.save();

    res.render("success", {
      title: "success",
      success: "Document uploaded successfully.",
    });
  } catch (err) {
    console.log(err);
    res.render("error", { title: "ERROR", error: err });
  }
};

// VIEW DOCUMENT DETAILS
module.exports.documentDetailsPage = async (request, response) => {
  const { id } = request.params;
  try {
    const content = await Course.findById(id);
    response.render("details", {
      course: content,
      title: "DOCUMENT DETAIL",
    });
  } catch (error) {
    console.log(error);
  }
};
