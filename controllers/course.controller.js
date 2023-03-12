const moment = require("moment");

const Course = require("../models/course.model");
const User = require("../models/user.model");
const Document = require("../models/document.model");
const { handleErrors } = require("../utils/errorHandling.utils");

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

    res.status(201).json({
      success: true,
      message: "COURSE CREATED SUCCESSFULLY",
    });
  } catch (error) {
    const errorMessage = handleErrors(error, res);

    res.status(500).json({
      error: true,
      message: errorMessage,
    });
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

exports.courseDetailsPage = async (req, res) => {
  const { code } = req.params;

  const course = await Course.findOne({ code: code })
    .populate("documents")
    .populate("registeredUsers");

  res.render("course/index", { title: " COURSE DETAILS", course, moment });
};

exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Remove the course's documents
    const documents = await Document.find({ course: courseId });
    for (const document of documents) {
      await document.remove();
    }

    // Remove the course's registered users
    const users = await User.find({ "selectedCourses.courseId": courseId });
    for (const user of users) {
      const courseIndex = user.selectedCourses.findIndex(
        (c) => c.courseId.toString() === courseId
      );
      user.selectedCourses.splice(courseIndex, 1);
      await user.save();
    }

    // Delete the course from the database
    await Course.findByIdAndRemove(courseId);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
      redirect: "/",
    });
  } catch (error) {
    console.error(error);
    handleErrors(error, res);
  }
};
