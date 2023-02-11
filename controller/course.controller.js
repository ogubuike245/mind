const Course = require("../model/course.model");

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

    // return res.status(200).json({
    //   success: true,
    //   message: " COURSE CREATED successfully.",
    // });

    res.render("success", {
      title: "success",
      success: " COURSE CREATED successfully.",
    });
  } catch (error) {
    console.log(error);
    res.render("error", { title: "ERROR", error: error });
  }
};
