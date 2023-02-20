const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const { handleErrors } = require("../utils/errorHandling.utils");

// THIS NEEDS TO BE PUT IN AN ENVIRONMENT VARIABLE
const maximumAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maximumAge,
  });
};

// register
// Registers a new user and saves their details in the database. The selected courses are also saved in the user's document.
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      selectedCourses,
      firstName,
      lastName,
      registrationNumber,
      phoneNumber,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const courses = await Course.find({
      title: { $in: selectedCourses },
    });
    const courseIds = courses.map((course) => course._id);

    const user = await User.findOne({ email });

    const newUser = new User({
      firstName,
      lastName,
      registrationNumber,
      phoneNumber,
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
    handleErrors(err, res);
  }
};

// requestPasswordReset
// Sends an OTP to the user's email or phone number to reset their password. Redirects the user to a page where they can enter the OTP to reset their password.
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
    handleErrors(err, res);
  }
};

// passwordReset
// Resets the user's password and saves the new password hash in the database.
exports.passwordReset = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOne({ email });
    user.password = hashedPassword;
    await user.save();
    res.redirect(`/api/v1/user/login`);
  } catch (err) {
    res.render("error", { error: err, title: "ERROR" });
  }
};

// resendOTP
// Resends the OTP to the user's email or phone number.
exports.resendOTP = async (req, res) => {
  try {
  } catch (err) {
    res.render("error", { error: err, title: "ERROR" });
  }
};

// verifyEmail
// Verifies the user's email address.
exports.verifyEmail = async (req, res) => {
  try {
  } catch (err) {
    res.render("error", { error: err, title: "ERROR" });
  }
};

// login
// Logs in the user and creates a JWT cookie for the session.
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
    handleErrors(error, res);
  }
};

// userProfile
// Renders the user's profile page with their name, email and the courses they have registered for.
exports.userProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("downloads");

    if (!user) {
      return res.render("error", { error: "User not found", title: "ERROR" });
    }

    const selectedCourses = await Course.find({
      _id: { $in: user.selectedCourses },
    });

    res.render("user/profile", {
      name: user.name,
      email: user.email,
      selectedCourses,
      title: "USER PROFILE",
    });
  } catch (error) {
    return res.render("error", { error, title: "ERROR" });
  }
};

// Display all users for a given course
exports.user_list = function (req, res) {
  User.find({ courses: req.params.courseId })
    .populate("submissions")
    .exec(function (err, users) {
      if (err) {
        return next(err);
      }
      // Render the chart view with the user data
      res.render("user/dashboard", { users });
    });
};

// userLogout
// Logs out the user and clears the JWT cookie.
exports.userLogout = async (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
};
