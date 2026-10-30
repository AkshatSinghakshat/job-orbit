import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CompanyApplicants from "../pages/CompanyApplicants";
import TrainingInstitutePage from "../pages/training/TrainingInstitutePage";

const trainingPages = [
  { path: "dashboard", title: "Training Dashboard" },
  { path: "courses", title: "Training Courses" },
  { path: "categories", title: "Course Categories" },
  { path: "course-pricing", title: "Course Pricing" },
  { path: "course-resources", title: "Course Resources" },
  { path: "course-modules", title: "Course Modules" },
  { path: "course-lessons", title: "Course Lessons" },
  { path: "batches", title: "Training Batches" },
  { path: "instructors", title: "Instructors" },
  { path: "enrollments", title: "Student Enrollments" },
  { path: "student-progress", title: "Student Progress" },
  { path: "assignments", title: "Assignments" },
  { path: "quizzes", title: "Quizzes & Tests" },
  { path: "certificates", title: "Certificates" },
  { path: "reviews", title: "Reviews & Ratings" },
  { path: "announcements", title: "Course Announcements" },
  { path: "reports", title: "Training Reports" },
  { path: "profile", title: "Institute Profile" },
  { path: "settings", title: "Training Settings" },
];

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default page */}
        <Route
          path="/"
          element={<Navigate to="/training-institute/dashboard" replace />}
        />

        {/* Company */}
        <Route
          path="/company/applicants"
          element={<CompanyApplicants />}
        />

        {/* Training Institute home */}
        <Route
          path="/training-institute"
          element={<Navigate to="/training-institute/dashboard" replace />}
        />

        {/* Training Institute pages */}
        {trainingPages.map((page) => (
          <Route
            key={page.path}
            path={`/training-institute/${page.path}`}
            element={<TrainingInstitutePage title={page.title} />}
          />
        ))}

        {/* Unknown URLs */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
              <h1 className="text-5xl font-bold text-slate-800">404</h1>
              <p className="mt-3 text-slate-500">Page not found.</p>
              <a
                href="/training-institute/dashboard"
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Go to Training Dashboard
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
