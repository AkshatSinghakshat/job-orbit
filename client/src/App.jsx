import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentRegister from "./pages/auth/StudentRegister";
import CollegeRegister from "./pages/auth/CollegeRegister";
import CompanyRegister from "./pages/auth/CompanyRegister";
import TrainingRegister from "./pages/auth/TrainingRegister";
import Feed from "./pages/feed/Feed";
import UserProfile from "./pages/profile/UserProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />
        <Route
  path="/feed"
  element={<Feed />}
/>
        <Route
  path="/student/dashboard"
  element={<StudentDashboard />}
/>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Registration Selection */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Student Registration */}
        <Route
          path="/register/student"
          element={<StudentRegister />}
        />

        {/* College Registration */}
        <Route
          path="/register/college"
          element={<CollegeRegister />}
        />

        {/* Company Registration */}
        <Route
          path="/register/company"
          element={<CompanyRegister />}
        />

        {/* Training Registration */}
        <Route
          path="/register/training"
          element={<TrainingRegister />}
        />

        {/* Unknown URL → Home */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        <Route
  path="/student/dashboard"
  element={<StudentDashboard />}
/>

<Route
  path="/profile/:userId"
  element={<UserProfile />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;