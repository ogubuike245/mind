const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Include the routes
const userRoutes = require("./routes/user.route");
const courseRoutes = require("./routes/course.route");
const allowedMethods = require("./middlewares/allowed.methods");
const { checkForLoggedInUser } = require("./middlewares/user.middleware");
const Course = require("./model/course.model");
// Connect to MongoDB
const app = express();

const { API_PORT, MONG0_DB_URI } = process.env;

const connectToDatabase = async (app) => {
  try {
    mongoose.set("strictQuery", false).connect(MONG0_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("CONNECTED TO MONGODB DATABASE ");
    app.listen(API_PORT || 9000, () => {
      console.log(`AUTH BACKEND RUNNING ON PORT : ${API_PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

connectToDatabase(app);
//DATABASE CONNECTION AND SERVER INITIALISATION

// Use EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parse incoming request bodies as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(allowedMethods);
app.use((_, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'"
  );
  next();
});

// Use the routes
app.get("*", checkForLoggedInUser);
app.get("/", async (_, response) => {
  response.render("index", { title: "HOME" });
});
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRoutes);
