
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CompanyApplicants from "../pages/CompanyApplicants";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/company/applicants"
          element={<CompanyApplicants />}
        />
      </Routes>
    </BrowserRouter>
  );
}
