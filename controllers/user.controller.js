const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");
// const fs = require("fs"),
//   path = require("path");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Token = require("../models/token.model");
const Document = require("../models/document.model");
const { handleErrors } = require("../utils/errorHandling.utils");
const { sendVerificationEmail } = require("../utils/sendEmail.utils");

// register
// Registers a new user and saves their details in the database. The selected courses are also saved in the user's document.
exports.registerPage = async (req, res) => {
  const courses = await Course.find().sort({ title: 1 });
  // const filepath = path.join(__dirname, "../utils/", "course.json");
  // const rawdata = fs.readFileSync(filepath);
  // const courses = JSON.parse(rawdata);
  res.render("auth/register", { title: "User Registration", courses });
};

/**
 * @openapi
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               selectedCourses:
 *                 type: array
 *                 items:
 *                   type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               registrationNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful! A verification email has been sent to your email address. Please follow the instructions in the email to complete the verification process and log in to your account.
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Please select at least one course.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: An error occurred while registering the user.
 */
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

    if (!selectedCourses || selectedCourses.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Please select at least one course.",
      });
    }

    const courses = await Course.find({
      code: { $in: selectedCourses },
    });
    const courseIds = courses.map((course) => course._id);

    console.log(courseIds);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message:
          "A user with that email address already exists. Please try again with a different email address or log in to your existing account.",
      });
    }

    // Generate and hash the OTP
    const generatedOTP = generateOneTimePassword();
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

      if (!course) {
        return res.status(400).json({
          error: true,
          message: `The course with ID ${courseId} could not be found. Please make sure you have selected a valid course.`,
        });
      }

      course.registeredUsers.push(newUser._id);
      newUser.selectedCourses.push({
        courseId,
      });

      await course.save();
      console.log(course);
    }

    // console.log(newUser);

    const token = new Token({
      value: hashedOtp,
      generatedOTP,
      user: newUser._id,
    });

    await newUser.save();
    await token.save();

    await sendVerificationEmail(newUser, generatedOTP);

    res.status(200).json({
      success: true,
      message:
        "Registration successful! A verification email has been sent to your email address. Please follow the instructions in the email to complete the verification process and log in to your account.",
    });
  } catch (error) {
    const errorMessage = handleErrors(error, res);
    console.log(error);
    res.status(500).json({
      error: true,
      // message: error,
      message: errorMessage,
    });
  }
};

// verifyEmail
// Verifies the user's email address.
/**
 * @openapi
 * /api/v1/user/verify/email:
 *   post:
 *     summary: Verifies the user's email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address.
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 description: One-time password sent to the user's email.
 *                 example: 123456
 *             required:
 *               - email
 *               - otp
 *     responses:
 *       200:
 *         description: Email verification successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the verification was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: Email verification successful! You can now log in to your account.
 *                 redirect:
 *                   type: string
 *                   description: URL to redirect the user to after verification.
 *                   example: /
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Whether an error occurred.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Whether an error occurred.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Error message.
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ error: true, message: "Please provide both email and OTP." });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(400)
        .json({ error: true, message: "User with that email does not exist." });
    }

    const existingToken = await Token.findOne({ user: existingUser._id });

    if (!existingToken) {
      return res
        .status(400)
        .json({ error: true, message: "Token not found or has expired." });
    }

    const isValidOTP = await bcrypt.compare(otp, existingToken.value);

    if (!isValidOTP) {
      return res.status(400).json({ error: true, message: "Invalid OTP." });
    }

    await User.updateOne(
      { _id: existingUser._id },
      { $set: { isVerified: true } }
    );

    await Token.deleteOne({ _id: existingToken._id });

    res.status(200).json({
      success: true,
      message:
        "Email verification successful! You can now log in to your account.",
      redirect: "/",
    });
  } catch (error) {
    const errorMessage = handleErrors(error, res);
    console.log(error);
    res.status(500).json({ error: true, message: errorMessage });
  }
};

// login
// Logs in the user and creates a JWT cookie for the session.

exports.loginPage = async (req, res) => {
  res.render("auth/login", { title: "User Login" });
};
/**
 * @openapi
 * /api/v1/user/login:
 *   post:
 *     summary: Logs in a user with an email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: login Successful
 *                 redirect:
 *                   type: string
 *                   example: "/"
 *       '400':
 *         description: Invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Please provide both email and password.
 *       '401':
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Incorrect email or password. Please make sure you have entered the correct email and password combination.
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: An error occurred while logging in.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        error: true,
        message:
          "The email address provided does not match any existing accounts. Please double-check the email address or create a new account.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message:
          "Incorrect email or password. Please make sure you have entered the correct email and password combination.",
      });
    }

    if (!user.isVerified) {
      // check if there is an existing token for the user
      const existingToken = await Token.findOne({ user: user._id });

      if (existingToken) {
        // verification token already exists,
        return res.status(401).json({
          error: true,
          message:
            "Your account has not been fully verified yet. Please check your email for a verification code and enter it below to complete the verification process and access your account.",
        });
      } else {
        // generate new verification token and send it
        getNewOTP(res, user);
      }
    }

    res.cookie(process.env.JWT_NAME, createToken(user._id), {
      httpOnly: true,
      maximumAge: process.env.MAX_AGE,
    });

    res.status(200).json({
      success: true,
      message: "login Successful",
      redirect: "/",
    });
  } catch (error) {
    const errorMessage = handleErrors(error);
    res.status(500).json({
      error: true,
      message: errorMessage,
    });
  }
};

// userProfile
// Renders the user's profile page with their name, email and the courses they have registered for.

/**
 * Get user profile data by ID
 *
 * @openapi
 * /api/v1/user/profile/{id}:
 *   get:
 *     summary: Get user profile data by ID
 *     description: Retrieve user profile data including selected courses and document downloads
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to retrieve profile data for
 *     responses:
 *       '200':
 *         description: User profile data returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful
 *                 name:
 *                   type: string
 *                   description: User's name
 *                 email:
 *                   type: string
 *                   description: User's email address
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 selectedCourses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       '404':
 *         description: User with specified ID not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Indicates that an error occurred
 *                 message:
 *                   type: string
 *                   description: Error message
 */

exports.userProfilepage = async (req, res) => {
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

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    const selectedCourses = await Course.find({
      _id: { $in: user.selectedCourses },
    }).sort({ title: 1 });

    // If the request accepts HTML, render the EJS view
    if (req.accepts("html")) {
      return res.render("user/profile", {
        title: "User Profile",
        success: true,
        user,
        name: user.name,
        email: user.email,
        selectedCourses,
        moment,
      });
    }

    // If the request accepts JSON, send the data as JSON
    if (req.accepts("json")) {
      return res.status(200).json({
        success: true,
        name: user.name,
        email: user.email,
        user,
        selectedCourses,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// userLogout
// Logs out the user and clears the JWT cookie.
/**
 * @openapi
 * /logout:
 *   get:
 *     summary: Log out the currently authenticated user.
 *     description: Clears the JWT cookie and redirects the user to the home page.
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Successfully logged out and redirected to the home page.
 */
exports.userLogout = async (req, res) => {
  res.clearCookie(process.env.JWT_NAME);
  res.redirect("/");
};

exports.verifyEmailPage = async (req, res) => {
  try {
    // GET VALUES FROM REQUEST PARAMS
    const { email } = req.params;

    // VERIFY IF THE VALUES EXIST
    if (!email) {
      return res.status(400).json({
        error: true,
        message: "Email is required.",
      });
    }

    // CHECK IF THE USER EXISTS
    const existingUser = await User.findOne({ email });
    if (existingUser.isVerified) {
      return res.status(400).json({
        error: true,
        message: "Email has already been verified.",
      });
    }
    const existingToken = await Token.findOne({
      user: existingUser?._id,
    });

    if (!existingUser) {
      return res.status(404).json({
        error: true,
        message: "User not found.",
      });
    }

    if (!existingToken) {
      return res.status(404).json({
        error: true,
        message: "Token not found.",
      });
    }

    res.render("auth/verifyEmail", { title: "VERIFY ACCOUNT", email });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Internal server error.",
    });
  }
};

/**
 * @openapi
 * /api/v1/user/dashboard:
 *   get:
 *     summary: Get dashboard data for admin user.
 *     description: Retrieve dashboard data for an admin user, including registered courses, users, and documents.
 *     responses:
 *       '200':
 *         description: A successful response containing dashboard data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Title of the dashboard page.
 *                 courses:
 *                   type: array
 *                   description: List of registered courses.
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 users:
 *                   type: array
 *                   description: List of registered users.
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 documents:
 *                   type: array
 *                   description: List of all documents.
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 usersByDate:
 *                   type: array
 *                   description: List of users grouped by creation date.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: integer
 *                             description: Year of creation.
 *                           month:
 *                             type: integer
 *                             description: Month of creation.
 *                           day:
 *                             type: integer
 *                             description: Day of creation.
 *                       count:
 *                         type: integer
 *                         description: Number of users created on the specified date.
 */

exports.adminDashboard = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ title: 1 })
      .populate("documents")
      .populate("registeredUsers");

    const users = await User.find().populate("submissions");
    const documents = await Document.find()
      .populate("course")
      .populate("downloadedBy")
      .populate("submissions");

    documents.forEach((doc) => {
      console.log("DOCUMENT:", doc.course, doc.downloadedBy);
    });

    const usersByDate = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            day: { $dayOfMonth: "$created_at" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // If the request accepts HTML, render the EJS view
    if (req.accepts("html")) {
      return res.render("user/dashboard", {
        title: "Dashboard",
        courses,
        users,
        documents,
        usersByDate,
      });
    }

    // If the request accepts JSON, send the data as JSON
    if (req.accepts("json")) {
      return res.json({
        courses,
        users,
        documents,
        usersByDate,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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

// LOGIC NOT YET COMPLETE
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
// exports.resendOTP = async (req, res) => {
//   try {
//   } catch (err) {
//     res.render("error", { error: err, title: "ERROR" });
//   }
// };

// RESUSABLE FUNCTIONS

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.MAX_AGE,
  });
};

// GENERATE OTP OF FOUR DIGITS
function generateOneTimePassword() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// GENERATE OTP AND SAVE TO TOKEN MODEL
async function generateOneTimePasswordAndSave(userId) {
  const generatedOTP = generateOneTimePassword();
  await Token.deleteOne({ user: userId });
  const hashedOtp = await bcrypt.hash(generatedOTP, 10);
  const token = new Token({ value: hashedOtp, user: userId, generatedOTP });
  await token.save();
  return { hashedOTP: hashedOtp, generatedOTP: generatedOTP };
}

// GET NEW OTP FUNCTION
async function getNewOTP(res, user) {
  // generate new verification token and send it
  const newToken = await generateOneTimePasswordAndSave(user._id);
  await sendVerificationEmail(user, newToken.generatedOTP);
  return res.status(401).json({
    success: true,
    message:
      "Your verification code has expired. Verification codes are valid for 24 hours,  A New verification code has been sent to your email.",
  });
}
