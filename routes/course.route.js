const express = require("express");
const multer = require("multer");

const upload = multer({ dest: "./uploads" });
const {
  uploadDocumentPage,
  uploadDocument,
  downloadDocumentPage,
  downloadDocument,
  documentDetailsPage,
} = require("../controller/document.controller");
const {
  createCoursePage,
  createCourse,
  courseDetailsPage,
} = require("../controller/course.controller");

const {
  isLoggedIn,
  checkAdmin,
  tokenVerification,
} = require("../middlewares/user.middleware");

const router = express.Router();

// GET ROUTES
router.get("/upload", checkAdmin, uploadDocumentPage);
router.get("/create", checkAdmin, createCoursePage);
router.get("/download/:id", isLoggedIn, downloadDocumentPage);
router.get("/details/:title", tokenVerification, courseDetailsPage);
router.get("/document/:id", isLoggedIn, documentDetailsPage);

// POST ROUTES
router.post("/upload", checkAdmin, upload.single("file"), uploadDocument);
router.post("/create", checkAdmin, createCourse);
router.post("/download/:id", isLoggedIn, downloadDocument);

module.exports = router;
