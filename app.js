const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const moment = require("moment");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Include the routes
const userRoutes = require("./routes/user.route");
const courseRoutes = require("./routes/course.route");
const allowedMethods = require("./middlewares/allowed.methods");
const {
  checkForLoggedInUser,
  tokenVerification,
} = require("./middlewares/user.middleware");
const connectToDatabase = require("./config/database.config");

// Connect to MongoDB
const app = express();

connectToDatabase(app);
// Use EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARES AND STATIC
// Parse incoming request bodies as JSON
app.use(express.static("./dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(allowedMethods);
app.use((_, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'"
  );
  next();
});

//APP ROUTES
app.use(checkForLoggedInUser);
app.get("/", (_, response) => {
  response.render("index", { title: "HOME", moment });
});
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", tokenVerification, courseRoutes);
