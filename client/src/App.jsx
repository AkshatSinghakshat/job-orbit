
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// FEED / PROFILE / NOTIFICATIONS
import Feed from "./pages/feed/Feed";
import UserProfile from "./pages/profile/UserProfile";
import Notifications from "./pages/Notifications";
import JobDetails from "./pages/JobDetails";
import ApplyForm from "./pages/ApplyForm";

// MESSAGES
import Messages from "./pages/company/Messages";
import CompanyApplicants from "./pages/CompanyApplicants";

// DEVELOPER DASHBOARD
import DeveloperDashboard from "./pages/developer/DeveloperDashboard";
import ManageUsers from "./pages/developer/ManageUsers";
import ManageJobs from "./pages/developer/ManageJobs";
import ManageCodeArena from "./pages/developer/ManageCodeArena";
import WebsiteSettings from "./pages/developer/WebsiteSettings";

// 404
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTHENTICATION */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* REGISTRATION */}
        <Route
          path="/register/student"
          element={<StudentRegister />}
        />
        <Route
          path="/register/college"
          element={<CollegeRegister />}
        />
        <Route
          path="/register/company"
          element={<CompanyRegister />}
        />
        <Route
          path="/register/training"
          element={<TrainingRegister />}
        />

        {/* CODE ARENA */}
        <Route
          path="/codearena"
          element={<CodeArena />}
        />

        {/* RESUME BUILDER */}
        <Route
          path="/resume-builder"
          element={<ResumeBuilder />}
        />

        {/* JOBS */}
        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />
        <Route
          path="/jobs/:id/apply"
          element={<ApplyForm />}
        />

        {/* STUDENT DASHBOARD */}
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        {/* COMPANY DASHBOARD */}
        <Route
          path="/company/dashboard"
          element={<CompanyDashboard />}
        />

        {/* COMPANY PROFILE */}
        <Route
          path="/company/profile"
          element={<CompanyProfile />}
        />

        {/* JOB MANAGEMENT */}
        <Route
          path="/company/jobs"
          element={<JobManagement />}
        />
        <Route
          path="/company/jobs/create"
          element={<CreateJob />}
        />
        <Route
          path="/company/jobs/:id/edit"
          element={<EditJob />}
        />

        {/* APPLICATIONS */}
        <Route
          path="/company/applications"
          element={<Applications />}
        />
        <Route
          path="/company/applicants"
          element={<CompanyApplicants />}
        />
        <Route
          path="/company/shortlisted"
          element={<Shortlisted />}
        />

        {/* CANDIDATE DETAILS */}
        <Route
          path="/company/candidates/:id"
          element={<CandidateDetails />}
        />

        {/* MESSAGES */}
        <Route
          path="/messages"
          element={<Messages />}
        />

        {/* COMPANY SETTINGS */}
        <Route
          path="/company/settings"
          element={<CompanySettings />}
        />

        {/* FEED */}
        <Route
          path="/feed"
          element={<Feed />}
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* PUBLIC PROFILE */}
        <Route
          path="/public-profile"
          element={<PublicProfile />}
        />

        {/* USER PROFILE */}
        <Route
          path="/profile/:userId"
          element={<UserProfile />}
        />

        {/* DEVELOPER DASHBOARD */}
        <Route
          path="/developer/dashboard"
          element={<DeveloperDashboard />}
        />
        <Route
          path="/developer/users"
          element={<ManageUsers />}
        />
        <Route
          path="/developer/jobs"
          element={<ManageJobs />}
        />
        <Route
          path="/developer/codearena"
          element={<ManageCodeArena />}
        />
        <Route
          path="/developer/settings"
          element={<WebsiteSettings />}
        />

        {/* 404 - UNKNOWN URL */}
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
