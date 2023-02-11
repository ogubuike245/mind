const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

exports.register = async (req, res) => {
  const { name, email, password, selectedCourses } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      name,
      email,
      password: hashedPassword,
      selectedCourses,
    });
    const savedUser = await user.save();
    res.redirect("/api/v1/user/login");
  } catch (err) {
    res.render("error", { error: err.message, title: "ERROR" });
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
    return res.render("error", { error: error.message, title: "ERROR" });
  }
};

exports.userProfile = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.render("error", { error: err.message, title: "ERROR" });
  }

  res.render("profile", {
    name: user.name,
    email: user.email,
    selectedCourses: user.selectedCourses,
  });
};
exports.userLogout = async (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
};

// CREATE A JWT TOKEN
const maximumAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maximumAge,
  });
};
