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
} = require("../controller/user.controller");
const { isLoggedIn, checkAdmin } = require("../middlewares/user.middleware");
const Course = require("../model/course.model");

const router = express.Router();

// GET ROUTES
router.get("/register", isLoggedIn, async (req, res) => {
  const course = await Course.find();
  res.render("auth/register", { title: "User Registration", course });
});
router.get("/request/password/reset", (req, res) => {
  res.render("auth/requestPasswordReset", { title: "PASSWORD RESET PAGE" });
});
router.get("/password/reset/:email", (req, res) => {
  res.render("auth/passwordReset", { title: "RESET " });
});
router.get("/resend/otp", (req, res) => {
  res.render("auth/resendOTP", { title: "RESET " });
});
router.get("/verify/email", (req, res) => {
  res.render("auth/verifyEmail", { title: "RESET " });
});
router.get("/login", isLoggedIn, (req, res) => {
  res.render("auth/login", { title: "User Login" });
});
router.get("/profile/:id", userProfile);

router.get("/dashboard", checkAdmin, (req, res) => {
  Course.find({})
    .populate("documents")
    .populate("registeredUsers")
    .then((courses) => {
      res.render("user/dashboard", { title: "Chart Page", courses });
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
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
