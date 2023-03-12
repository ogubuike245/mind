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
  deleteDocument,
} = require("../controllers/document.controller");
const {
  createCoursePage,
  createCourse,
  courseDetailsPage,
  editCoursePage,
  editCourse,
  deleteCourse,
} = require("../controllers/course.controller");
const {
  submitDocumentPage,
  submitDocument,
} = require("../controllers/submission.controller");

const { checkAdmin } = require("../middlewares/user.middleware");

const courseRouter = express.Router();

// GET ROUTES
courseRouter.get("/upload", checkAdmin, uploadDocumentPage);
courseRouter.get("/create", checkAdmin, createCoursePage);
courseRouter.get("/download/:id", downloadDocumentPage);
courseRouter.get("/details/:code", courseDetailsPage);
courseRouter.get("/document/:id", documentDetailsPage);
courseRouter.get("/edit/:id", editCoursePage);
courseRouter.get("/document/edit/:id", editDocumentPage);
courseRouter.get(
  "/submission/document/:id/type/assignment",
  submitDocumentPage
);

// POST ROUTES
courseRouter.post("/upload", checkAdmin, upload.single("file"), uploadDocument);
courseRouter.post("/create", checkAdmin, createCourse);
courseRouter.post("/document/download/:id", downloadDocument);
courseRouter.post("/edit", checkAdmin, editCourse);
courseRouter.post("/document/edit", checkAdmin, editDocument);
courseRouter.post(
  "/submission/document/:id/type/assignment",
  upload.single("file"),
  submitDocument
);

//  DELETE ROUTES
courseRouter.delete("/delete/:id", deleteCourse);
courseRouter.delete("/document/delete/:id", deleteDocument);

module.exports = courseRouter;
