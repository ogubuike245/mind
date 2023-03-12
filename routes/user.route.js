const express = require("express");
// fs = require("fs"),
// path = require("path"),
const {
  register,
  login,
  requestPasswordReset,
  passwordReset,
  verifyEmail,
  verifyEmailPage,
  userProfilepage,
  userLogout,
  adminDashboard,
  loginPage,
  registerPage,
  // resendOTP,
} = require("../controllers/user.controller");
const { isLoggedIn, checkAdmin } = require("../middlewares/user.middleware");
const Course = require("../models/course.model");
// const filepath = path.join(__dirname, "../utils/", "course.json");
// const rawdata = fs.readFileSync(filepath);
// const courses = JSON.parse(rawdata);

const userRouter = express.Router();

// GET ROUTES
userRouter.get("/register", isLoggedIn, registerPage);
userRouter.get("/verify/:email", isLoggedIn, verifyEmailPage);
userRouter.get("/login", isLoggedIn, loginPage);
userRouter.get("/profile/:id", userProfilepage);
userRouter.get("/dashboard", checkAdmin, adminDashboard);
userRouter.get("/logout", userLogout);

// NOT YET TESTED ROUTES

userRouter.get("/request/password/reset", isLoggedIn, (req, res) => {
  res.render("auth/requestPasswordReset", { title: "PASSWORD RESET PAGE" });
});
userRouter.get("/password/reset/:email", isLoggedIn, (req, res) => {
  const { email } = req.params;
  res.render("auth/passwordReset", { title: "RESET ", email });
});

userRouter.get("/reset/password/email/sent", (req, res) => {
  res.render("auth/resetEmail", { title: "RESET " });
});
// userRouter.get("/resend/otp", isLoggedIn, (req, res) => {
//   res.render("auth/resendOTP", { title: "RESET " });
// });

// POST ROUTES
userRouter.post("/register", isLoggedIn, register);
userRouter.post("/password/reset", passwordReset);
userRouter.post("/request/password/reset", requestPasswordReset);
userRouter.post("/verify/email", isLoggedIn, verifyEmail);
userRouter.post("/login", isLoggedIn, login);
// router.post("/resend/otp", resendOTP);

module.exports = userRouter;
