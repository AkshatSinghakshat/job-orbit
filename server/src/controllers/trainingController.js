const crypto = require("crypto");
const { Op } = require("sequelize");
const sequelize = require("../config/db");
const {
  TrainingInstitute, TrainingCourse, CourseCurriculum, TrainingBatch,
  TrainingInstructor, TrainingEnrollment, TrainingInvoice,
  TrainingCertificate, TrainingReview, TrainingCareerSupportRequest, Student, User,
} = require("../models");

const sendError = (res, status, message) => res.status(status).json({ success: false, message });
const slugify = (value) => String(value || "").toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160);
const numericId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0 ? Number(value) : null;

async function requireInstitute(req, res, next) {
  try {
    if (String(req.user?.role || "").toLowerCase() !== "training") return sendError(res, 403, "Training institute account required.");
    const institute = await TrainingInstitute.findOne({ where: { userId: req.user.id } });
    if (!institute) return sendError(res, 403, "Training institute profile is not set up.");
    req.institute = institute;
    return next();
  } catch (error) {
    console.error("Training institute lookup failed:", error.message);
    return sendError(res, 500, "Unable to load institute account.");
  }
}

exports.requireInstitute = requireInstitute;

exports.catalogCourses = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 20));
  const where = { status: "Published" };
  if (req.query.search) where[Op.or] = ["title", "description", "category"].map((field) => ({ [field]: { [Op.like]: `%${String(req.query.search).slice(0, 100)}%` } }));
  if (req.query.category) where.category = String(req.query.category).slice(0, 100);
  try {
    const result = await TrainingCourse.findAndCountAll({
      where,
      include: [
        { model: TrainingInstitute, attributes: ["id", "name", "website"], include: [{ model: User, attributes: ["name"] }] },
        { model: TrainingBatch, where: { status: { [Op.in]: ["upcoming", "active"] } }, required: false, attributes: ["id", "name", "startDate", "endDate", "capacity", "enrolledCount", "status"] },
      ],
      order: [["createdAt", "DESC"]], limit: pageSize, offset: (page - 1) * pageSize, distinct: true,
    });
    return res.json({ success: true, data: { courses: result.rows, total: result.count, page, pageSize }, courses: result.rows });
  } catch (error) { console.error("Course catalog error:", error.message); return sendError(res, 500, "Unable to load published courses."); }
};

exports.dashboard = async (req, res) => {
  try {
    const where = { instituteId: req.institute.id };
    const [totalCourses, totalBatches, pendingApplications, distinctStudents, totalInstructors, paid] = await Promise.all([
      TrainingCourse.count({ where }),
      TrainingBatch.count({ where }),
      TrainingEnrollment.count({ where: { ...where, status: "pending" } }),
      TrainingEnrollment.count({ where: { ...where, status: { [Op.in]: ["approved", "completed"] } }, distinct: true, col: "studentId" }),
      TrainingInstructor.count({ where: { instituteId: req.institute.id, status: "active" } }),
      TrainingInvoice.sum("total", { where: { ...where, status: "paid" } }),
    ]);
    const recentEnrollments = await TrainingEnrollment.findAll({
      where,
      include: [{ model: Student, include: [{ model: User, attributes: ["id", "name", "email"] }] }, { model: TrainingCourse, attributes: ["id", "title"] }, { model: TrainingBatch, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]], limit: 8,
    });
    return res.json({ success: true, data: {
      institute: req.institute,
      stats: { totalCourses, courses: totalCourses, totalBatches, batches: totalBatches, totalStudents: distinctStudents, students: distinctStudents, totalInstructors, trainers: totalInstructors, pendingApplications, applications: pendingApplications, revenueSummary: { paid: Number(paid || 0), currency: "INR" }, revenue: Number(paid || 0) },
      courses: await TrainingCourse.findAll({ where, order: [["createdAt", "DESC"]], limit: 5 }),
      recentEnrollments,
      applications: recentEnrollments.filter((item) => item.status === "pending"),
      batches: await TrainingBatch.findAll({ where, order: [["startDate", "ASC"]], limit: 5 }),
    } });
  } catch (error) {
    console.error("Training dashboard error:", error.message);
    return sendError(res, 500, "Unable to load institute dashboard.");
  }
};

exports.getProfile = async (req, res) => res.json({ success: true, data: { ...req.institute.toJSON(), name: req.institute.name || req.user.name } });

exports.updateProfile = async (req, res) => {
  const allowed = ["name", "website", "address", "categories", "contactEmail", "contactPhone", "logo"];
  const updates = {};
  for (const key of allowed) if (req.body?.[key] !== undefined) {
    if (typeof req.body[key] !== "string" || req.body[key].length > (key === "address" ? 3000 : 500)) return sendError(res, 400, `Invalid ${key}.`);
    updates[key] = req.body[key].trim() || null;
  }
  if (updates.name !== undefined && !updates.name) return sendError(res, 400, "Institute name is required.");
  if (updates.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.contactEmail)) return sendError(res, 400, "Contact email is invalid.");
  if (updates.website && !/^https:\/\//i.test(updates.website)) return sendError(res, 400, "Website must use HTTPS.");
  if (updates.logo && !/^https:\/\//i.test(updates.logo)) return sendError(res, 400, "Logo URL must use HTTPS.");
  try {
    if (updates.name && updates.name !== req.institute.name) {
      const base = slugify(updates.name) || "institute";
      updates.slug = `${base}-${req.institute.id}`;
    }
    await req.institute.update(updates);
    return res.json({ success: true, data: req.institute });
  } catch (error) {
    console.error("Training profile update error:", error.message);
    return sendError(res, 500, "Unable to update institute profile.");
  }
};

exports.listCourses = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 20));
  const where = { instituteId: req.institute.id };
  if (req.query.category) where.category = String(req.query.category).slice(0, 100);
  if (req.query.status && ["Draft", "Published", "Archived"].includes(req.query.status)) where.status = req.query.status;
  if (req.query.search) where[Op.or] = ["title", "description", "category"].map((field) => ({ [field]: { [Op.like]: `%${String(req.query.search).slice(0, 100)}%` } }));
  try {
    const result = await TrainingCourse.findAndCountAll({ where, order: [["updatedAt", "DESC"]], limit: pageSize, offset: (page - 1) * pageSize });
    return res.json({ success: true, data: { courses: result.rows, total: result.count, page, pageSize }, courses: result.rows });
  } catch (error) { console.error("Course listing error:", error.message); return sendError(res, 500, "Unable to fetch courses."); }
};

const courseFields = ["title", "category", "description", "level", "duration", "durationWeeks", "fee", "mode", "status"];
function courseValues(body, partial = false) {
  const out = {};
  for (const field of courseFields) if (body?.[field] !== undefined) out[field] = body[field];
  if (!partial || out.title !== undefined) {
    if (typeof out.title !== "string" || !out.title.trim() || out.title.trim().length > 180) throw new Error("Course title is required and must be 180 characters or fewer.");
    out.title = out.title.trim();
  }
  if (out.fee !== undefined && (!Number.isFinite(Number(out.fee)) || Number(out.fee) < 0 || Number(out.fee) > 99999999.99)) throw new Error("Course fee must be between 0 and 99,999,999.99.");
  if (out.durationWeeks !== undefined && (!Number.isInteger(Number(out.durationWeeks)) || Number(out.durationWeeks) < 0)) throw new Error("Duration in weeks must be a non-negative whole number.");
  if (out.level !== undefined && !["Beginner", "Intermediate", "Advanced", "All levels"].includes(out.level)) throw new Error("Invalid course level.");
  if (out.mode !== undefined && !["Online", "Offline", "Hybrid"].includes(out.mode)) throw new Error("Invalid course mode.");
  if (out.status !== undefined && !["Draft", "Published", "Archived"].includes(out.status)) throw new Error("Invalid course status.");
  if (out.category !== undefined && (typeof out.category !== "string" || out.category.length > 100)) throw new Error("Course category must be 100 characters or fewer.");
  if (out.description !== undefined && (typeof out.description !== "string" || out.description.length > 20000)) throw new Error("Course description must be 20,000 characters or fewer.");
  if (out.duration !== undefined && (typeof out.duration !== "string" || out.duration.length > 80)) throw new Error("Course duration must be 80 characters or fewer.");
  if (partial && Object.keys(out).length === 0) throw new Error("Provide at least one course field to update.");
  if (out.fee !== undefined) out.fee = Number(out.fee);
  if (out.durationWeeks !== undefined) out.durationWeeks = Number(out.durationWeeks);
  return out;
}

exports.createCourse = async (req, res) => {
  let values;
  try { values = courseValues(req.body); } catch (error) { return sendError(res, 400, error.message); }
  try {
    const slug = `${slugify(values.title) || "course"}-${crypto.randomBytes(3).toString("hex")}`;
    const course = await TrainingCourse.create({ ...values, slug, instituteId: req.institute.id });
    return res.status(201).json({ success: true, data: course, course });
  } catch (error) { console.error("Course create error:", error.message); return sendError(res, 500, "Unable to create course."); }
};

exports.getCourse = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid course ID.");
  try {
    const course = await TrainingCourse.findOne({ where: { id, instituteId: req.institute.id }, include: [{ model: CourseCurriculum, separate: true, order: [["orderIndex", "ASC"]] }] });
    if (!course) return sendError(res, 404, "Course not found.");
    return res.json({ success: true, data: course, course });
  } catch (error) { console.error("Course lookup error:", error.message); return sendError(res, 500, "Unable to fetch course."); }
};

exports.updateCourse = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid course ID.");
  let values;
  try { values = courseValues(req.body, true); } catch (error) { return sendError(res, 400, error.message); }
  try {
    const course = await TrainingCourse.findOne({ where: { id, instituteId: req.institute.id } });
    if (!course) return sendError(res, 404, "Course not found.");
    await course.update(values);
    return res.json({ success: true, data: course, course });
  } catch (error) { console.error("Course update error:", error.message); return sendError(res, 500, "Unable to update course."); }
};

exports.deleteCourse = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid course ID.");
  try {
    const course = await TrainingCourse.findOne({ where: { id, instituteId: req.institute.id } });
    if (!course) return sendError(res, 404, "Course not found.");
    const [batches, enrollments] = await Promise.all([TrainingBatch.count({ where: { courseId: id } }), TrainingEnrollment.count({ where: { courseId: id } })]);
    if (batches || enrollments) return sendError(res, 409, "This course has batches or enrollments. Archive it instead of deleting it.");
    await course.destroy();
    return res.json({ success: true, data: { id }, message: "Course deleted." });
  } catch (error) { console.error("Course delete error:", error.message); return sendError(res, 500, "Unable to delete course."); }
};

exports.listCurriculum = async (req, res) => {
  const courseId = numericId(req.params.courseId);
  if (!courseId) return sendError(res, 400, "Invalid course ID.");
  try {
    const course = await TrainingCourse.findOne({ where: { id: courseId, instituteId: req.institute.id } });
    if (!course) return sendError(res, 404, "Course not found.");
    const items = await CourseCurriculum.findAll({ where: { courseId }, order: [["orderIndex", "ASC"], ["id", "ASC"]] });
    return res.json({ success: true, data: items, items });
  } catch (error) { console.error("Curriculum listing error:", error.message); return sendError(res, 500, "Unable to fetch curriculum."); }
};

exports.createCurriculumItem = async (req, res) => {
  const courseId = numericId(req.params.courseId);
  const { title, lessons = [], duration = null, orderIndex = 0 } = req.body || {};
  if (!courseId || typeof title !== "string" || !title.trim() || title.length > 180 || !Array.isArray(lessons) || lessons.length > 200 || lessons.some((lesson) => typeof lesson !== "string" || lesson.length > 300) || (duration !== null && (typeof duration !== "string" || duration.length > 80)) || !Number.isInteger(Number(orderIndex)) || Number(orderIndex) < 0) return sendError(res, 400, "Valid course, title, lessons, duration, and order are required.");
  try {
    const course = await TrainingCourse.findOne({ where: { id: courseId, instituteId: req.institute.id } });
    if (!course) return sendError(res, 404, "Course not found.");
    const item = await CourseCurriculum.create({ courseId, title: title.trim(), lessons, duration, orderIndex: Number(orderIndex) });
    return res.status(201).json({ success: true, data: item, item });
  } catch (error) { console.error("Curriculum create error:", error.message); return sendError(res, 500, "Unable to create curriculum module."); }
};

exports.updateCurriculumItem = async (req, res) => {
  const courseId = numericId(req.params.courseId); const itemId = numericId(req.params.itemId);
  if (!courseId || !itemId) return sendError(res, 400, "Invalid course or curriculum ID.");
  const updates = {};
  if (req.body?.title !== undefined) { if (typeof req.body.title !== "string" || !req.body.title.trim() || req.body.title.length > 180) return sendError(res, 400, "Valid module title is required."); updates.title = req.body.title.trim(); }
  if (req.body?.lessons !== undefined) { if (!Array.isArray(req.body.lessons) || req.body.lessons.length > 200 || req.body.lessons.some((lesson) => typeof lesson !== "string" || lesson.length > 300)) return sendError(res, 400, "Lessons must be text items of at most 300 characters."); updates.lessons = req.body.lessons; }
  if (req.body?.duration !== undefined) { if (typeof req.body.duration !== "string" || req.body.duration.length > 80) return sendError(res, 400, "Duration must be 80 characters or fewer."); updates.duration = req.body.duration; }
  if (req.body?.orderIndex !== undefined) { if (!Number.isInteger(Number(req.body.orderIndex)) || Number(req.body.orderIndex) < 0) return sendError(res, 400, "Invalid order index."); updates.orderIndex = Number(req.body.orderIndex); }
  try {
    const course = await TrainingCourse.findOne({ where: { id: courseId, instituteId: req.institute.id } });
    if (!course) return sendError(res, 404, "Course not found.");
    const item = await CourseCurriculum.findOne({ where: { id: itemId, courseId } });
    if (!item) return sendError(res, 404, "Curriculum module not found.");
    await item.update(updates);
    return res.json({ success: true, data: item, item });
  } catch (error) { console.error("Curriculum update error:", error.message); return sendError(res, 500, "Unable to update curriculum module."); }
};

const isCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const validBatchDates = (startDate, endDate) => isCalendarDate(startDate) && isCalendarDate(endDate) && endDate > startDate;
exports.listBatches = async (req, res) => {
  try {
    const batches = await TrainingBatch.findAll({ where: { instituteId: req.institute.id }, include: [{ model: TrainingCourse, attributes: ["id", "title"] }, { model: TrainingInstructor, attributes: ["id", "name"] }], order: [["startDate", "ASC"]] });
    return res.json({ success: true, data: batches, batches });
  } catch (error) { console.error("Batch listing error:", error.message); return sendError(res, 500, "Unable to fetch batches."); }
};

exports.createBatch = async (req, res) => {
  const { courseId: rawCourseId, instructorId, name, startDate, endDate, capacity } = req.body || {};
  const courseId = numericId(rawCourseId); const parsedCapacity = Number(capacity);
  if (!courseId || typeof name !== "string" || !name.trim() || name.length > 160 || !validBatchDates(startDate, endDate) || !Number.isInteger(parsedCapacity) || parsedCapacity < 1 || parsedCapacity > 10000) return sendError(res, 400, "Provide a course, batch name, valid dates, and capacity (1–10000). End date must be after start date.");
  try {
    const course = await TrainingCourse.findOne({ where: { id: courseId, instituteId: req.institute.id } });
    if (!course) return sendError(res, 404, "Course not found.");
    let parsedInstructorId = null;
    if (instructorId !== undefined && instructorId !== null && instructorId !== "") {
      parsedInstructorId = numericId(instructorId);
      if (!parsedInstructorId) return sendError(res, 400, "Invalid instructor ID.");
      const instructor = await TrainingInstructor.findOne({ where: { id: parsedInstructorId, instituteId: req.institute.id, status: "active" } });
      if (!instructor) return sendError(res, 400, "Instructor does not belong to this institute or is inactive.");
    }
    const batch = await TrainingBatch.create({ instituteId: req.institute.id, courseId, instructorId: parsedInstructorId, name: name.trim(), startDate, endDate, capacity: parsedCapacity });
    return res.status(201).json({ success: true, data: batch, batch });
  } catch (error) { console.error("Batch create error:", error.message); return sendError(res, 500, "Unable to create batch."); }
};

exports.updateBatch = async (req, res) => {
  const id = numericId(req.params.id); if (!id) return sendError(res, 400, "Invalid batch ID.");
  const transaction = await sequelize.transaction();
  try {
    const batch = await TrainingBatch.findOne({ where: { id, instituteId: req.institute.id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!batch) { await transaction.rollback(); return sendError(res, 404, "Batch not found."); }
    const updates = {};
    for (const key of ["name", "startDate", "endDate", "capacity", "status", "instructorId"]) if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    if (updates.name !== undefined && (typeof updates.name !== "string" || !updates.name.trim() || updates.name.length > 160)) { await transaction.rollback(); return sendError(res, 400, "Invalid batch name."); }
    if ((updates.startDate !== undefined || updates.endDate !== undefined) && !validBatchDates(updates.startDate || batch.startDate, updates.endDate || batch.endDate)) { await transaction.rollback(); return sendError(res, 400, "Batch end date must be after start date."); }
    if (updates.capacity !== undefined && (!Number.isInteger(Number(updates.capacity)) || Number(updates.capacity) < batch.enrolledCount || Number(updates.capacity) > 10000)) { await transaction.rollback(); return sendError(res, 400, "Capacity cannot be below the current enrollment count."); }
    if (updates.status !== undefined && !["upcoming", "active", "completed", "cancelled"].includes(updates.status)) { await transaction.rollback(); return sendError(res, 400, "Invalid batch status."); }
    if (updates.instructorId !== undefined) { const instructorId = updates.instructorId ? numericId(updates.instructorId) : null; if (updates.instructorId && !instructorId) { await transaction.rollback(); return sendError(res, 400, "Invalid instructor ID."); } if (instructorId && !await TrainingInstructor.findOne({ where: { id: instructorId, instituteId: req.institute.id }, transaction })) { await transaction.rollback(); return sendError(res, 400, "Instructor does not belong to this institute."); } updates.instructorId = instructorId; }
    if (updates.capacity !== undefined) updates.capacity = Number(updates.capacity);
    if (updates.name !== undefined) updates.name = updates.name.trim();
    await batch.update(updates, { transaction });
    await transaction.commit();
    return res.json({ success: true, data: batch, batch });
  } catch (error) { if (!transaction.finished) await transaction.rollback(); console.error("Batch update error:", error.message); return sendError(res, 500, "Unable to update batch."); }
};

exports.listInstructors = async (req, res) => {
  try { const instructors = await TrainingInstructor.findAll({ where: { instituteId: req.institute.id }, order: [["name", "ASC"]] }); return res.json({ success: true, data: instructors, instructors }); }
  catch (error) { console.error("Instructor listing error:", error.message); return sendError(res, 500, "Unable to fetch instructors."); }
};

exports.createInstructor = async (req, res) => {
  const { name, email, specialization, bio, availabilityJson = [] } = req.body || {};
  if (typeof name !== "string" || !name.trim() || name.length > 150 || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Array.isArray(availabilityJson)) return sendError(res, 400, "Valid instructor name, email, and availability are required.");
  try { const instructor = await TrainingInstructor.create({ instituteId: req.institute.id, name: name.trim(), email: email.trim().toLowerCase(), specialization: typeof specialization === "string" ? specialization.slice(0, 180) : null, bio: typeof bio === "string" ? bio : null, availabilityJson }); return res.status(201).json({ success: true, data: instructor, instructor }); }
  catch (error) { if (error.name === "SequelizeUniqueConstraintError") return sendError(res, 409, "This instructor is already registered."); console.error("Instructor create error:", error.message); return sendError(res, 500, "Unable to create instructor."); }
};

exports.updateInstructor = async (req, res) => {
  const id = numericId(req.params.id); if (!id) return sendError(res, 400, "Invalid instructor ID.");
  try {
    const instructor = await TrainingInstructor.findOne({ where: { id, instituteId: req.institute.id } }); if (!instructor) return sendError(res, 404, "Instructor not found.");
    const updates = {}; for (const key of ["name", "email", "specialization", "bio", "availabilityJson", "status"]) if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    if (updates.name !== undefined && (typeof updates.name !== "string" || !updates.name.trim() || updates.name.length > 150)) return sendError(res, 400, "Invalid instructor name.");
    if (updates.email !== undefined && (typeof updates.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email))) return sendError(res, 400, "Invalid instructor email.");
    if (updates.availabilityJson !== undefined && !Array.isArray(updates.availabilityJson)) return sendError(res, 400, "Availability must be a list.");
    if (updates.status !== undefined && !["active", "inactive"].includes(updates.status)) return sendError(res, 400, "Invalid instructor status.");
    await instructor.update(updates); return res.json({ success: true, data: instructor, instructor });
  } catch (error) { console.error("Instructor update error:", error.message); return sendError(res, 500, "Unable to update instructor."); }
};

exports.listEnrollments = async (req, res) => {
  const where = { instituteId: req.institute.id }; if (req.query.status && ["pending", "approved", "rejected", "completed"].includes(req.query.status)) where.status = req.query.status;
  try { const enrollments = await TrainingEnrollment.findAll({ where, include: [{ model: Student, include: [{ model: User, attributes: ["id", "name", "email"] }] }, { model: TrainingCourse, attributes: ["id", "title"] }, { model: TrainingBatch, attributes: ["id", "name", "startDate", "endDate"] }], order: [["createdAt", "DESC"]], limit: 200 }); return res.json({ success: true, data: enrollments, enrollments }); }
  catch (error) { console.error("Enrollment listing error:", error.message); return sendError(res, 500, "Unable to fetch enrollments."); }
};

exports.createEnrollment = async (req, res) => {
  if (String(req.user?.role || "").toLowerCase() !== "student") return sendError(res, 403, "Student account required.");
  const batchId = numericId(req.body?.batchId); if (!batchId) return sendError(res, 400, "Valid batchId is required.");
  const transaction = await sequelize.transaction();
  try {
    const student = await Student.findOne({ where: { userId: req.user.id }, transaction }); if (!student) { await transaction.rollback(); return sendError(res, 403, "Student profile not found."); }
    const batch = await TrainingBatch.findByPk(batchId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!batch || batch.status === "cancelled" || batch.status === "completed") { await transaction.rollback(); return sendError(res, 404, "Available batch not found."); }
    const course = await TrainingCourse.findOne({ where: { id: batch.courseId, instituteId: batch.instituteId, status: "Published" }, transaction });
    if (!course) { await transaction.rollback(); return sendError(res, 404, "Published course not found."); }
    if (batch.enrolledCount >= batch.capacity) { await transaction.rollback(); return sendError(res, 409, "This batch is full."); }
    const enrollment = await TrainingEnrollment.create({ studentId: student.id, courseId: course.id, batchId, instituteId: batch.instituteId, status: "pending" }, { transaction });
    await transaction.commit(); return res.status(201).json({ success: true, data: enrollment, enrollment });
  } catch (error) { await transaction.rollback(); if (error.name === "SequelizeUniqueConstraintError") return sendError(res, 409, "You are already enrolled in this batch."); console.error("Enrollment create error:", error.message); return sendError(res, 500, "Unable to submit enrollment."); }
};

exports.updateEnrollmentStatus = async (req, res) => {
  const id = numericId(req.params.id); const status = req.body?.status;
  if (!id || !["approved", "rejected", "completed"].includes(status)) return sendError(res, 400, "Valid enrollment ID and status are required.");
  const transaction = await sequelize.transaction();
  try {
    const enrollment = await TrainingEnrollment.findOne({ where: { id, instituteId: req.institute.id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!enrollment) { await transaction.rollback(); return sendError(res, 404, "Enrollment not found."); }
    const batch = await TrainingBatch.findOne({ where: { id: enrollment.batchId, instituteId: req.institute.id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!batch) { await transaction.rollback(); return sendError(res, 409, "Enrollment batch is unavailable."); }
    if (enrollment.status === "completed") { await transaction.rollback(); return sendError(res, 409, "Completed enrollments cannot be changed."); }
    if (status === "completed" && enrollment.status !== "approved") { await transaction.rollback(); return sendError(res, 409, "Only approved enrollments can be marked completed."); }
    if (status === "approved" && enrollment.status !== "approved") {
      if (batch.enrolledCount >= batch.capacity) { await transaction.rollback(); return sendError(res, 409, "Batch capacity has been reached."); }
      await batch.increment("enrolledCount", { by: 1, transaction });
    }
    if (enrollment.status === "approved" && status === "rejected") await batch.decrement("enrolledCount", { by: 1, transaction });
    await enrollment.update({ status }, { transaction });
    await transaction.commit(); return res.json({ success: true, data: enrollment, enrollment });
  } catch (error) { await transaction.rollback(); console.error("Enrollment status update error:", error.message); return sendError(res, 500, "Unable to update enrollment status."); }
};

exports.listInvoices = async (req, res) => {
  try { const invoices = await TrainingInvoice.findAll({ where: { instituteId: req.institute.id }, include: [{ model: Student, include: [{ model: User, attributes: ["id", "name", "email"] }] }, { model: TrainingEnrollment, include: [{ model: TrainingCourse, attributes: ["id", "title"] }] }], order: [["createdAt", "DESC"]], limit: 200 }); return res.json({ success: true, data: invoices, invoices }); }
  catch (error) { console.error("Invoice listing error:", error.message); return sendError(res, 500, "Unable to fetch invoices."); }
};

exports.createInvoice = async (req, res) => {
  const enrollmentId = numericId(req.body?.enrollmentId); const tax = Number(req.body?.tax ?? 0);
  if (!enrollmentId || !Number.isFinite(tax) || tax < 0 || tax > 1000000) return sendError(res, 400, "Valid enrollment and tax amount are required.");
  const transaction = await sequelize.transaction();
  try {
    const enrollment = await TrainingEnrollment.findOne({ where: { id: enrollmentId, instituteId: req.institute.id }, include: [{ model: TrainingCourse, attributes: ["fee"] }], transaction, lock: transaction.LOCK.UPDATE });
    if (!enrollment) { await transaction.rollback(); return sendError(res, 404, "Enrollment not found."); }
    if (!["approved", "completed"].includes(enrollment.status)) { await transaction.rollback(); return sendError(res, 409, "An invoice can only be created for an approved enrollment."); }
    const existing = await TrainingInvoice.findOne({ where: { enrollmentId }, transaction });
    if (existing) { await transaction.rollback(); return sendError(res, 409, "An invoice already exists for this enrollment."); }
    const amount = Number(enrollment.TrainingCourse?.fee || 0); const total = Number((amount + tax).toFixed(2));
    const invoice = await TrainingInvoice.create({ enrollmentId, instituteId: req.institute.id, studentId: enrollment.studentId, invoiceNumber: `JO-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`, amount, tax, total }, { transaction });
    await transaction.commit(); return res.status(201).json({ success: true, data: invoice, invoice });
  } catch (error) { await transaction.rollback(); console.error("Invoice create error:", error.message); return sendError(res, 500, "Unable to create invoice."); }
};

exports.issueCertificate = async (req, res) => {
  const enrollmentId = numericId(req.body?.enrollmentId); if (!enrollmentId) return sendError(res, 400, "Valid completed enrollment is required.");
  try {
    const enrollment = await TrainingEnrollment.findOne({ where: { id: enrollmentId, instituteId: req.institute.id, status: "completed" }, include: [{ model: TrainingCourse } ] });
    if (!enrollment) return sendError(res, 404, "Completed enrollment not found.");
    const code = crypto.randomBytes(24).toString("hex");
    const verificationUrl = `${(process.env.FRONTEND_URL || "").replace(/\/$/, "")}/training-institute/certificates/verify?code=${code}`;
    const certificate = await TrainingCertificate.create({ studentId: enrollment.studentId, courseId: enrollment.courseId, instituteId: req.institute.id, certificateCode: code, issueDate: new Date().toISOString().slice(0, 10), verificationUrl });
    return res.status(201).json({ success: true, data: certificate, certificate });
  } catch (error) { if (error.name === "SequelizeUniqueConstraintError") return sendError(res, 409, "Certificate has already been issued."); console.error("Certificate issue error:", error.message); return sendError(res, 500, "Unable to issue certificate."); }
};

exports.verifyCertificate = async (req, res) => {
  const code = String(req.params.code || "").trim();
  if (!/^[a-f0-9]{48}$/i.test(code)) return sendError(res, 400, "Invalid certificate code.");
  try {
    const certificate = await TrainingCertificate.findOne({ where: { certificateCode: code, status: "issued" }, include: [{ model: TrainingCourse, attributes: ["title"] }, { model: TrainingInstitute, attributes: ["name"] }, { model: Student, include: [{ model: User, attributes: ["name"] }] }] });
    if (!certificate) return sendError(res, 404, "Certificate is invalid or has been revoked.");
    const data = { valid: true, certificateCode: certificate.certificateCode, issueDate: certificate.issueDate, studentName: certificate.Student?.User?.name || "Student", courseName: certificate.TrainingCourse?.title, instituteName: certificate.TrainingInstitute?.name };
    return res.json({ success: true, data });
  } catch (error) { console.error("Certificate verification error:", error.message); return sendError(res, 500, "Unable to verify certificate."); }
};

exports.listCertificates = async (req, res) => {
  try { const certificates = await TrainingCertificate.findAll({ where: { instituteId: req.institute.id }, include: [{ model: TrainingCourse, attributes: ["title"] }, { model: Student, include: [{ model: User, attributes: ["name", "email"] }] }], order: [["issueDate", "DESC"]], limit: 200 }); return res.json({ success: true, data: certificates, certificates }); }
  catch (error) { console.error("Certificate listing error:", error.message); return sendError(res, 500, "Unable to fetch certificates."); }
};

exports.listReviews = async (req, res) => {
  try { const reviews = await TrainingReview.findAll({ include: [{ model: TrainingCourse, where: { instituteId: req.institute.id }, attributes: ["id", "title"] }, { model: Student, include: [{ model: User, attributes: ["name"] }] }], order: [["createdAt", "DESC"]], limit: 200 }); return res.json({ success: true, data: reviews, reviews }); }
  catch (error) { console.error("Review listing error:", error.message); return sendError(res, 500, "Unable to fetch course reviews."); }
};

exports.updateReview = async (req, res) => {
  const id = numericId(req.params.id);
  const status = req.body?.status || (req.body?.isApproved === true ? "approved" : req.body?.isApproved === false ? "pending" : null);
  if (!id || !["pending", "approved", "rejected"].includes(status)) return sendError(res, 400, "Valid review ID and status are required.");
  try { const review = await TrainingReview.findOne({ where: { id }, include: [{ model: TrainingCourse, where: { instituteId: req.institute.id } }] }); if (!review) return sendError(res, 404, "Review not found."); await review.update({ status, isApproved: status === "approved" }); return res.json({ success: true, data: review }); }
  catch (error) { console.error("Review update error:", error.message); return sendError(res, 500, "Unable to update review."); }
};

exports.deleteReview = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid review ID.");
  try {
    const review = await TrainingReview.findOne({
      where: { id },
      include: [{ model: TrainingCourse, where: { instituteId: req.institute.id } }],
    });
    if (!review) return sendError(res, 404, "Review not found.");
    await review.destroy();
    return res.json({ success: true, message: "Review deleted." });
  } catch (error) {
    console.error("Review delete error:", error.message);
    return sendError(res, 500, "Unable to delete review.");
  }
};

exports.listCareerSupportRequests = async (req, res) => {
  try {
    const rows = await TrainingCareerSupportRequest.findAll({
      where: { instituteId: req.institute.id },
      include: [{ model: Student, include: [{ model: User, attributes: ["id", "name", "email"] }] }],
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    const requests = rows.map((row) => {
      const item = row.toJSON();
      const studentUser = item.Student?.User;
      return {
        ...item,
        studentName: studentUser?.name || "Student",
        email: studentUser?.email || "",
        student: studentUser ? { name: studentUser.name, email: studentUser.email } : null,
      };
    });
    return res.json({ success: true, data: requests, requests });
  } catch (error) {
    console.error("Career support list error:", error.message);
    return sendError(res, 500, "Unable to load career support requests.");
  }
};

exports.createCareerSupportRequest = async (req, res) => {
  if (String(req.user?.role || "").toLowerCase() !== "student") return sendError(res, 403, "Student account required.");
  const courseId = numericId(req.body?.courseId);
  const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
  const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
  if (!courseId || !subject || subject.length > 160 || description.length > 10000) return sendError(res, 400, "A valid course and request subject are required.");
  try {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return sendError(res, 403, "Student profile not found.");
    const course = await TrainingCourse.findOne({ where: { id: courseId, status: "Published" }, include: [{ model: TrainingInstitute, attributes: ["id"] }] });
    if (!course?.TrainingInstitute) return sendError(res, 404, "Published course not found.");
    const request = await TrainingCareerSupportRequest.create({
      instituteId: course.TrainingInstitute.id,
      studentId: student.id,
      subject,
      courseName: course.title,
      description: description || null,
    });
    return res.status(201).json({ success: true, data: request, request });
  } catch (error) {
    console.error("Career support create error:", error.message);
    return sendError(res, 500, "Unable to create career support request.");
  }
};

exports.updateCareerSupportStatus = async (req, res) => {
  const id = numericId(req.params.id);
  const statuses = { Pending: "pending", "In Progress": "in_progress", Resolved: "resolved", Rejected: "rejected" };
  const status = statuses[req.body?.status] || req.body?.status;
  if (!id || !["pending", "in_progress", "resolved", "rejected"].includes(status)) return sendError(res, 400, "Valid request ID and status are required.");
  try {
    const request = await TrainingCareerSupportRequest.findOne({ where: { id, instituteId: req.institute.id } });
    if (!request) return sendError(res, 404, "Career support request not found.");
    await request.update({ status });
    return res.json({ success: true, data: request, request });
  } catch (error) {
    console.error("Career support status error:", error.message);
    return sendError(res, 500, "Unable to update career support status.");
  }
};
