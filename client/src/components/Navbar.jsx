
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  BriefcaseBusiness,
  Users,
  MessageCircle,
  UserCircle,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Authentication
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  // User information
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Failed to read user information:", error);
  }

  // Get role from localStorage or user object
  const role = String(
    localStorage.getItem("role") ||
      user.role ||
      user.userType ||
      "student"
  )
    .trim()
    .toLowerCase();

  // Role-based Dashboard Routes
  const dashboardPathMap = {
    student: "/student/dashboard",

    company: "/company/dashboard",
    employer: "/company/dashboard",

    training: "/training-institute/dashboard",
    "training-institute": "/training-institute/dashboard",
    training_institute: "/training-institute/dashboard",

    admin: "/developer/dashboard",
    developer: "/developer/dashboard",
  };

  const dashboardPath =
    dashboardPathMap[role] || "/student/dashboard";

  // Close mobile menu
  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");

    setMobileOpen(false);

    navigate("/login", { replace: true });
  };

  // Navigation links
  const navLinks = [
    {
      label: "Home",
      path: "/",
      icon: Home,
    },
    {
      label: "Jobs",
      path: "/#jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Feed",
      path: "/feed",
      icon: Users,
    },
  ];

  // Common link styles
  const linkClass =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium " +
    "text-gray-700 transition hover:bg-blue-50 hover:text-blue-700";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="shrink-0 text-2xl font-extrabold tracking-tight text-blue-700"
        >
          Job<span className="text-gray-900">Orbit</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ label, path, icon: Icon }) => (
            <Link
              key={label}
              to={path}
              className={linkClass}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}

          {isLoggedIn && (
            <>
              <Link
                to="/messages"
                className={linkClass}
              >
                <MessageCircle size={17} />
                Messages
              </Link>

              <Link
                to="/public-profile"
                className={linkClass}
              >
                <UserCircle size={17} />
                Profile
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <NotificationBell />

              {/* Feed */}
              <Link
                to="/feed"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Feed
              </Link>

              {/* Role-based Dashboard */}
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && <NotificationBell />}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 py-3 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map(({ label, path, icon: Icon }) => (
              <Link
                key={label}
                to={path}
                onClick={closeMobileMenu}
                className={linkClass}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <Link
                  to="/messages"
                  onClick={closeMobileMenu}
                  className={linkClass}
                >
                  <MessageCircle size={18} />
                  Messages
                </Link>

                <Link
                  to="/public-profile"
                  onClick={closeMobileMenu}
                  className={linkClass}
                >
                  <UserCircle size={18} />
                  Profile
                </Link>

                {/* Role-based Dashboard */}
                <Link
                  to={dashboardPath}
                  onClick={closeMobileMenu}
                  className={linkClass}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${linkClass} w-full text-left`}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className={linkClass}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className={`${linkClass} bg-blue-700 text-white hover:bg-blue-800 hover:text-white`}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
