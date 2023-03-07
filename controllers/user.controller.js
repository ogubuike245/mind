const bcrypt = require("bcrypt");
const moment = require("moment");

const jwt = require("jsonwebtoken");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Token = require("../models/token.model");
const { handleErrors } = require("../utils/errorHandling.utils");
const { sendVerificationEmail } = require("../utils/sendEmail.utils");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.MAX_AGE,
  });
};

// GENERATE OTP OF FOUR DIGITS
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

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

    const courses = await Course.find({
      code: { $in: selectedCourses },
    });
    const courseIds = courses.map((course) => course._id);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(`A user with the email already exists.`);
    }

    // Generate and hash the OTP
    const generatedOTP = generateOTP();
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(generatedOTP, saltRounds);

    // Hash password and save the user data along with the encrypted OTP in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstName,
      lastName,
      registrationNumber,
      phoneNumber,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    for (const courseId of courseIds) {
      const course = await Course.findById(courseId);
      course.registeredUsers.push(newUser._id);

      newUser.selectedCourses.push({
        courseId,
      });

      await course.save();
    }

    const token = new Token({
      value: hashedOtp,
      user: newUser._id,
    });

    await newUser.save();
    await token.save();

    await sendVerificationEmail(newUser, generatedOTP);

    res.status(200).json("verification email sent , please check your email");
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
      res.redirect(`/api/v1/user/reset/password/email/sent`);
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json("EMPTY VALUES");
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json("NO RECORD FOUND");
    }

    const existingToken = await Token.findOne({ user: existingUser._id });

    if (!existingToken) {
      return res.status(400).json("OTP NOT FOUND OR HAS EXPIRED");
    }

    const isValidOTP = await bcrypt.compare(otp, existingToken.value);

    if (!isValidOTP) {
      return res.status(400).json("INVALID OTP");
    }

    await User.updateOne(
      { _id: existingUser._id },
      { $set: { isVerified: true } }
    );
    res.redirect("/api/v1/user/login");
    await Token.deleteOne({ _id: existingToken._id });
  } catch (err) {
    console.log(err);
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

    res.cookie(process.env.JWT_NAME, createToken(user._id), {
      httpOnly: true,
      maximumAge: process.env.MAX_AGE,
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
    const user = await User.findById(id)
      .populate({
        path: "downloads.document",
        model: "Document",
      })
      .populate({
        path: "selectedCourses.courseId",
        model: "Course",
      });

    console.log(user);

    if (!user) {
      return res.render("error", { error: "User not found", title: "ERROR" });
    }

    const selectedCourses = await Course.find({
      _id: { $in: user.selectedCourses },
    }).sort({ title: 1 });

    res.render("user/profile", {
      name: user.name,
      email: user.email,
      user,
      selectedCourses,
      moment,
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
  res.clearCookie(process.env.JWT_NAME);
  res.redirect("/");
};
