const express = require("express");
const multer = require("multer");

const upload = multer({ dest: "./uploads" });
const {
  uploadDocumentPage,
  uploadDocument,
  downloadDocumentPage,
  downloadDocument,
  documentDetailsPage,
  editDocumentPage,
  editDocument,
} = require("../controllers/document.controller");
const {
  createCoursePage,
  createCourse,
  courseDetailsPage,
  editCoursePage,
  editCourse,
} = require("../controllers/course.controller");
const {
  submitDocumentPage,
  submitDocument,
} = require("../controllers/submission.controller");

const { checkAdmin } = require("../middlewares/user.middleware");

const router = express.Router();

// GET ROUTES
router.get("/upload", checkAdmin, uploadDocumentPage);
router.get("/create", checkAdmin, createCoursePage);
router.get("/download/:id", downloadDocumentPage);
router.get("/details/:code", courseDetailsPage);
router.get("/document/:id", documentDetailsPage);
router.get("/edit/:id", editCoursePage);
router.get("/document/edit/:id", editDocumentPage);
router.get("/submission/document/:id/type/assignment", submitDocumentPage);

// POST ROUTES
router.post("/upload", checkAdmin, upload.single("file"), uploadDocument);
router.post("/create", checkAdmin, createCourse);
router.post("/document/download/:id", downloadDocument);
router.post("/edit", checkAdmin, editCourse);
router.post("/document/edit", checkAdmin, editDocument);
router.post(
  "/submission/document/:id/type/assignment",
  upload.single("file"),
  submitDocument
);

module.exports = router;
