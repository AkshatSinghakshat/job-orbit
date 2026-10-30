const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/trainingController");

const router = express.Router();

// Certificate lookup is intentionally public; it returns only verification data.
router.get("/certificates/verify/:code", controller.verifyCertificate);
router.get("/catalog/courses", controller.catalogCourses);

// Students can submit an enrollment request; tenant-owned management routes below
// are restricted to the authenticated institute account.
router.post("/enrollments", authMiddleware, controller.createEnrollment);
router.post("/career-support", authMiddleware, controller.createCareerSupportRequest);

router.use(authMiddleware, controller.requireInstitute);

router.get("/dashboard", controller.dashboard);
router.get(["/institute/profile", "/profile"], controller.getProfile);
router.put(["/institute/profile", "/profile"], controller.updateProfile);

router.get("/courses", controller.listCourses);
router.post("/courses", controller.createCourse);
router.get("/courses/:id", controller.getCourse);
router.put("/courses/:id", controller.updateCourse);
router.delete("/courses/:id", controller.deleteCourse);

router.get("/courses/:courseId/curriculum", controller.listCurriculum);
router.post("/courses/:courseId/curriculum", controller.createCurriculumItem);
router.put("/courses/:courseId/curriculum/:itemId", controller.updateCurriculumItem);

router.get("/batches", controller.listBatches);
router.post("/batches", controller.createBatch);
router.put("/batches/:id", controller.updateBatch);

router.get("/instructors", controller.listInstructors);
router.post("/instructors", controller.createInstructor);
router.put("/instructors/:id", controller.updateInstructor);

router.get("/enrollments", controller.listEnrollments);
router.patch("/enrollments/:id/status", controller.updateEnrollmentStatus);
router.get("/applications", controller.listEnrollments);
router.patch("/applications/:id/status", controller.updateEnrollmentStatus);
router.get("/students", controller.listEnrollments);

router.get("/invoices", controller.listInvoices);
router.post("/invoices", controller.createInvoice);
router.get("/payments", controller.listInvoices);
router.get("/fees", controller.listInvoices);

router.get("/certificates", controller.listCertificates);
router.post("/certificates/issue", controller.issueCertificate);

router.get("/reviews", controller.listReviews);
router.patch("/reviews/:id", controller.updateReview);
router.delete("/reviews/:id", controller.deleteReview);

router.get("/career-support", controller.listCareerSupportRequests);
router.patch("/career-support/:id", controller.updateCareerSupportStatus);

router.use((req, res) => res.status(404).json({
  success: false,
  message: "Training API endpoint not found.",
  path: req.originalUrl,
}));

module.exports = router;
