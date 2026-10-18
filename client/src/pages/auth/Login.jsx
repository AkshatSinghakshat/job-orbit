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
  training: "/training/dashboard",
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
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* NAVBAR */}
      <header className="relative z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <nav className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <BriefcaseBusiness size={27} />
            </div>

            <div>
              <div className="text-2xl font-extrabold tracking-tight">
                Job<span className="text-blue-500">Orbit</span>
              </div>
              <p className="text-[10px] tracking-[0.22em] text-slate-400">
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
                {label === "Home" && (
                  <span className="absolute mt-12 h-0.5 w-10 bg-blue-500" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/register"
              className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold transition hover:border-blue-500 hover:bg-white/5"
            >
              Register
            </Link>

            <Link
              to="/login"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Login
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-white/10 p-3 hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-slate-900 px-5 py-4 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navLinks.map(({ label, path, icon: Icon }) => (
                <Link
                  key={label}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-200 hover:bg-white/5"
                >
                  <Icon size={19} />
                  {label}
                </Link>
              ))}

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-xl border border-slate-600 px-4 py-3 text-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_35%,rgba(37,99,235,0.22),transparent_48%),radial-gradient(ellipse_at_90%_75%,rgba(29,78,216,0.18),transparent_40%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-16">
          {/* LEFT HERO */}
          <section className="py-3 lg:py-8">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
              <Sparkles size={17} className="text-blue-400" />
              Your Career Journey Starts Here
            </div>

            <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                JobOrbit
              </span>
            </h1>

            <p className="mt-6 text-lg font-medium text-slate-300 sm:text-xl">
              Find Jobs <span className="mx-2 text-blue-500">•</span>
              Connect with Companies
              <span className="mx-2 text-blue-500">•</span>
              Grow Your Skills
            </p>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Your career journey starts here. Discover opportunities,
              connect with employers, explore training programs and build
              your professional future with JobOrbit.
            </p>

            <div className="mt-10 grid max-w-2xl gap-x-8 gap-y-7 sm:grid-cols-2">
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
                <div key={title} className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${bg} ${color}`}
                  >
                    <Icon size={25} />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/feed"
              className="mt-9 inline-flex items-center gap-2 font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Explore JobOrbit <ArrowRight size={18} />
            </Link>
          </section>

          {/* RIGHT LOGIN CARD */}
          <section className="mx-auto w-full max-w-xl">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 text-slate-900 shadow-2xl shadow-black/30 sm:p-9">
              <div className="mb-7">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness size={25} />
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight">
                  Welcome back
                </h2>

                <p className="mt-2 text-slate-500">
                  Sign in to your JobOrbit account
                </p>
              </div>

              {successMessage && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                  {successMessage}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
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
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login to your account
                      <ArrowRight size={19} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-sm text-slate-400">Secure sign in</span>
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

            <p className="mt-5 text-center text-xs leading-6 text-slate-500">
              By signing in, you can access your JobOrbit account and
              opportunities available to your profile.
            </p>
          </section>
        </div>

        {/* PLATFORM HIGHLIGHTS */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 border-t border-white/10 px-5 py-8 sm:grid-cols-3 sm:gap-0">
          {[
            { value: "Find", label: "Career Opportunities", icon: Users },
            { value: "Connect", label: "With Companies", icon: Building2 },
            { value: "Grow", label: "Your Skills", icon: GraduationCap },
          ].map(({ value, label, icon: Icon }, index) => (
            <div
              key={value}
              className={`flex items-center justify-center gap-4 ${
                index !== 0 ? "sm:border-l sm:border-white/10" : ""
              }`}
            >
              <Icon size={27} className="text-blue-400" />
              <div>
                <p className="text-xl font-extrabold">{value}</p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} JobOrbit. Building better career
        connections.
      </footer>
    </div>
  );
}

export default Login;