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

const { isLoggedIn,checkAdmin } = require("../middlewares/user.middleware");

const router = express.Router();

// GET ROUTES
router.get("/upload", checkAdmin,uploadDocumentPage);
router.get("/create", checkAdmin,createCoursePage);

// POST ROUTES
router.post("/upload", checkAdmin,upload.single("file"), uploadDocument);
router.post("/create", checkAdmin,createCourse);

module.exports = router;
