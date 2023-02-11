const express = require("express");
const multer = require("multer");

const upload = multer({ dest: "./uploads" });
const {
  uploadDocumentPage,
  uploadDocument,
} = require("../controller/document.controller");
const {
  createCoursePage,
  createCourse,
} = require("../controller/course.controller");

const { isLoggedIn } = require("../middlewares/user.middleware");

const router = express.Router();

// GET ROUTES
router.get("/upload", uploadDocumentPage);
router.get("/create", createCoursePage);

// POST ROUTES
router.post("/upload", upload.single("file"), uploadDocument);
router.post("/create", createCourse);

module.exports = router;
