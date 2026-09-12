import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BriefcaseBusiness,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Registration ke baad jo message aaya ho
  const successMessage = location.state?.message || "";

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!form.password) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }
      );

      const data = response.data;

      console.log("Login Response:", data);

      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      // --------------------------------
      // Save JWT Token
      // --------------------------------
      localStorage.setItem("token", data.token);

      // --------------------------------
      // Save User Information
      // --------------------------------
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // --------------------------------
      // Backend se role automatically milega
      // --------------------------------
      const role = data.user?.role;

      console.log("Logged in user role:", role);

      // --------------------------------
      // Role → Dashboard
      // --------------------------------
      const dashboardRoutes = {
        //student: "/student/dashboard"
        student: "/feed",
        college: "/college/dashboard",
        company: "/company/dashboard",
        training: "/training/dashboard",
        admin: "/admin/dashboard",
      };

      const dashboard = dashboardRoutes[role];

      // Agar backend ne invalid role bheja
      if (!dashboard) {
        console.error("Invalid role received:", role);

        setError(
          "Invalid user role received from server"
        );

        return;
      }

      // --------------------------------
      // Dashboard par redirect
      // --------------------------------
      navigate(dashboard, {
        replace: true,
      });
    } catch (error) {
      console.error("Login Error:", error);

      // Backend ka error message show karo
      if (error.response) {
        setError(
          error.response.data?.message ||
            "Login failed"
        );
      } else if (error.request) {
        setError(
          "Server is not responding. Please start the backend server."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* =========================
            LOGO
        ========================== */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-4">
            <BriefcaseBusiness size={28} />
          </div>

          <h1 className="text-3xl font-bold text-white">
            JobOrbit
          </h1>

          <p className="text-slate-400 mt-2">
            Login to continue
          </p>

        </div>

        {/* =========================
            LOGIN CARD
        ========================== */}
        <div className="bg-white rounded-2xl shadow-2xl p-7">

          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="text-slate-500 mt-1 mb-6">
            Sign in to your JobOrbit account
          </p>

          {/* =========================
              SUCCESS MESSAGE
          ========================== */}
          {successMessage && (
            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* =========================
              ERROR MESSAGE
          ========================== */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =========================
              LOGIN FORM
          ========================== */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* =========================
                EMAIL
            ========================== */}
            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* =========================
                PASSWORD
            ========================== */}
            <div>

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setError(
                      "Forgot password feature will be available soon."
                    );
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>

              </div>

              <div className="relative">

                <Lock
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* =========================
                LOGIN BUTTON
            ========================== */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Logging in...
                </>
              ) : (
                "Login"
              )}

            </button>

          </form>

          {/* =========================
              REGISTER
          ========================== */}
          <p className="text-center text-sm text-slate-500 mt-6">

            Don't have an account?{" "}

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create account
            </button>

          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;