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
  checkForLoggedInUser,
} = require("../middlewares/user.middleware");

const router = express.Router();

// GET ROUTES
router.get("/upload", checkAdmin, uploadDocumentPage);
router.get("/create", checkAdmin, createCoursePage);
router.get("/download/:id", checkForLoggedInUser, downloadDocumentPage);
router.get("/details/:title", checkForLoggedInUser, courseDetailsPage);
router.get("/document/:id", checkForLoggedInUser, documentDetailsPage);

// POST ROUTES
router.post(
  "/upload",
  checkForLoggedInUser,
  checkAdmin,
  upload.single("file"),
  uploadDocument
);
router.post("/create", checkAdmin, createCourse);
router.post("/document/download/:id", checkForLoggedInUser, downloadDocument);

module.exports = router;
