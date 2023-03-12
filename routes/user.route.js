const fs = require("fs"),
  path = require("path"),
  express = require("express");

const {
  register,
  login,
  requestPasswordReset,
  passwordReset,
  verifyEmail,
  verifyEmailPage,
  resendOTP,
  userProfile,
  userLogout,
  adminDashboard,
} = require("../controllers/user.controller");
const { isLoggedIn, checkAdmin } = require("../middlewares/user.middleware");
const Course = require("../models/course.model");
const filepath = path.join(__dirname, "../utils/", "course.json");
const rawdata = fs.readFileSync(filepath);
// const courses = JSON.parse(rawdata);

const userRouter = express.Router();

// GET ROUTES
userRouter.get("/register", isLoggedIn, async (req, res) => {
  const courses = await Course.find().sort({ title: 1 });
  res.render("auth/register", { title: "User Registration", course: courses });
});
userRouter.get("/request/password/reset", isLoggedIn, (req, res) => {
  res.render("auth/requestPasswordReset", { title: "PASSWORD RESET PAGE" });
});
userRouter.get("/password/reset/:email", isLoggedIn, (req, res) => {
  const { email } = req.params;
  res.render("auth/passwordReset", { title: "RESET ", email });
});
userRouter.get("/resend/otp", isLoggedIn, (req, res) => {
  res.render("auth/resendOTP", { title: "RESET " });
});
userRouter.get("/verify/:email", isLoggedIn, verifyEmailPage);

userRouter.get("/reset/password/email/sent", (req, res) => {
  res.render("auth/resetEmail", { title: "RESET " });
});
userRouter.get("/login", isLoggedIn, (req, res) => {
  res.render("auth/login", { title: "User Login" });
});
userRouter.get("/profile/:id", userProfile);

userRouter.get("/dashboard", checkAdmin, adminDashboard);

userRouter.get("/logout", userLogout);

// POST ROUTES
userRouter.post("/register", isLoggedIn, register);
userRouter.post("/password/reset", passwordReset);
userRouter.post("/request/password/reset", requestPasswordReset);
// router.post("/resend/otp", resendOTP);
userRouter.post("/verify/email", isLoggedIn, verifyEmail);
userRouter.post("/login", isLoggedIn, login);

module.exports = userRouter;

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
