const User = require("./User");
const SavedPost = require("./SavedPost");
const Student = require("./Student");
const College = require("./College");
const Company = require("./Company");
const TrainingInstitute = require("./TrainingInstitute");
const Job = require("./job");
const Application = require("./Application");
const Post = require("./Post");
const Follow = require("./Follow");
const Comment = require("./Comment");
const Like = require("./Like");
const Share = require("./Share");
const ProfileVisit = require("./ProfileVisit");
const Notification = require("./Notification");
const PostReaction = require("./PostReaction");
const Repost = require("./Repost");
const PostReport = require("./PostReport");
const Resume = require("./Resume");
const Message = require("./Message");

const CodingPost = require("./CodingPost");
const CodingProblem = require("./CodingProblem");
const CodingSubmission = require("./CodingSubmission");
const CompanySettings = require("./CompanySettings");
const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const TrainingCourse = require("./TrainingCourse")(sequelize, DataTypes);
const CourseCurriculum = require("./CourseCurriculum");
const TrainingBatch = require("./TrainingBatch");
const TrainingInstructor = require("./TrainingInstructor");
const TrainingEnrollment = require("./TrainingEnrollment");
const TrainingInvoice = require("./TrainingInvoice");
const TrainingCertificate = require("./TrainingCertificate");
const TrainingReview = require("./TrainingReview");
const TrainingCareerSupportRequest = require("./TrainingCareerSupportRequest");


// Saved Posts
User.hasMany(SavedPost, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

SavedPost.belongsTo(User, {
  foreignKey: "userId",
});

Post.hasMany(SavedPost, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

SavedPost.belongsTo(Post, {
  foreignKey: "postId",
});


// Post Reactions
User.hasMany(PostReaction, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

PostReaction.belongsTo(User, {
  foreignKey: "userId",
});

Post.hasMany(PostReaction, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

PostReaction.belongsTo(Post, {
  foreignKey: "postId",
});


// Reposts
User.hasMany(Repost, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Repost.belongsTo(User, {
  foreignKey: "userId",
});

Post.hasMany(Repost, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

Repost.belongsTo(Post, {
  foreignKey: "postId",
});


// ==========================================
// User -> Resumes
// ==========================================

User.hasMany(Resume, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Resume.belongsTo(User, {
  foreignKey: "userId",
});

// Post Reports
User.hasMany(PostReport, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

PostReport.belongsTo(User, {
  foreignKey: "userId",
});

Post.hasMany(PostReport, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

PostReport.belongsTo(Post, {
  foreignKey: "postId",
});
// ==========================================
// User -> Student
// ==========================================

User.hasOne(Student, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Student.belongsTo(User, {
  foreignKey: "userId",
});

// ==========================================
// User -> College
// ==========================================

User.hasOne(College, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

College.belongsTo(User, {
  foreignKey: "userId",
});

// ==========================================
// User -> Company
// ==========================================

User.hasOne(Company, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Company.belongsTo(User, {
  foreignKey: "userId",
});

// ==========================================
// User -> Training Institute
// ==========================================

User.hasOne(TrainingInstitute, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

TrainingInstitute.belongsTo(User, {
  foreignKey: "userId",
});

TrainingInstitute.hasMany(TrainingCourse, {
  foreignKey: "instituteId",
  onDelete: "CASCADE",
});

TrainingCourse.belongsTo(TrainingInstitute, {
  foreignKey: "instituteId",
});

TrainingCourse.hasMany(CourseCurriculum, { foreignKey: "courseId", onDelete: "CASCADE" });
CourseCurriculum.belongsTo(TrainingCourse, { foreignKey: "courseId" });
TrainingCourse.hasMany(TrainingBatch, { foreignKey: "courseId", onDelete: "CASCADE" });
TrainingBatch.belongsTo(TrainingCourse, { foreignKey: "courseId" });
TrainingInstitute.hasMany(TrainingBatch, { foreignKey: "instituteId", onDelete: "CASCADE" });
TrainingBatch.belongsTo(TrainingInstitute, { foreignKey: "instituteId" });
TrainingInstitute.hasMany(TrainingInstructor, { foreignKey: "instituteId", onDelete: "CASCADE" });
TrainingInstructor.belongsTo(TrainingInstitute, { foreignKey: "instituteId" });
TrainingInstructor.hasMany(TrainingBatch, { foreignKey: "instructorId", onDelete: "SET NULL" });
TrainingBatch.belongsTo(TrainingInstructor, { foreignKey: "instructorId" });
TrainingInstitute.hasMany(TrainingEnrollment, { foreignKey: "instituteId", onDelete: "CASCADE" });
TrainingEnrollment.belongsTo(TrainingInstitute, { foreignKey: "instituteId" });
Student.hasMany(TrainingEnrollment, { foreignKey: "studentId", onDelete: "CASCADE" });
TrainingEnrollment.belongsTo(Student, { foreignKey: "studentId" });
TrainingCourse.hasMany(TrainingEnrollment, { foreignKey: "courseId", onDelete: "CASCADE" });
TrainingEnrollment.belongsTo(TrainingCourse, { foreignKey: "courseId" });
TrainingBatch.hasMany(TrainingEnrollment, { foreignKey: "batchId", onDelete: "CASCADE" });
TrainingEnrollment.belongsTo(TrainingBatch, { foreignKey: "batchId" });
TrainingEnrollment.hasOne(TrainingInvoice, { foreignKey: "enrollmentId", onDelete: "CASCADE" });
TrainingInvoice.belongsTo(TrainingEnrollment, { foreignKey: "enrollmentId" });
TrainingInstitute.hasMany(TrainingInvoice, { foreignKey: "instituteId", onDelete: "CASCADE" });
TrainingInvoice.belongsTo(TrainingInstitute, { foreignKey: "instituteId" });
Student.hasMany(TrainingInvoice, { foreignKey: "studentId", onDelete: "CASCADE" });
TrainingInvoice.belongsTo(Student, { foreignKey: "studentId" });
TrainingInstitute.hasMany(TrainingCertificate, { foreignKey: "instituteId", onDelete: "CASCADE" });
TrainingCertificate.belongsTo(TrainingInstitute, { foreignKey: "instituteId" });
Student.hasMany(TrainingCertificate, { foreignKey: "studentId", onDelete: "CASCADE" });
TrainingCertificate.belongsTo(Student, { foreignKey: "studentId" });
TrainingCourse.hasMany(TrainingCertificate, { foreignKey: "courseId", onDelete: "CASCADE" });
TrainingCertificate.belongsTo(TrainingCourse, { foreignKey: "courseId" });
Student.hasMany(TrainingReview, { foreignKey: "studentId", onDelete: "CASCADE" });
TrainingReview.belongsTo(Student, { foreignKey: "studentId" });
TrainingCourse.hasMany(TrainingReview, { foreignKey: "courseId", onDelete: "CASCADE" });
TrainingReview.belongsTo(TrainingCourse, { foreignKey: "courseId" });
TrainingInstitute.hasMany(TrainingCareerSupportRequest, { foreignKey: "instituteId", onDelete: "CASCADE" });
TrainingCareerSupportRequest.belongsTo(TrainingInstitute, { foreignKey: "instituteId" });
Student.hasMany(TrainingCareerSupportRequest, { foreignKey: "studentId", onDelete: "CASCADE" });
TrainingCareerSupportRequest.belongsTo(Student, { foreignKey: "studentId" });

// ==========================================
// Company -> Jobs
// ==========================================

Company.hasMany(Job, {
  foreignKey: "companyId",
  onDelete: "CASCADE",
});

Job.belongsTo(Company, {
  foreignKey: "companyId",
});

// ==========================================
// Student -> Applications
// ==========================================

Student.hasMany(Application, {
  foreignKey: "studentId",
  onDelete: "CASCADE",
});

Application.belongsTo(Student, {
  foreignKey: "studentId",
});

// ==========================================
// Job -> Applications
// ==========================================

Job.hasMany(Application, {
  foreignKey: "jobId",
  onDelete: "CASCADE",
});

Application.belongsTo(Job, {
  foreignKey: "jobId",
});
// Post -> Comments
Post.hasMany(Comment, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

Comment.belongsTo(Post, {
  foreignKey: "postId",
});

// User -> Comments
User.hasMany(Comment, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Comment.belongsTo(User, {
  foreignKey: "userId",
});


// User -> Profile Visits (as profile owner)
User.hasMany(ProfileVisit, {
  foreignKey: "profileUserId",
  as: "profileVisits",
  onDelete: "CASCADE",
});

ProfileVisit.belongsTo(User, {
  foreignKey: "profileUserId",
  as: "profileOwner",
});

// User -> Profile Visits (as visitor)
User.hasMany(ProfileVisit, {
  foreignKey: "visitorUserId",
  as: "profileVisitors",
  onDelete: "CASCADE",
});

ProfileVisit.belongsTo(User, {
  foreignKey: "visitorUserId",
  as: "visitor",
});
// ==========================================
// User -> Posts
// ==========================================

User.hasMany(Post, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Post.belongsTo(User, {
  foreignKey: "userId",
});

// ==========================================
// User -> Following
// ==========================================

User.hasMany(Follow, {
  foreignKey: "followerId",
  as: "following",
  onDelete: "CASCADE",
});

// ==========================================
// User -> Followers
// ==========================================

User.hasMany(Follow, {
  foreignKey: "followingId",
  as: "followers",
  onDelete: "CASCADE",
});

// ==========================================
// Follow -> Follower User
// ==========================================

Follow.belongsTo(User, {
  foreignKey: "followerId",
  as: "follower",
});

// ==========================================
// Follow -> Following User
// ==========================================

Follow.belongsTo(User, {
  foreignKey: "followingId",
  as: "followingUser",
});
// Post -> Likes
Post.hasMany(Like, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

Like.belongsTo(Post, {
  foreignKey: "postId",
});
// User -> Likes
User.hasMany(Like, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Like.belongsTo(User, {
  foreignKey: "userId",
});
// ==========================================
// POST -> SHARES
// ==========================================

Post.hasMany(Share, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

Share.belongsTo(Post, {
  foreignKey: "postId",
});

// ==========================================
// USER -> SHARES
// ==========================================

User.hasMany(Share, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Share.belongsTo(User, {
  foreignKey: "userId",
});
// ==========================================
// User -> Notifications
// ==========================================

User.hasMany(Notification, {
  foreignKey: "recipientId",
  as: "notifications",
  onDelete: "CASCADE",
});

Notification.belongsTo(User, {
  foreignKey: "recipientId",
  as: "recipient",
});

// ==========================================
// User -> Sent Notifications
// ==========================================

User.hasMany(Notification, {
  foreignKey: "senderId",
  as: "sentNotifications",
  onDelete: "SET NULL",
});

Notification.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

// ==========================================
// Post -> Notifications
// ==========================================

Post.hasMany(Notification, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

Notification.belongsTo(Post, {
  foreignKey: "postId",
});

// ==========================================
// Job -> Notifications
// ==========================================

Job.hasMany(Notification, {
  foreignKey: "jobId",
  onDelete: "CASCADE",
});

Notification.belongsTo(Job, {
  foreignKey: "jobId",
});

// ==========================================
// Application -> Notifications
// ==========================================

Application.hasMany(Notification, {
  foreignKey: "applicationId",
  onDelete: "CASCADE",
});

Notification.belongsTo(Application, {
  foreignKey: "applicationId",
});
// ==========================================
// User -> Messages
// ==========================================

User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
  onDelete: "CASCADE",
});

User.hasMany(Message, {
  foreignKey: "recipientId",
  as: "receivedMessages",
  onDelete: "CASCADE",
});

Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

Message.belongsTo(User, {
  foreignKey: "recipientId",
  as: "recipient",
});

/* ==========================================
   CODEARENA ASSOCIATIONS
========================================== */

// User -> Coding Posts
User.hasMany(CodingPost, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

CodingPost.belongsTo(User, {
  foreignKey: "userId",
});

// User -> Coding Submissions
User.hasMany(CodingSubmission, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

CodingSubmission.belongsTo(User, {
  foreignKey: "userId",
});

// Problem -> Coding Submissions
CodingProblem.hasMany(CodingSubmission, {
  foreignKey: "problemId",
  onDelete: "CASCADE",
});

CodingSubmission.belongsTo(CodingProblem, {
  foreignKey: "problemId",
});

// ==========================================
// Export Models
// ==========================================
module.exports = {
  User,
  Student,
  College,
  Company,
  CompanySettings,
  TrainingInstitute,
  TrainingCourse,
  CourseCurriculum,
  TrainingBatch,
  TrainingInstructor,
  TrainingEnrollment,
  TrainingInvoice,
  TrainingCertificate,
  TrainingReview,
  TrainingCareerSupportRequest,
  Job,
  Application,
  Post,
  Follow,
  Comment,
  Like,
  Share,
  ProfileVisit,
  Notification,
  SavedPost,
  Resume,
  PostReaction,
  Repost,
  PostReport,
  Message,
  CodingPost,
  CodingProblem,
  CodingSubmission,
};
