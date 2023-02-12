const express = require("express");
const {
  register,
  login,
  userProfile,
  userLogout,
} = require("../controller/user.controller");
const { isLoggedIn, checkAdmin } = require("../middlewares/user.middleware");
const Course = require("../model/course.model");

const router = express.Router();

// GET ROUTES
router.get("/register", isLoggedIn, (req, res) => {
  res.render("register", { title: "User Registration" });
});
router.get("/login", isLoggedIn, (req, res) => {
  res.render("login", { title: "User Login" });
});
router.get("/profile/:id", userProfile);

router.get("/chart", checkAdmin, (req, res) => {
  Course.find({})
    .then((courses) => {
      res.render("chart", { title: "Chart Page", courses });
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
    });
});

router.get("/logout", userLogout);

// POST ROUTES
router.post("/register", isLoggedIn, register);
router.post("/login", isLoggedIn, login);

module.exports = router;
