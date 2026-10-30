import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  BriefcaseBusiness,
  MessageCircle,
  UserRound,
  LayoutDashboard,
  LogOut,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import NotificationBell from "../../components/NotificationBell";

const navLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Feed", path: "/feed", icon: MessageCircle },
  { name: "Courses", path: "/training-institute/courses", icon: BookOpen },
  {
    name: "Applications",
    path: "/training-institute/applications",
    icon: ClipboardList,
  },
  { name: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
  { name: "Profile", path: "/training-institute/profile", icon: UserRound },
];

const DASHBOARD_PATH = "/training-institute/dashboard";

export default function TrainingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");
    sessionStorage.clear();
    closeMenu();
    navigate("/login", { replace: true });
  };

  const linkClass =
    "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white";

  const dashboardClass =
    "flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-950/40 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 text-white shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link
          to={DASHBOARD_PATH}
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2"
          aria-label="JobOrbit Institute Dashboard"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-extrabold text-white shadow-lg">
            JO
          </span>
          <span className="text-lg font-extrabold tracking-tight sm:text-xl">
            JobOrbit <span className="text-blue-400">Institute</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <Link key={name} to={path} className={linkClass}>
              <Icon size={17} />
              {name}
            </Link>
          ))}

          <div className="mx-1 rounded-xl hover:bg-slate-800">
            <NotificationBell />
          </div>

          <button
            type="button"
            onClick={() => navigate(DASHBOARD_PATH)}
            className={dashboardClass}
            aria-label="Open Training Institute Dashboard"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 flex items-center gap-2 rounded-xl border border-red-500/40 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-xl border border-slate-700 p-2 text-slate-200 transition hover:bg-slate-800 lg:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-4 shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <Link
                key={name}
                to={path}
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <Icon size={19} />
                {name}
              </Link>
            ))}

            <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300">
              <NotificationBell />
              <span>Notifications</span>
            </div>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                navigate(DASHBOARD_PATH);
              }}
              className={`${dashboardClass} mt-1 w-full`}
            >
              <LayoutDashboard size={19} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl border border-red-500/40 px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
