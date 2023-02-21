const fs = require("fs");
const path = require("path");
const express = require("express");
const {
  register,
  login,
  requestPasswordReset,
  passwordReset,
  verifyEmail,
  resendOTP,
  userProfile,
  userLogout,
} = require("../controllers/user.controller");
const { isLoggedIn, checkAdmin } = require("../middlewares/user.middleware");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Document = require("../models/document.model");
const filepath = path.join(__dirname, "../utils/", "course.json");
const rawdata = fs.readFileSync(filepath);
// const courses = JSON.parse(rawdata);

const router = express.Router();

// GET ROUTES
router.get("/register", isLoggedIn, async (req, res) => {
  const courses = await Course.find();
  // console.log(courses);
  res.render("auth/register", { title: "User Registration", course: courses });
});
router.get("/request/password/reset", (req, res) => {
  res.render("auth/requestPasswordReset", { title: "PASSWORD RESET PAGE" });
});
router.get("/password/reset/:email", (req, res) => {
  const { email } = req.params;
  res.render("auth/passwordReset", { title: "RESET ", email });
});
router.get("/resend/otp", (req, res) => {
  res.render("auth/resendOTP", { title: "RESET " });
});
router.get("/verify/email", (req, res) => {
  res.render("auth/verifyEmail", { title: "RESET " });
});
router.get("/reset/password/email/sent", (req, res) => {
  res.render("auth/resetEmail", { title: "RESET " });
});
router.get("/login", isLoggedIn, (req, res) => {
  res.render("auth/login", { title: "User Login" });
});
router.get("/profile/:id", userProfile);

router.get("/dashboard", checkAdmin, async (req, res) => {
  const courses = await Course.find()
    .populate("documents")
    .populate("registeredUsers");
  const users = await User.find().populate("submissions");
  const documents = await Document.find().populate("submissions");

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

  // Sort by date

  // Process the data as needed and pass it to the view
  res.render("user/dashboard", {
    title: "Dashboard",
    courses,
    users,
    documents,
    usersByDate,
  });
});

router.get("/logout", userLogout);

// POST ROUTES
router.post("/register", isLoggedIn, register);
router.post("/password/reset", passwordReset);
router.post("/request/password/reset", requestPasswordReset);
router.post("/resend/otp", resendOTP);
router.post("/verify/email", verifyEmail);
router.post("/login", isLoggedIn, login);

module.exports = router;

/* 

GET  api/v1/user/register
GET  api/v1/user/verify/email
GET  api/v1/user/request/password/reset
GET  api/v1/user/password/reset/:email
GET  api/v1/user/resend/otp
GET  api/v1/user/login
GET  api/v1/user/dashboard
GET  api/v1/user/profile/:id
*/
/* 

POST  api/v1/user/register
POST  api/v1/user/verify/email
POST  api/v1/user/request/password/reset
POST  api/v1/user/password/reset/
POST  api/v1/user/resend/otp
POST  api/v1/user/login

*/
