const jwt = require("jsonwebtoken");
const Course = require("../models/course.model");
const User = require("../models/user.model");

// CHECK IF THERE IS A LOGGED IN USER FROM THE JWT TOKEN

const checkForLoggedInUser = async (request, res, next) => {
  try {
    const token = request.cookies.gubi;
    if (!token) return next();

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id).populate({
      path: "selectedCourses.courseId",
      model: "Course",
    });

    if (!user) return res.redirect("/api/v1/user/register");

    request.user = res.locals.user = user;

    if (user.role === "admin") {
      // If user is an admin, fetch all courses
      const courses = await Course.find().sort({ title: 1 });
      request.selectedCourses = res.locals.selectedCourses = courses;
    } else {
      // If user is a regular user, fetch only the courses they registered for
      const selectedCourses = user.selectedCourses.map(
        (course) => course.courseId
      );
      const courses = await Course.find({
        _id: { $in: selectedCourses },
      }).sort({ title: 1 });

      request.selectedCourses = res.locals.selectedCourses = courses;
    }

    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // Token has expired, clear cookie and return error response
      res.clearCookie("gubi");

      res
        .status(401)
        .render("auth/expired", {
          heading: "Session has expired.",
          message: " Please log in again.",
        });
    } else {
      // Other errors, log and return error response
      console.error(err);
      request.user = res.locals.user = null;
      request.selectedCourses = res.locals.selectedCourses = null;
      return next(err);
    }
  }
};

// CHECK FOR IF THE USER IS LOGGED IN BEFORE REDIRECTING USER
const isLoggedIn = (request, response, next) => {
  if (request.user) {
    request.redirect("/api/v1/user");
  } else {
    next();
  }
};

// CHECK FOR USER ROLE AS ADMIN TO DENY ENTRY TO CERTAIN ROUTES

const checkAdmin = async (request, response, next) => {
  const user = await request.user;

  // console.log(user);
  if (!user) {
    return response.redirect("/");
  } else if (user.role !== "admin") {
    return response.send("unauthorized");
  } else {
    next();
  }
};

// CHECK TO SEE IF THE  JSON WEB TOKEN EXISTS AND ALSO IF THE TOKEN HAS BEEN VERIFIED
const tokenVerification = async (request, res, next) => {
  try {
    const token = request.cookies.jwt;

    if (!token) {
      return res.redirect("/api/v1/user/login");
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    console.log("REQUIRE AUTH:", decodedToken);

    // Attach user ID to request object and response locals
    request.user = decodedToken.id;
    res.locals.user = request.user;

    return next();
  } catch (err) {
    console.error(err);
    return res.redirect("/api/v1/user/login");
  }
};

module.exports = {
  tokenVerification,
  isLoggedIn,
  checkForLoggedInUser,
  checkAdmin,
};
