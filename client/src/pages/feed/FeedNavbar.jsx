import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationService";
import {
  Home,
  BriefcaseBusiness,
  Bell,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
  Code2,
  LayoutDashboard,
  Plus,
  Users,
  CheckCheck,
  Trash2,
  Heart,
  UserPlus,
  Share2,
  Briefcase,
  Loader2,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Feed", path: "/feed", icon: Home },
  { label: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
  { label: "CodeArena", path: "/codearena", icon: Code2 },
];

const ROLE_OPTIONS = [
  { label: "Student", value: "student" },
  { label: "Company / Employer", value: "company" },
  { label: "College", value: "college" },
  { label: "Training Institute", value: "training" },
];

export default function FeedNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [selectedRole, setSelectedRole] = useState(
    () => localStorage.getItem("preferredRole") || "student"
  );

  const navigate = useNavigate();
  const location = useLocation();

  const profileMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);

  let parsedUser = null;
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) parsedUser = JSON.parse(rawUser);
  } catch (err) {
    console.error("User parse error in navbar:", err);
  }

  const userName =
    parsedUser?.name || localStorage.getItem("userName") || "JobOrbit User";
  const userRole = String(
    parsedUser?.role ||
      parsedUser?.userType ||
      localStorage.getItem("userRole") ||
      selectedRole
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.path === "/codearena" && userRole !== "student") return false;
    return true;
  });

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setNotificationsOpen(false);
  };

  const fetchNotificationList = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const data = await getNotifications();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data?.data?.notifications)
        ? data.data.notifications
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setNotifications(list);
      const unread = list.filter((i) => !i.isRead && !i.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error loading notifications in navbar:", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const countResponse = await getUnreadCount();
      const rawCount =
        countResponse?.unreadCount ??
        countResponse?.count ??
        countResponse?.data?.unreadCount ??
        countResponse?.data?.count;

      if (rawCount !== undefined && Number.isFinite(Number(rawCount))) {
        setUnreadCount(Math.max(0, Number(rawCount)));
        return;
      }
      fetchNotificationList();
    } catch {
      fetchNotificationList();
    }
  }, [fetchNotificationList]);

  useEffect(() => {
    refreshUnreadCount();
    const handleUpdate = () => {
      refreshUnreadCount();
      if (notificationsOpen) fetchNotificationList();
    };

    window.addEventListener("notifications-updated", handleUpdate);
    return () => window.removeEventListener("notifications-updated", handleUpdate);
  }, [refreshUnreadCount, fetchNotificationList, notificationsOpen]);

  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  // Outside click listener for Profile & Notifications popovers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Lock scroll on mobile menu & listen for Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeMenus();
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleNotifications = () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    setProfileMenuOpen(false);
    if (next) {
      fetchNotificationList();
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setProcessingId(id);
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      console.error("Mark read error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    try {
      setProcessingId(id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      refreshUnreadCount();
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      console.error("Delete notification error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
    setNotificationsOpen(false);

    if (
      notif.jobId &&
      ["application_status", "application"].includes(notif.type)
    ) {
      navigate(`/jobs/${notif.jobId}`);
      return;
    }
    if (notif.postId) {
      navigate(`/feed?post=${encodeURIComponent(notif.postId)}`);
      return;
    }
    if (notif.senderId || notif.sender?.id) {
      navigate(`/profile/${notif.senderId || notif.sender.id}`);
    }
  };

 const handleLogout = () => {
  [
    "token",
    "accessToken",
    "user",
    "userName",
    "userRole",
    "role",
  ].forEach((key) => localStorage.removeItem(key));

  closeMenus();
  navigate("/login", { replace: true });
};
  const getDashboardPath = () => {
    switch (userRole) {
      case "company":
      case "employer":
        return "/company/dashboard";
      case "college":
        return "/college/dashboard";
      case "training":
      case "training_institute":
      case "training-institute":
        return "/training-institute/dashboard";
      case "admin":
      case "developer":
        return "/developer/dashboard";
      case "student":
      default:
        return "/student/dashboard";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart size={15} className="text-rose-400" />;
      case "comment":
        return <MessageCircle size={15} className="text-sky-400" />;
      case "follow":
        return <UserPlus size={15} className="text-emerald-400" />;
      case "share":
        return <Share2 size={15} className="text-indigo-400" />;
      case "application":
      case "application_status":
        return <Briefcase size={15} className="text-amber-400" />;
      default:
        return <Bell size={15} className="text-blue-400" />;
    }
  };

  return (
    <header className="jo-navbar">
      <div className="jo-navbar-inner">
        {/* Brand */}
        <Link to="/feed" className="jo-brand" onClick={closeMenus} aria-label="JobOrbit Home">
          <span className="jo-brand-icon">
            <BriefcaseBusiness size={23} strokeWidth={2.5} />
          </span>
          <span className="jo-brand-text">
            <span className="jo-brand-name">
              Job<span>Orbit</span>
            </span>
            <span className="jo-brand-tagline">Connect. Learn. Grow.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="jo-desktop-nav" aria-label="Main navigation">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `jo-nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="jo-navbar-actions">
          <NavLink
            to="/messages"
            className={({ isActive }) => `jo-icon-button ${isActive ? "active-icon" : ""}`}
            aria-label="Messages"
            title="Messages"
          >
            <MessageCircle size={21} />
          </NavLink>

          {/* IN-NAVBAR NOTIFICATIONS DROPDOWN */}
          <div className="relative" ref={notificationsMenuRef}>
            <button
              type="button"
              className={`jo-icon-button jo-notification-button ${
                notificationsOpen ? "active-icon bg-slate-800" : ""
              }`}
              onClick={toggleNotifications}
              aria-label="Toggle notifications dropdown"
              aria-expanded={notificationsOpen}
            >
              <Bell size={21} />
              {unreadCount > 0 && (
                <span className="jo-notification-badge" aria-label={`${unreadCount} unread`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="jo-dropdown-panel jo-notif-panel animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-600/20 px-2 py-0.5 text-[11px] font-bold text-blue-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List Body */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/50 jo-custom-scroll">
                  {loadingNotifications ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Loader2 size={24} className="animate-spin text-blue-500 mb-2" />
                      <span className="text-xs">Fetching updates...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Bell size={32} className="mx-auto mb-2 text-slate-600" />
                      <p className="text-sm font-medium text-slate-300">No notifications yet</p>
                      <p className="text-xs text-slate-500 mt-0.5">We'll notify you when something arrives.</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !n.isRead && !n.is_read;
                      const busy = processingId === n.id;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`group relative flex items-start gap-3 p-3.5 transition cursor-pointer hover:bg-slate-800/60 ${
                            isUnread ? "bg-blue-950/20" : ""
                          }`}
                        >
                          {/* Left Avatar / Icon */}
                          <div className="relative mt-0.5 shrink-0">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold text-xs">
                              {n.sender?.name ? n.sender.name.charAt(0).toUpperCase() : "J"}
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
                              {getIcon(n.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs leading-snug text-slate-300 line-clamp-2">
                              <strong className="text-white font-medium mr-1">
                                {n.sender?.name || "System"}
                              </strong>
                              {n.message || "sent an update on your profile."}
                            </p>
                            <span className="mt-1 block text-[10px] text-slate-500">
                              {n.createdAt
                                ? new Date(n.createdAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Just now"}
                            </span>
                          </div>

                          {/* Quick Actions (Hover) */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteItem(n.id, e)}
                              disabled={busy}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
                              title="Delete notification"
                            >
                              <Trash2 size={13} />
                            </button>
                            {isUnread && (
                              <span
                                className="h-2 w-2 rounded-full bg-blue-500 shrink-0"
                                title="Unread"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="jo-profile-wrapper" ref={profileMenuRef}>
            <button
              type="button"
              className="jo-profile-button"
              onClick={() => {
                setProfileMenuOpen((open) => !open);
                setNotificationsOpen(false);
              }}
              aria-expanded={profileMenuOpen}
              aria-label="Open profile menu"
            >
              <span className="jo-avatar">{userName.charAt(0).toUpperCase()}</span>
              <ChevronDown size={16} />
            </button>

            {profileMenuOpen && (
              <div className="jo-dropdown-panel jo-profile-panel animate-in fade-in zoom-in-95">
                <div className="jo-profile-heading">
                  <span className="jo-avatar jo-avatar-large">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{userName}</strong>
                    <span className="jo-role-label">{userRole.replace(/[_-]/g, " ")}</span>
                  </div>
                </div>

                <div className="jo-dropdown-divider" />

                <Link to="/profile" className="jo-dropdown-item" onClick={closeMenus}>
                  <UserRound size={17} />
                  My Profile
                </Link>

                <Link to={getDashboardPath()} className="jo-dropdown-item" onClick={closeMenus}>
                  <LayoutDashboard size={17} />
                  My Dashboard
                </Link>

                <Link to="/feed-settings" className="jo-dropdown-item" onClick={closeMenus}>
                  <Settings size={17} />
                  Settings
                </Link>

                <button
                  type="button"
                  className="jo-dropdown-item jo-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="jo-mobile-toggle"
            onClick={() => {
              setMobileMenuOpen((open) => !open);
              setNotificationsOpen(false);
              setProfileMenuOpen(false);
            }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="jo-mobile-overlay"
          aria-label="Close navigation menu"
          onClick={closeMenus}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`jo-mobile-drawer ${mobileMenuOpen ? "open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="jo-mobile-drawer-header">
          <div>
            <strong>Explore JobOrbit</strong>
            <p>Your career community</p>
          </div>
          <button type="button" className="jo-icon-button" onClick={closeMenus}>
            <X size={22} />
          </button>
        </div>

        <p className="jo-menu-section-title">MAIN MENU</p>
        <nav className="jo-mobile-nav">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenus}
                className={({ isActive }) => `jo-mobile-nav-link ${isActive ? "active" : ""}`}
              >
                <span className="jo-mobile-nav-icon">
                  <Icon size={20} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <p className="jo-menu-section-title">YOUR ACCOUNT</p>
        <nav className="jo-mobile-nav">
          <NavLink to={getDashboardPath()} className="jo-mobile-nav-link" onClick={closeMenus}>
            <span className="jo-mobile-nav-icon">
              <LayoutDashboard size={20} />
            </span>
            <span>My Dashboard</span>
          </NavLink>

          <NavLink to="/profile" className="jo-mobile-nav-link" onClick={closeMenus}>
            <span className="jo-mobile-nav-icon">
              <UserRound size={20} />
            </span>
            <span>My Profile</span>
          </NavLink>

          <NavLink to="/messages" className="jo-mobile-nav-link" onClick={closeMenus}>
            <span className="jo-mobile-nav-icon">
              <MessageCircle size={20} />
            </span>
            <span>Messages</span>
          </NavLink>
        </nav>

        <div className="jo-role-card">
          <div className="jo-role-card-title">
            <Users size={19} />
            <strong>Explore as</strong>
          </div>
          <p>Switch community view quickly without altering your core permissions.</p>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              localStorage.setItem("preferredRole", e.target.value);
            }}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="jo-mobile-logout" onClick={handleLogout}>
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <style>{`
        .jo-navbar {
          --jo-primary: #3b82f6;
          --jo-text: #f1f5f9;
          --jo-muted: #94a3b8;
          --jo-border: rgba(148, 163, 184, 0.15);
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(2, 6, 23, 0.95);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--jo-border);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
          color: var(--jo-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
        }

        .jo-navbar *, .jo-navbar *::before, .jo-navbar *::after {
          box-sizing: border-box;
        }

        .jo-navbar-inner {
          width: 100%;
          max-width: 1600px;
          min-height: 72px;
          margin: 0 auto;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .jo-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--jo-text);
        }

        .jo-brand-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          color: #fff;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .jo-brand-text { display: flex; flex-direction: column; }
        .jo-brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .jo-brand-name span { color: var(--jo-primary); }
        .jo-brand-tagline { color: var(--jo-muted); font-size: 10px; font-weight: 500; }

        .jo-desktop-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 20px;
        }

        .jo-nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 62px;
          padding: 8px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .jo-nav-link:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
        .jo-nav-link.active { color: var(--jo-primary); background: rgba(59, 130, 246, 0.12); }

        .jo-navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .jo-icon-button {
          position: relative;
          display: inline-grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .jo-icon-button:hover { color: #fff; background: #1e293b; }
        .jo-icon-button.active-icon { color: var(--jo-primary); background: rgba(59, 130, 246, 0.12); }

        .jo-notification-button { position: relative; }
        .jo-notification-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          display: inline-flex;
          min-width: 18px;
          height: 18px;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #020617;
          border-radius: 999px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }

        /* Dropdown panels */
        .jo-dropdown-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 1020;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 16px;
          background: #0f172a;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
        }

        .jo-notif-panel {
          width: 360px;
          max-width: calc(100vw - 20px);
          overflow: hidden;
        }

        .jo-profile-panel {
          width: 250px;
          padding: 8px;
        }

        .jo-profile-wrapper { position: relative; }
        .jo-profile-button {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 4px 6px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
        }
        .jo-profile-button:hover { background: #1e293b; color: #fff; }

        .jo-avatar {
          display: inline-grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
        }
        .jo-avatar-large { width: 42px; height: 42px; }

        .jo-profile-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
        }
        .jo-profile-heading div { display: flex; flex-direction: column; }
        .jo-profile-heading strong { color: var(--jo-text); font-size: 13px; }
        .jo-role-label { color: var(--jo-muted); font-size: 11px; text-transform: capitalize; }

        .jo-dropdown-divider { height: 1px; margin: 6px 0; background: rgba(148, 163, 184, 0.12); }

        .jo-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #cbd5e1;
          font-size: 13px;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .jo-dropdown-item:hover { background: #1e293b; color: #fff; }
        .jo-dropdown-item.jo-logout { color: #ef4444; }
        .jo-dropdown-item.jo-logout:hover { background: rgba(239, 68, 68, 0.12); }

        .jo-custom-scroll::-webkit-scrollbar { width: 5px; }
        .jo-custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .jo-custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

        .jo-mobile-toggle, .jo-mobile-overlay, .jo-mobile-drawer { display: none; }

        @media (max-width: 900px) {
          .jo-desktop-nav, .jo-profile-wrapper { display: none; }
          .jo-navbar-inner { min-height: 66px; padding: 10px 16px; }

          .jo-mobile-toggle {
            display: inline-grid;
            place-items: center;
            width: 40px;
            height: 40px;
            border: 1px solid var(--jo-border);
            border-radius: 10px;
            background: #0f172a;
            color: var(--jo-text);
            cursor: pointer;
          }

          .jo-mobile-overlay {
            position: fixed;
            inset: 0;
            z-index: 1001;
            display: block;
            border: 0;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(4px);
          }

          .jo-mobile-drawer {
            position: fixed;
            top: 0;
            right: 0;
            z-index: 1002;
            display: flex;
            flex-direction: column;
            width: min(340px, 85vw);
            height: 100dvh;
            overflow-y: auto;
            padding: 20px;
            background: #0f172a;
            box-shadow: -12px 0 40px rgba(0, 0, 0, 0.5);
            transform: translateX(105%);
            visibility: hidden;
            transition: transform 0.25s ease, visibility 0.25s ease;
          }

          .jo-mobile-drawer.open { transform: translateX(0); visibility: visible; }
          .jo-mobile-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }
          .jo-mobile-drawer-header strong { font-size: 17px; }
          .jo-mobile-drawer-header p { font-size: 12px; color: var(--jo-muted); margin: 2px 0 0; }

          .jo-menu-section-title {
            margin: 20px 0 8px;
            color: #64748b;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.2px;
          }

          .jo-mobile-nav { display: flex; flex-direction: column; gap: 4px; }
          .jo-mobile-nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 44px;
            padding: 8px 10px;
            border-radius: 10px;
            color: #cbd5e1;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
          }
          .jo-mobile-nav-link.active, .jo-mobile-nav-link:hover {
            background: rgba(59, 130, 246, 0.15);
            color: var(--jo-primary);
          }

          .jo-mobile-nav-icon {
            display: grid;
            place-items: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #1e293b;
            color: #94a3b8;
          }

          .jo-role-card {
            margin-top: 20px;
            padding: 14px;
            border: 1px solid rgba(59, 130, 246, 0.25);
            border-radius: 12px;
            background: rgba(59, 130, 246, 0.05);
          }
          .jo-role-card-title { display: flex; align-items: center; gap: 8px; color: #93c5fd; font-size: 13px; }
          .jo-role-card p { margin: 6px 0 10px; color: #94a3b8; font-size: 11px; line-height: 1.5; }
          .jo-role-card select {
            width: 100%;
            min-height: 38px;
            padding: 0 10px;
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            background: #0f172a;
            color: #e2e8f0;
            font-size: 12px;
            outline: none;
          }

          .jo-mobile-logout {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 42px;
            margin-top: 16px;
            border: 1px solid rgba(239, 68, 68, 0.25);
            border-radius: 10px;
            background: #0f172a;
            color: #ef4444;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }

          .jo-notif-panel {
            right: -55px;
          }
        }
      `}</style>
    </header>
  );
}