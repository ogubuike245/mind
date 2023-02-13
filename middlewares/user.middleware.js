const jwt = require("jsonwebtoken");
const Course = require("../model/course.model");
const User = require("../model/user.model");

// CHECK IF THERE IS A LOGGED IN USER FROM THE JWT TOKEN

const checkForLoggedInUser = async (request, response, next) => {
  const token = request.cookies.jwt;
  try {
    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedToken.id);
      const selectedCourses = await Course.find({
        _id: { $in: user.selectedCourses },
      });

      // USER
      response.locals.user = user;
      request.user = user;

      // SELECTED COURSES
      response.locals.selectedCourses = selectedCourses;
      request.selectedCourses = selectedCourses;
    } else {
      response.locals.user = null;
      request.user = null;
    }
  } catch (error) {
    response.locals.user = null;
    request.user = null;
  }
  next();
};

// CHECK FOR IF THE USER IS LOGGED IN BEFORE REDIRECTING USER
const isLoggedIn = (request, response, next) => {
  if (response.locals.user) {
    response.redirect("/api/v1/user/");
  } else {
    next();
  }
};

// CHECK FOR USER ROLE AS ADMIN TO DENY ENTRY TO CERTAIN ROUTES

const checkAdmin = async (request, response, next) => {
  const user = await request.user;

  console.log(user);
  if (!user) {
    return response.redirect("/");
  } else if (user.role !== "admin") {
    return response.send("unauthorized");
  } else {
    next();
  }
};

// CHECK TO SEE IF THE  JSON WEB TOKEN EXISTS AND ALSO IF THE TOKEN HAS BEEN VERIFIED
const tokenVerification = (request, response, next) => {
  const token = request.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
      if (error) {
        console.log(error.message);
        response.redirect("/api/v1/user/login");
      } else {
        console.log("REQUIRE AUTH : ", decodedToken);
        response.locals.user = decodedToken.id;
        request.user = decodedToken.id;
        next();
      }
    });
  } else {
    response.redirect("/api/v1/user/login");
  }
};

module.exports = {
  tokenVerification,
  isLoggedIn,
  checkForLoggedInUser,
  checkAdmin,
};
