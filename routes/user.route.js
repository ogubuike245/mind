const express = require("express");
const {
  register,
  login,
  userProfile,
  userLogout,
} = require("../controller/user.controller");
const { isLoggedIn } = require("../middlewares/user.middleware");

const router = express.Router();

// GET ROUTES
router.get("/register", isLoggedIn, (req, res) => {
  res.render("register", { title: "User Registration" });
});
router.get("/login", isLoggedIn, (req, res) => {
  res.render("login", { title: "User Login" });
});
router.get("/user/profile/:id", (req, res) => {
  res.render("profile", { title: "User Profile" });
});
router.get("/logout", userLogout);

// POST ROUTES
router.post("/register", isLoggedIn, register);
router.post("/login", isLoggedIn, login);
router.post("/profile", userProfile);

module.exports = router;
