const Course = require("../model/course.model");
const Document = require("../model/document.model");

exports.createCoursePage = async (req, res) => {
   const course = await Course.find();
  res.render("createCourse", { title: "CREATE COURSE", course });
};
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    const course = new Course({
      title,
      description,
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
    res.render("editCourse", { title: "Edit Course", course });
  } catch (error) {
    console.log(error);
    res.render("error", { title: "Error", error });
  }
};

exports.editCourse = async (req, res) => {
  try {
    const { id, title, description } = req.body;

    await Course.findOneAndUpdate(
      { _id: id },
      { title, description, updated_at: Date.now() }
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
  const { title } = req.params;

  const course = await Course.findOne({ title: title })
    .populate("documents")
    .populate("registeredUsers");

  res.render("course", { title: " COURSE DETAILS", course });
};
