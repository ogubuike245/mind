const Course = require("../model/Course.model");

exports.createCoursePage = async (req, res) => {
  res.render("createCourse", { title: "CREATE COURSE" });
};
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    console.log(req.file);
    const course = new Course({
      title,
      description,
    });

    await course.save();

    return res.status(200).json({
      success: true,
      message: " COURSE CREATED successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};
