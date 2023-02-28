const moment = require("moment");

const Course = require("../models/course.model");
const Document = require("../models/document.model");

exports.createCoursePage = async (req, res) => {
  const course = await Course.find();
  res.render("course/createCourse", { title: "CREATE COURSE", course });
};
exports.createCourse = async (req, res) => {
  try {
    const { title, description, code } = req.body;

    const course = new Course({
      code,
      description,
      title,
    });

    await course.save();

    res.render("success", {
      title: "success",
      success: " COURSE CREATED successfully.",
    });
  } catch (error) {
    handleErrors(error, res);
    // res.render("error", { title: "ERROR", error: error });
  }
};

exports.editCoursePage = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    res.render("course/editCourse", { title: "Edit Course", course });
  } catch (error) {
    console.log(error);
    res.render("error", { title: "Error", error });
  }
};

exports.editCourse = async (req, res) => {
  try {
    const { id, title, description, code } = req.body;

    await Course.findOneAndUpdate(
      { _id: id },
      { title, description, code, updated_at: Date.now() }
    );

    res.render("success", {
      title: "Success",
      success: "Course updated successfully.",
    });
  } catch (error) {
    console.log(error);
    res.render("error", { title: "Error", error });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await Course.findByIdAndDelete(id);

    res.render("success", {
      title: "Success",
      success: "Course deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.render("error", { title: "Error", error });
  }
};

exports.courseDetailsPage = async (req, res) => {
  const { code } = req.params;

  const course = await Course.findOne({ code: code })
    .populate("documents")
    .populate("registeredUsers");

  res.render("course/index", { title: " COURSE DETAILS", course, moment });
};

// Display all courses
exports.course_list = function (req, res) {
  Course.find({})
    .populate("documents")
    .populate("registeredUsers")
    .exec(function (err, courses) {
      if (err) {
        return next(err);
      }
      // Render the chart view with the course data
      res.render("user/dashboard", { courses });
    });
};
