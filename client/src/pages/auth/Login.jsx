import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BriefcaseBusiness,
  Mail,
  Lock,
  Loader2,
  Menu,
  X,
  Home,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://joborbit-api.onrender.com/api")
).replace(/\/+$/, "");

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const successMessage = location.state?.message || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const data = response.data;

      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role) {
          localStorage.setItem("role", data.user.role);
        }
      }

      const role = String(
        data.user?.role || data.user?.userType || ""
      )
        .trim()
        .toLowerCase();

      const dashboardRoutes = {
        student: "/feed",
        college: "/college/dashboard",
        company: "/company/dashboard",
        employer: "/company/dashboard",

        // Training Institute
        training: "/feed",
        training_institute: "/feed",
        "training-institute": "/feed",

        admin: "/admin/dashboard",
        developer: "/developer/dashboard",
      };

      const dashboard = dashboardRoutes[role];

      if (!dashboard) {
        setError("Invalid user role received from server");
        return;
      }

      navigate(dashboard, { replace: true });
    } catch (err) {
      console.error("Login Error:", err);

      if (err.response) {
        setError(err.response.data?.message || "Login failed");
      } else if (err.request) {
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

  const navLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Jobs", path: "/feed", icon: BriefcaseBusiness },
    { label: "Feed", path: "/feed", icon: Users },
    { label: "Companies", path: "/register/company", icon: Building2 },
    { label: "Training", path: "/register/training", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <nav className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between px-4 sm:min-h-[76px] sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30 sm:h-12 sm:w-12 sm:rounded-2xl">
              <BriefcaseBusiness size={22} className="text-white sm:h-[26px] sm:w-[26px]" />
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight sm:text-2xl">
                Job<span className="text-blue-500">Orbit</span>
              </div>
              <p className="text-[7px] tracking-[0.16em] text-slate-400 sm:text-[10px] sm:tracking-[0.22em]">
                CAREER PLATFORM
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map(({ label, path, icon: Icon }) => (
              <Link
                key={label}
                to={path}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  label === "Home"
                    ? "text-blue-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/register"
              className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold transition hover:border-blue-500 hover:bg-white/5"
            >
              Register
            </Link>

            <Link
              to="/login"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Login
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-white/10 p-2 text-slate-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && (
          <div className="absolute inset-x-0 top-full border-b border-white/10 bg-slate-900/98 px-4 py-4 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map(({ label, path, icon: Icon }) => (
                <Link
                  key={label}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  <Icon size={18} className="text-blue-400" />
                  {label}
                </Link>
              ))}

              <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-slate-700 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_35%,rgba(37,99,235,0.18),transparent_48%),radial-gradient(ellipse_at_90%_75%,rgba(29,78,216,0.14),transparent_40%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-6 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-16">
          
          {/* RIGHT LOGIN CARD (Appears first on mobile for quick login convenience) */}
          <section className="order-1 mx-auto w-full max-w-md lg:order-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-slate-900 shadow-xl shadow-black/20 sm:rounded-3xl sm:p-8">
              <div className="mb-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness size={22} />
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Welcome back
                </h2>

                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Sign in to your JobOrbit account
                </p>
              </div>

              {successMessage && (
                <div
                  role="status"
                  className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                  {successMessage}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Forgot password feature will be available soon."
                        )
                      }
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login to your account
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">Secure sign in</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Create account
                </button>
              </p>
            </div>
          </section>

          {/* LEFT HERO */}
          <section className="order-2 lg:order-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-200 sm:text-sm">
              <Sparkles size={15} className="text-blue-400" />
              Your Career Journey Starts Here
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                JobOrbit
              </span>
            </h1>

            <p className="mt-3 text-sm font-medium text-slate-300 sm:text-lg">
              Find Jobs <span className="mx-1.5 text-blue-500">•</span>
              Connect with Companies <span className="mx-1.5 text-blue-500">•</span>
              Grow Your Skills
            </p>

            <p className="mt-3 text-xs leading-relaxed text-slate-400 sm:text-base sm:leading-7">
              Discover opportunities, connect with employers, explore training
              programs, and build your professional future with JobOrbit.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {[
                {
                  title: "Explore Jobs",
                  desc: "Find the right opportunities",
                  icon: BriefcaseBusiness,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10 border-blue-500/30",
                },
                {
                  title: "Top Companies",
                  desc: "Connect with employers",
                  icon: Building2,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10 border-emerald-500/30",
                },
                {
                  title: "Skill Development",
                  desc: "Discover training programs",
                  icon: GraduationCap,
                  color: "text-violet-400",
                  bg: "bg-violet-500/10 border-violet-500/30",
                },
                {
                  title: "Professional Network",
                  desc: "Build your career network",
                  icon: Users,
                  color: "text-orange-400",
                  bg: "bg-orange-500/10 border-orange-500/30",
                },
              ].map(({ title, desc, icon: Icon, color, bg }) => (
                <div key={title} className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${bg} ${color}`}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white sm:text-base">{title}</h3>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* PLATFORM HIGHLIGHTS */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 border-t border-white/10 px-4 py-6 sm:grid-cols-3 sm:px-6 sm:py-8">
          {[
            { value: "Find", label: "Career Opportunities", icon: Users },
            { value: "Connect", label: "With Companies", icon: Building2 },
            { value: "Grow", label: "Your Skills", icon: GraduationCap },
          ].map(({ value, label, icon: Icon }, index) => (
            <div
              key={value}
              className={`flex items-center justify-center gap-3.5 py-2 ${
                index !== 0 ? "sm:border-l sm:border-white/10" : ""
              }`}
            >
              <Icon size={24} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-lg font-extrabold">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500 sm:py-5">
        © {new Date().getFullYear()} JobOrbit. Building better career connections.
      </footer>
    </div>
  );
}

export default Login;