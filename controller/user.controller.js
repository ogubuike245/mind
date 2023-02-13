const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Course = require("../model/course.model");
const User = require("../model/user.model");

const maximumAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maximumAge,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, selectedCourses } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const courses = await Course.find({
      title: { $in: selectedCourses },
    });
    const courseIds = courses.map((course) => course._id);

    const user = await User.findOne({ email });
    if (user) {
      return res.render("error", {
        error: "EMAIL ALREADY EXISTS",
        title: "ERROR",
      });
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      selectedCourses: courseIds,
    });
    const savedUser = await newUser.save();

    for (const courseId of courseIds) {
      const course = await Course.findById(courseId);
      course.registeredUsers.push(savedUser._id);
      await course.save();
    }

    res.redirect("/api/v1/user/login");
  } catch (err) {
    res.render("error", { error: err.message, title: "ERROR" });
  }
};
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      res.redirect(`/api/v1/user/password/reset/${email}`);
      //SEND OTP TO EMAIL AND LINK TO REDIRECT USER TO PASSWORD RESET PAGE
      // ALTERNATIVE IS TO SEND OTP TO PHONE NUMBER
    } else {
      res.send("USER DOES NOT EXIST");
    }
  } catch (err) {
    res.render("error", { error: err, title: "ERROR" });
  }
};
exports.passwordReset = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOne({ email });
    user.password = hashedPassword;
    await user.save();
  } catch (err) {
    res.render("error", { error: err, title: "ERROR" });
  }
};
exports.resendOTP = async (req, res) => {
  try {
  } catch (err) {
    res.render("error", { error: err, title: "ERROR" });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
  } catch (err) {
    res.render("error", { error: err, title: "ERROR" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("error", {
        error: "USER DOES NOT EXIST",
        title: "ERROR",
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.render("error", {
        error: "INCORRECT PASSWORD",
        title: "ERROR",
      });
    }

    res.cookie("jwt", createToken(user._id), {
      httpOnly: true,
      maximumAge: maximumAge * 1000,
    });
    res.redirect("/");
  } catch (error) {
    return res.render("error", { error, title: "ERROR" });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.render("error", { error: "User not found", title: "ERROR" });
    }

    const selectedCourses = await Course.find({
      _id: { $in: user.selectedCourses },
    });

    res.render("profile", {
      name: user.name,
      email: user.email,
      selectedCourses,
      title: "USER PROFILE",
    });
  } catch (error) {
    return res.render("error", { error, title: "ERROR" });
  }
};

exports.userLogout = async (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
};
