import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Users,
  FileText,
  UserCheck,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Search,
  Bell,
  MapPin,
  MoreVertical,
  Edit,
  X,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const readToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken");

const CompanyDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const token = readToken();

      if (!token) {
        throw new Error("Login token nahi mila. Please dobara login karein.");
      }

      const response = await fetch(`${API_URL}/api/companies/dashboard`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Dashboard load nahi hua (${response.status})`
        );
      }

      setDashboard(data);
    } catch (err) {
      setError(err.message || "Dashboard load karne mein problem hui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Backend endpoints expected:
  // PATCH /api/jobs/:id
  // DELETE /api/jobs/:id
  const handleJobAction = async (job, action) => {
    const actionLabels = {
      close: "इस job को बंद",
      restart: "इस job को दोबारा चालू",
      delete: "इस job को स्थायी रूप से delete",
    };

    if (
      !window.confirm(
        `क्या आप सच में ${actionLabels[action]} करना चाहते हैं?`
      )
    ) {
      return;
    }

    try {
      const token = readToken();

      if (!token) {
        throw new Error("Please login again.");
      }

      setActionLoading(`${job.id}-${action}`);

      let response;

      if (action === "delete") {
        response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: action === "close" ? "closed" : "published",
          }),
        });
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Job action failed.");
      }

      await fetchDashboard();
    } catch (err) {
      window.alert(err.message || "Something went wrong.");
    } finally {
      setActionLoading(null);
    }
  };

  const company = dashboard?.company || {};
  const stats = dashboard?.stats || {};
  const jobs = dashboard?.recentJobs || [];
  const applications = dashboard?.recentApplications || [];

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return jobs;

    return jobs.filter((job) =>
      [job.title, job.location, job.jobType, job.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [jobs, search]);

  // Build candidate cards from actual applications.
  const candidates = useMemo(() => {
    const unique = new Map();

    applications.forEach((application) => {
      const student = application.Student || application.student;
      const user = student?.User || student?.user;

      if (!student) return;

      const id = student.id ?? user?.id;
      if (id == null || unique.has(String(id))) return;

      const skills = student.skills;
      const skillsText = Array.isArray(skills)
        ? skills.join(" • ")
        : typeof skills === "string"
          ? skills
          : "";

      unique.set(String(id), {
        id,
        name: user?.name || student.name || "Student",
        email: user?.email || "",
        skills: skillsText,
        applicationStatus: application.status || "applied",
      });
    });

    return Array.from(unique.values())
      .filter((candidate) =>
        `${candidate.name} ${candidate.email} ${candidate.skills}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      )
      .slice(0, 6);
  }, [applications, search]);

  const companyName =
    company.companyName || company.User?.name || "Company";

  const initials = companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const goTo = (path) => {
    window.location.href = path;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-800 bg-slate-900 lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">JobOrbit</h1>
            <p className="text-xs text-slate-400">Company Portal</p>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          <SidebarItem
            icon={<LayoutDashboard size={19} />}
            text="Dashboard"
            active
            onClick={() => goTo("/company/dashboard")}
          />
          <SidebarItem
            icon={<Building2 size={19} />}
            text="Company Profile"
            onClick={() => goTo("/company/profile")}
          />
          <SidebarItem
            icon={<BriefcaseBusiness size={19} />}
            text="My Jobs"
            onClick={() => goTo("/company/jobs")}
          />
          <SidebarItem
            icon={<Users size={19} />}
            text="Students"
            onClick={() => goTo("/company/students")}
          />
          <SidebarItem
            icon={<FileText size={19} />}
            text="Applications"
            onClick={() => goTo("/company/applications")}
          />
          <SidebarItem
            icon={<UserCheck size={19} />}
            text="Shortlisted"
            onClick={() => goTo("/company/shortlisted")}
          />
          <SidebarItem
            icon={<MessageSquare size={19} />}
            text="Messages"
            onClick={() => goTo("/messages")}
          />

          <div className="my-4 border-t border-slate-800" />

          <SidebarItem
            icon={<Settings size={19} />}
            text="Settings"
            onClick={() => goTo("/company/settings")}
          />
          <SidebarItem
            icon={<LogOut size={19} />}
            text="Logout"
            onClick={logout}
          />
        </nav>
      </aside>

      {/* MAIN */}
      <main className="lg:ml-64">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
          <div>
            <h2 className="text-xl font-bold">Company Dashboard</h2>
            <p className="text-sm text-slate-400">
              Manage your hiring and candidates
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => goTo("/")}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Home
            </button>

            <button
              onClick={() => goTo("/feed")}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold hover:bg-blue-700"
            >
              <MessageSquare size={17} />
              <span className="hidden sm:inline">Feed</span>
            </button>

            <button
              onClick={fetchDashboard}
              title="Refresh dashboard"
              className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={() => goTo("/company/settings")}
              title="Notifications and settings"
              className="relative rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300 hover:bg-slate-800"
            >
              <Bell size={19} />
            </button>

            <div className="hidden items-center gap-3 border-l border-slate-800 pl-4 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 font-semibold">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt="Company logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || "C"
                )}
              </div>
              <div className="max-w-36">
                <p className="truncate text-sm font-semibold">
                  {companyName}
                </p>
                <p className="text-xs text-slate-500">Recruiter</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* LOADING */}
          {loading && (
            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
              Dashboard data load ho raha hai...
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-900 bg-red-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="mt-0.5 shrink-0 text-red-400"
                  size={20}
                />
                <div>
                  <p className="font-semibold text-red-300">
                    Dashboard load nahi hua
                  </p>
                  <p className="mt-1 text-sm text-red-200">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchDashboard}
                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* WELCOME */}
          <div className="mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/60 to-slate-900 p-6 md:flex-row md:items-center">
            <div>
              <p className="mb-1 text-sm text-blue-400">Welcome back 👋</p>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Find your next great candidate
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {companyName} — post jobs and connect with talented students.
              </p>
            </div>
            <button
              onClick={() => goTo("/company/jobs/create")}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-700"
            >
              <Plus size={18} />
              Post a New Job
            </button>
          </div>

          {/* STATS */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs ?? 0}
              icon={<BriefcaseBusiness size={22} />}
            />
            <StatCard
              title="Applications"
              value={stats.totalApplications ?? 0}
              icon={<FileText size={22} />}
            />
            <StatCard
              title="Shortlisted"
              value={stats.shortlisted ?? 0}
              icon={<UserCheck size={22} />}
            />
            <StatCard
              title="Profile Views"
              value="—"
              subtitle="Tracking not configured"
              icon={<TrendingUp size={22} />}
            />
          </div>

          {/* JOBS + QUICK ACTIONS */}
          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 p-5">
                <div>
                  <h3 className="font-semibold">Recent Job Posts</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {stats.totalJobs ?? 0} total jobs in your account
                  </p>
                </div>
                <button
                  onClick={() => goTo("/company/jobs")}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-slate-800">
                {!loading && !error && filteredJobs.length === 0 && (
                  <EmptyState
                    text={
                      jobs.length === 0
                        ? "Abhi koi job post nahi hai."
                        : "Search se koi job match nahi hui."
                    }
                  />
                )}

                {filteredJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    title={job.title}
                    location={job.location || "Location not specified"}
                    applications={job.applicationCount ?? 0}
                    status={job.status}
                    actionLoading={actionLoading}
                    onAction={handleJobAction}
                    onClick={() => goTo(`/company/jobs/${job.id}/edit`)}
                  />
                ))}
              </div>
            </section>
                        <section className="rounded-2xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 p-5">
                <h3 className="font-semibold">Quick Actions</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Manage your recruitment
                </p>
              </div>

              <div className="space-y-3 p-5">
                <QuickAction
                  icon={<Plus size={19} />}
                  title="Post a Job"
                  description="Create a new job opening"
                  onClick={() => goTo("/company/jobs/create")}
                />

                <QuickAction
                  icon={<Users size={19} />}
                  title="Find Students"
                  description="Search candidates"
                  onClick={() => goTo("/company/students")}
                />

                <QuickAction
                  icon={<FileText size={19} />}
                  title="View Applications"
                  description="Review candidate applications"
                  onClick={() => goTo("/company/applications")}
                />

                <QuickAction
                  icon={<UserCheck size={19} />}
                  title="Shortlisted Students"
                  description="Manage shortlisted candidates"
                  onClick={() => goTo("/company/shortlisted")}
                />
              </div>
            </section>
          </div>

          {/* CANDIDATES FROM APPLICATIONS */}
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">
                  Candidates from Applications
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Students who have applied to your jobs
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
                <Search size={17} className="text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search jobs or students..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {!loading && !error && candidates.length === 0 && (
                <div className="md:col-span-2 xl:col-span-3">
                  <EmptyState text="Abhi koi matching applicant nahi mila." />
                </div>
              )}

              {candidates.map((candidate) => (
                <StudentCard
                  key={candidate.id}
                  name={candidate.name}
                  email={candidate.email}
                  skills={candidate.skills}
                  status={candidate.applicationStatus}
                  onClick={() => goTo("/company/applications")}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
      active
        ? "bg-blue-600 text-white"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`}
  >
    {icon}
    {text}
  </button>
);

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
    <div className="flex items-center justify-between">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
        {icon}
      </div>
      <span className="text-xs text-slate-500">
        {subtitle || "Live data"}
      </span>
    </div>

    <p className="mt-5 text-sm text-slate-400">{title}</p>
    <h3 className="mt-1 text-3xl font-bold">{value}</h3>
  </div>
);

const JobRow = ({
  job,
  title,
  location,
  applications,
  status,
  actionLoading,
  onAction,
  onClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPublished = String(status || "").toLowerCase() === "published";
  const busy = Boolean(
    actionLoading && actionLoading.startsWith(`${job?.id}-`)
  );

  return (
    <div className="flex flex-col gap-4 p-5 transition hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
          <BriefcaseBusiness size={20} />
        </div>

        <div className="min-w-0">
          <h4 className="font-semibold">{title || "Untitled Job"}</h4>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {location}
            </span>
            <span>{applications} Applications</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isPublished
              ? "bg-green-500/10 text-green-400"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {status || "unknown"}
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            title="Manage job"
            aria-label={`Manage ${title || "job"}`}
            aria-expanded={menuOpen}
            disabled={busy}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close job menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />

              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl">
                {/* UPDATE JOB */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onClick?.();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <Edit size={16} />
                  Update Job
                </button>

                <div className="my-1 border-t border-slate-800" />

                {/* CLOSE OR RESTART JOB */}
                {isPublished ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setMenuOpen(false);
                      onAction?.(job, "close");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-amber-300 hover:bg-slate-800 disabled:opacity-50"
                  >
                    <X size={16} />
                    Close Job
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setMenuOpen(false);
                      onAction?.(job, "restart");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-green-300 hover:bg-slate-800 disabled:opacity-50"
                  >
                    <RefreshCw size={16} />
                    Restart Job
                  </button>
                )}

                {/* DELETE JOB */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setMenuOpen(false);
                    onAction?.(job, "delete");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  <AlertCircle size={16} />
                  Delete Job
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-left transition hover:border-blue-500/40 hover:bg-slate-800"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
      {icon}
    </div>

    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </div>
  </button>
);

const StudentCard = ({ name, email, skills, status, onClick }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-blue-500/40">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0">
        <h4 className="truncate font-semibold">{name}</h4>
        <p className="truncate text-xs text-slate-500">
          {email || "Email not available"}
        </p>
      </div>
    </div>

    <p className="mt-4 min-h-5 text-xs leading-5 text-slate-400">
      {skills || "Skills not available"}
    </p>

    <p className="mt-2 text-xs text-slate-500">
      Application status: {status}
    </p>

    <button
      onClick={onClick}
      className="mt-4 w-full rounded-lg border border-slate-700 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-600 hover:text-white"
    >
      View Applications
    </button>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="p-8 text-center text-sm text-slate-500">{text}</div>
);

export default CompanyDashboard;