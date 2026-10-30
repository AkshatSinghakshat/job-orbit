import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// HOME
import Home from "./pages/Home";

// RESUME
import ResumeBuilder from "./pages/ResumeBuilder";

// CODE ARENA
import CodeArena from "./pages/CodeArena";

// AUTH
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PublicProfile from "./pages/auth/PublicProfile";
import StudentRegister from "./pages/auth/StudentRegister";
import CollegeRegister from "./pages/auth/CollegeRegister";
import CompanyRegister from "./pages/auth/CompanyRegister";
import TrainingRegister from "./pages/auth/TrainingRegister";

// STUDENT
import StudentDashboard from "./pages/student/StudentDashboard";

// COMPANY
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import CreateJob from "./pages/company/CreateJob";
import EditJob from "./pages/company/EditJob";
import JobManagement from "./pages/company/JobManagement";
import Applications from "./pages/company/Applications";
import Shortlisted from "./pages/company/Shortlisted";
import CandidateDetails from "./pages/company/CandidateDetails";
import CompanySettings from "./pages/company/CompanySettings";
import Messages from "./pages/company/Messages";
import CompanyApplicants from "./pages/CompanyApplicants";

// FEED / PROFILE / NOTIFICATIONS
import Feed from "./pages/feed/Feed";
import UserProfile from "./pages/profile/UserProfile";
import Notifications from "./pages/Notifications";
import JobDetails from "./pages/JobDetails";
import ApplyForm from "./pages/ApplyForm";

// DEVELOPER DASHBOARD
import DeveloperDashboard from "./pages/developer/DeveloperDashboard";
import ManageUsers from "./pages/developer/ManageUsers";
import ManageJobs from "./pages/developer/ManageJobs";
import ManageCodeArena from "./pages/developer/ManageCodeArena";
import WebsiteSettings from "./pages/developer/WebsiteSettings";

// 404
import NotFound from "./pages/NotFound";

// TRAINING INSTITUTE
import TrainingInstituteDashboard from "./pages/training-institute/TrainingInstituteDashboard";
import TrainingInstituteCourses from "./pages/training-institute/TrainingInstituteCourses";
import TrainingInstituteLayout from "./pages/training-institute/TrainingInstituteLayout";
import TrainingInstitutePage from "./pages/training-institute/TrainingInstitutePage";
import TrainingCourseCatalog from "./pages/training-institute/TrainingCourseCatalog";

// COURSE MANAGEMENT
import CreateCourse from "./pages/training-institute/CreateCourse";
import EditCourse from "./pages/training-institute/EditCourse";
import CourseCategories from "./pages/training-institute/CourseCategories";
import CourseCurriculum from "./pages/training-institute/CourseCurriculum";
import CourseDetails from "./pages/training-institute/CourseDetails";
import CourseFees from "./pages/training-institute/CourseFees";
import CoursePricing from "./pages/training-institute/CoursePricing";
import CourseResources from "./pages/training-institute/CourseResources";
import CourseReviews from "./pages/training-institute/CourseReviews";
import CoursePerformance from "./pages/training-institute/CoursePerformance";

// INSTITUTE PROFILE
import EditInstituteProfile from "./pages/training-institute/EditInstituteProfile";
import InstitutePublicProfile from "./pages/training-institute/InstitutePublicProfile";
import InstituteVerification from "./pages/training-institute/InstituteVerification";

// APPLICATIONS AND STUDENTS
import TrainingApplications from "./pages/training-institute/TrainingApplications";
import ApplicationDetails from "./pages/training-institute/ApplicationDetails";
import EnrolledStudents from "./pages/training-institute/EnrolledStudents";
import StudentDetails from "./pages/training-institute/StudentDetails";
import StudentAttendance from "./pages/training-institute/StudentAttendance";
import StudentPerformance from "./pages/training-institute/StudentPerformance";
import StudentFeedback from "./pages/training-institute/StudentFeedback";
import StudentDocuments from "./pages/training-institute/StudentDocuments";

// BATCH MANAGEMENT
import TrainingBatches from "./pages/training-institute/TrainingBatches";
import CreateBatch from "./pages/training-institute/CreateBatch";
import EditBatch from "./pages/training-institute/EditBatch";
import BatchDetails from "./pages/training-institute/BatchDetails";
import TrainingSchedule from "./pages/training-institute/TrainingSchedule";
import LiveClasses from "./pages/training-institute/LiveClasses";
import ClassRecordings from "./pages/training-institute/ClassRecordings";

// INSTRUCTOR MANAGEMENT
import TrainingInstructors from "./pages/training-institute/TrainingInstructors";
import AddInstructor from "./pages/training-institute/AddInstructor";
import EditInstructor from "./pages/training-institute/EditInstructor";
import InstructorDetails from "./pages/training-institute/InstructorDetails";
import InstructorAssignments from "./pages/training-institute/InstructorAssignments";
import StaffManagement from "./pages/training-institute/StaffManagement";
import InstructorAvailability from "./pages/training-institute/InstructorAvailability";

// ASSIGNMENTS AND QUIZZES
import TrainingAssignments from "./pages/training-institute/TrainingAssignments";
import CreateAssignment from "./pages/training-institute/CreateAssignment";
import TrainingQuizzes from "./pages/training-institute/TrainingQuizzes";
import CreateQuiz from "./pages/training-institute/CreateQuiz";
import TrainingResults from "./pages/training-institute/TrainingResults";

// CERTIFICATES
import TrainingCertificates from "./pages/training-institute/TrainingCertificates";
import IssueCertificate from "./pages/training-institute/IssueCertificate";
import CertificateVerification from "./pages/training-institute/CertificateVerification";

// FINANCE
import TrainingPayments from "./pages/training-institute/TrainingPayments";
import CreateInvoice from "./pages/training-institute/CreateInvoice";
import TrainingInvoices from "./pages/training-institute/TrainingInvoices";
import RefundManagement from "./pages/training-institute/RefundManagement";
import TrainingRevenue from "./pages/training-institute/TrainingRevenue";
import TrainingExpenses from "./pages/training-institute/TrainingExpenses";

// COMMUNICATION
import TrainingNotifications from "./pages/training-institute/TrainingNotifications";
import TrainingMessages from "./pages/training-institute/TrainingMessages";
import TrainingAnnouncements from "./pages/training-institute/TrainingAnnouncements";
import TrainingCampaigns from "./pages/training-institute/TrainingCampaigns";
import TrainingLeads from "./pages/training-institute/TrainingLeads";
import TrainingEnquiries from "./pages/training-institute/TrainingEnquiries";

// REPORTS AND ANALYTICS
import TrainingAnalytics from "./pages/training-institute/TrainingAnalytics";
import TrainingReports from "./pages/training-institute/TrainingReports";
import EnrollmentReports from "./pages/training-institute/EnrollmentReports";
import RevenueReports from "./pages/training-institute/RevenueReports";
import StudentReports from "./pages/training-institute/StudentReports";

// CAREER AND PLACEMENTS
import CareerSupport from "./pages/training-institute/CareerSupport";
import PlacementManagement from "./pages/training-institute/PlacementManagement";
import TrainingJobBoard from "./pages/training-institute/TrainingJobBoard";
import StudentReferrals from "./pages/training-institute/StudentReferrals";
import InterviewPreparation from "./pages/training-institute/InterviewPreparation";
import EmployerConnections from "./pages/training-institute/EmployerConnections";

// SETTINGS AND SUPPORT
import TrainingSettings from "./pages/training-institute/TrainingSettings";
import TrainingSecurity from "./pages/training-institute/TrainingSecurity";
import TrainingTeamRoles from "./pages/training-institute/TrainingTeamRoles";
import TrainingIntegrations from "./pages/training-institute/TrainingIntegrations";
import TrainingHelpCenter from "./pages/training-institute/TrainingHelpCenter";
import TrainingSupport from "./pages/training-institute/TrainingSupport";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTHENTICATION */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/college" element={<CollegeRegister />} />
        <Route path="/register/company" element={<CompanyRegister />} />
        <Route path="/register/training" element={<TrainingRegister />} />
        <Route path="/training/courses" element={<TrainingCourseCatalog />} />

        {/* RESUME AND CODE ARENA */}
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/codearena" element={<CodeArena />} />

        {/* JOBS */}
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/jobs/:id/apply" element={<ApplyForm />} />

        {/* STUDENT */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* COMPANY */}
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/jobs" element={<JobManagement />} />
        <Route path="/company/jobs/create" element={<CreateJob />} />
        <Route path="/company/jobs/:id/edit" element={<EditJob />} />
        <Route path="/company/applications" element={<Applications />} />
        <Route path="/company/applicants" element={<CompanyApplicants />} />
        <Route path="/company/shortlisted" element={<Shortlisted />} />
        <Route path="/company/candidates/:id" element={<CandidateDetails />} />
        <Route path="/company/settings" element={<CompanySettings />} />
        <Route path="/messages" element={<Messages />} />

        {/* FEED AND PROFILES */}
        <Route path="/feed" element={<Feed />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/public-profile" element={<PublicProfile />} />
        <Route path="/profile/:userId" element={<UserProfile />} />

        {/* DEVELOPER */}
        <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
        <Route path="/developer/users" element={<ManageUsers />} />
        <Route path="/developer/jobs" element={<ManageJobs />} />
        <Route path="/developer/codearena" element={<ManageCodeArena />} />
        <Route path="/developer/settings" element={<WebsiteSettings />} />

        {/* TRAINING INSTITUTE HOME */}
        <Route
          path="/training-institute"
          element={<Navigate to="/training-institute/dashboard" replace />}
        />

        {/* TRAINING INSTITUTE DASHBOARD */}
        <Route
          path="/training-institute/dashboard"
          element={<TrainingInstituteDashboard />}
        />

        {/* TRAINING INSTITUTE PROFILE */}
        <Route
          path="/training-institute/profile"
          element={<InstitutePublicProfile />}
        />
        <Route
          path="/training-institute/profile/edit"
          element={<EditInstituteProfile />}
        />
        <Route
          path="/training-institute/public-profile"
          element={<InstitutePublicProfile />}
        />
        <Route
          path="/training-institute/verification"
          element={<InstituteVerification />}
        />

        {/* COURSES */}
        <Route
          path="/training-institute/courses"
          element={<TrainingInstituteCourses />}
        />
        <Route
          path="/training-institute/courses/create"
          element={<CreateCourse />}
        />
        <Route
          path="/training-institute/courses/:id/edit"
          element={<EditCourse />}
        />
        <Route
          path="/training-institute/courses/:id"
          element={<CourseDetails />}
        />

        {/* COURSE SUB-PAGES */}
        <Route
          path="/training-institute/categories"
          element={<CourseCategories />}
        />
        <Route
          path="/training-institute/course-categories"
          element={<CourseCategories />}
        />
        <Route
          path="/training-institute/curriculum"
          element={<CourseCurriculum />}
        />
        <Route
          path="/training-institute/course-curriculum"
          element={<CourseCurriculum />}
        />
        <Route
          path="/training-institute/pricing"
          element={<CoursePricing />}
        />
        <Route
          path="/training-institute/course-pricing"
          element={<CoursePricing />}
        />
        <Route
          path="/training-institute/resources"
          element={<CourseResources />}
        />
        <Route
          path="/training-institute/course-resources"
          element={<CourseResources />}
        />
        <Route
          path="/training-institute/course-reviews"
          element={<CourseReviews />}
        />
        <Route
          path="/training-institute/course-fees"
          element={<CourseFees />}
        />
        <Route
          path="/training-institute/course-performance"
          element={<CoursePerformance />}
        />

        {/* APPLICATIONS AND STUDENTS */}
        <Route
          path="/training-institute/applications"
          element={<TrainingApplications />}
        />
        <Route
          path="/training-institute/applications/:id"
          element={<ApplicationDetails />}
        />
        <Route
          path="/training-institute/application-details"
          element={<ApplicationDetails />}
        />
        <Route
          path="/training-institute/students"
          element={<EnrolledStudents />}
        />
        <Route
          path="/training-institute/students/:id"
          element={<StudentDetails />}
        />
        <Route
          path="/training-institute/attendance"
          element={<StudentAttendance />}
        />
        <Route
          path="/training-institute/performance"
          element={<StudentPerformance />}
        />
        <Route
          path="/training-institute/student-feedback"
          element={<StudentFeedback />}
        />
        <Route
          path="/training-institute/student-documents"
          element={<StudentDocuments />}
        />

        {/* BATCHES */}
        <Route
          path="/training-institute/batches"
          element={<TrainingBatches />}
        />
        <Route
          path="/training-institute/batches/create"
          element={<CreateBatch />}
        />
        <Route
          path="/training-institute/batches/:id/edit"
          element={<EditBatch />}
        />
        <Route
          path="/training-institute/batches/:id"
          element={<BatchDetails />}
        />
        <Route
          path="/training-institute/batch-details"
          element={<BatchDetails />}
        />
        <Route
          path="/training-institute/schedule"
          element={<TrainingSchedule />}
        />
        <Route
          path="/training-institute/live-classes"
          element={<LiveClasses />}
        />
        <Route
          path="/training-institute/recordings"
          element={<ClassRecordings />}
        />
        <Route
          path="/training-institute/class-recordings"
          element={<ClassRecordings />}
        />

        {/* INSTRUCTORS AND STAFF */}
        <Route
          path="/training-institute/instructors"
          element={<TrainingInstructors />}
        />
        <Route
          path="/training-institute/instructors/add"
          element={<AddInstructor />}
        />
        <Route
          path="/training-institute/add-instructor"
          element={<AddInstructor />}
        />
        <Route
          path="/training-institute/instructors/:id/edit"
          element={<EditInstructor />}
        />
        <Route
          path="/training-institute/instructors/:id"
          element={<InstructorDetails />}
        />
        <Route
          path="/training-institute/instructor-assignments"
          element={<InstructorAssignments />}
        />
        <Route
          path="/training-institute/staff"
          element={<StaffManagement />}
        />
        <Route
          path="/training-institute/instructor-availability"
          element={<InstructorAvailability />}
        />

        {/* ASSIGNMENTS AND QUIZZES */}
        <Route
          path="/training-institute/assignments"
          element={<TrainingAssignments />}
        />
        <Route
          path="/training-institute/assignments/create"
          element={<CreateAssignment />}
        />
        <Route
          path="/training-institute/quizzes"
          element={<TrainingQuizzes />}
        />
        <Route
          path="/training-institute/quizzes/create"
          element={<CreateQuiz />}
        />
        <Route
          path="/training-institute/results"
          element={<TrainingResults />}
        />

        {/* CERTIFICATES */}
        <Route
          path="/training-institute/certificates"
          element={<TrainingCertificates />}
        />
        <Route
          path="/training-institute/certificates/issue"
          element={<IssueCertificate />}
        />
        <Route
          path="/training-institute/certificates/verify"
          element={<CertificateVerification />}
        />
        <Route
          path="/training-institute/certificate-verification"
          element={<CertificateVerification />}
        />

        {/* FINANCE */}
        <Route
          path="/training-institute/payments"
          element={<TrainingPayments />}
        />
        <Route
          path="/training-institute/fees"
          element={<CourseFees />}
        />
        <Route
          path="/training-institute/invoices"
          element={<TrainingInvoices />}
        />
        <Route
          path="/training-institute/invoices/create"
          element={<CreateInvoice />}
        />
        <Route
          path="/training-institute/refunds"
          element={<RefundManagement />}
        />
        <Route
          path="/training-institute/revenue"
          element={<TrainingRevenue />}
        />
        <Route
          path="/training-institute/expenses"
          element={<TrainingExpenses />}
        />

        {/* COMMUNICATION */}
        <Route
          path="/training-institute/notifications"
          element={<TrainingNotifications />}
        />
        <Route
          path="/training-institute/messages"
          element={<TrainingMessages />}
        />
        <Route
          path="/training-institute/announcements"
          element={<TrainingAnnouncements />}
        />
        <Route
          path="/training-institute/campaigns"
          element={<TrainingCampaigns />}
        />
        <Route
          path="/training-institute/leads"
          element={<TrainingLeads />}
        />
        <Route
          path="/training-institute/enquiries"
          element={<TrainingEnquiries />}
        />

        {/* REPORTS AND ANALYTICS */}
        <Route
          path="/training-institute/analytics"
          element={<TrainingAnalytics />}
        />
        <Route
          path="/training-institute/reports"
          element={<TrainingReports />}
        />
        <Route
          path="/training-institute/reports/enrollments"
          element={<EnrollmentReports />}
        />
        <Route
          path="/training-institute/reports/revenue"
          element={<RevenueReports />}
        />
        <Route
          path="/training-institute/reports/students"
          element={<StudentReports />}
        />
        <Route
          path="/training-institute/course-performance"
          element={<CoursePerformance />}
        />

        {/* CAREER AND PLACEMENT */}
        <Route
          path="/training-institute/career-support"
          element={<CareerSupport />}
        />
        <Route
          path="/training-institute/placements"
          element={<PlacementManagement />}
        />
        <Route
          path="/training-institute/jobs"
          element={<TrainingJobBoard />}
        />
        <Route
          path="/training-institute/referrals"
          element={<StudentReferrals />}
        />
        <Route
          path="/training-institute/interview-preparation"
          element={<InterviewPreparation />}
        />
        <Route
          path="/training-institute/employers"
          element={<EmployerConnections />}
        />

        {/* SETTINGS AND SUPPORT */}
        <Route
          path="/training-institute/settings"
          element={<TrainingSettings />}
        />
        <Route
          path="/training-institute/security"
          element={<TrainingSecurity />}
        />
        <Route
          path="/training-institute/team-roles"
          element={<TrainingTeamRoles />}
        />
        <Route
          path="/training-institute/integrations"
          element={<TrainingIntegrations />}
        />
        <Route
          path="/training-institute/help"
          element={<TrainingHelpCenter />}
        />
        <Route
          path="/training-institute/support"
          element={<TrainingSupport />}
        />

        {/* OTHER TRAINING PAGES */}
        <Route
          path="/training-institute/home"
          element={<TrainingInstitutePage />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
