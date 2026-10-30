import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
  CalendarDays,
  Phone,
  Mail,
  BookOpen,
  AlertCircle,
  LoaderCircle,
  Filter,
  FileText,
  Save,
} from "lucide-react";

import TrainingNavbar from "./TrainingNavbar";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  "Pending",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Accepted",
  "Rejected",
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 ring-blue-200",
  Shortlisted: "bg-violet-50 text-violet-700 ring-violet-200",
  Interview: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function normalizeStatus(status) {
  const value = String(status || "Pending").toLowerCase();

  if (value.includes("accept")) return "Accepted";
  if (value.includes("reject")) return "Rejected";
  if (value.includes("shortlist")) return "Shortlisted";
  if (value.includes("interview")) return "Interview";
  if (value.includes("review")) return "Under Review";

  return "Pending";
}

function normalizeApplication(item, index) {
  return {
    ...item,
    id: item.id ?? item.applicationId ?? item.application_id ?? index + 1,
    name:
      item.name ??
      item.fullName ??
      item.full_name ??
      item.studentName ??
      item.student_name ??
      item.applicant?.name ??
      "Unknown Applicant",
    email:
      item.email ??
      item.applicantEmail ??
      item.applicant_email ??
      item.applicant?.email ??
      "",
    phone:
      item.phone ??
      item.mobile ??
      item.phoneNumber ??
      item.phone_number ??
      "",
    course:
      item.course ??
      item.courseName ??
      item.course_name ??
      item.program ??
      item.trainingProgram ??
      "Not specified",
    education:
      item.education ??
      item.qualification ??
      item.highestQualification ??
      item.highest_qualification ??
      "Not specified",
    status: normalizeStatus(item.status ?? item.applicationStatus),
    appliedAt:
      item.appliedAt ??
      item.applied_at ??
      item.createdAt ??
      item.created_at ??
      "",
    notes: item.notes ?? item.remarks ?? "",
  };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function extractApplications(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.applications)) {
    return response.applications;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
        STATUS_STYLES[status] || STATUS_STYLES.Pending
      }`}
    >
      {status}
    </span>
  );
}

function ApplicationModal({
  application,
  onClose,
  onSave,
  saving,
}) {
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.notes || "");

  useEffect(() => {
    setStatus(application.status);
    setNotes(application.notes || "");
  }, [application]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-bold">Application Details</h2>
            <p className="mt-1 text-sm text-slate-300">
              Review applicant information and update status.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Users size={30} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-xl font-bold text-slate-900">
                {application.name}
              </h3>
              <p className="mt-1 break-all text-sm text-slate-500">
                Application ID: {application.id}
              </p>
              <div className="mt-2">
                <StatusBadge status={application.status} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={Mail}
              label="Email Address"
              value={application.email}
            />

            <InfoItem
              icon={Phone}
              label="Phone Number"
              value={application.phone}
            />

            <InfoItem
              icon={BookOpen}
              label="Applied Course"
              value={application.course}
            />

            <InfoItem
              icon={GraduationCap}
              label="Education"
              value={application.education}
            />

            <InfoItem
              icon={CalendarDays}
              label="Application Date"
              value={formatDate(application.appliedAt)}
            />
          </div>

          <div className="border-t border-slate-200 pt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Application Status
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Internal Notes / Remarks
            </label>

            <textarea
              rows={4}
              maxLength={2000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add remarks about the applicant..."
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {notes.length}/2000
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-white"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={() => onSave(application, status, notes)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={17} />
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default function ApplicationDetails() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await apiRequest("/application-details");
      const records = extractApplications(response);

      setApplications(records.map(normalizeApplication));
    } catch (err) {
      setError(
        err.message ||
          "Applications load nahi ho paayi. Backend API check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortOrder]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3500);

    return () => clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((app) =>
        ["Pending", "Under Review"].includes(app.status)
      ).length,
      shortlisted: applications.filter((app) =>
        ["Shortlisted", "Interview"].includes(app.status)
      ).length,
      accepted: applications.filter((app) => app.status === "Accepted")
        .length,
      rejected: applications.filter((app) => app.status === "Rejected")
        .length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    const records = applications.filter((app) => {
      const matchesSearch = [
        app.name,
        app.email,
        app.phone,
        app.course,
        app.education,
        app.id,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    records.sort((a, b) => {
      const dateA = new Date(a.appliedAt || 0).getTime() || 0;
      const dateB = new Date(b.appliedAt || 0).getTime() || 0;

      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return records;
  }, [applications, search, statusFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / PAGE_SIZE)
  );

  const visibleApplications = filteredApplications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleSave(application, status, notes) {
    setSaving(true);
    setError("");

    try {
      await apiRequest(
        `/application-details/${encodeURIComponent(application.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status, notes }),
        }
      );

      setApplications((previous) =>
        previous.map((item) =>
          String(item.id) === String(application.id)
            ? { ...item, status, notes }
            : item
        )
      );

      setSelectedApplication(null);
      setNotice("Application successfully updated.");
    } catch (err) {
      setError(
        err.message ||
          "Application update nahi hui. Backend endpoint check karein."
      );
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const headers = [
      "Application ID",
      "Name",
      "Email",
      "Phone",
      "Course",
      "Education",
      "Status",
      "Applied Date",
      "Notes",
    ];

    const rows = filteredApplications.map((app) => [
      app.id,
      app.name,
      app.email,
      app.phone,
      app.course,
      app.education,
      app.status,
      formatDate(app.appliedAt),
      app.notes,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "joborbit-application-details.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TrainingNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <GraduationCap size={19} />
              <span>Training Institute Portal</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Application Details
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage applicants, review course applications, update statuses,
              and export application records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={exportCSV}
              disabled={filteredApplications.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notice && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle size={19} />
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 shrink-0" size={19} />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 break-words">{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-rose-100"
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={FileText}
            color="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Pending / In Review"
            value={stats.pending}
            icon={Clock}
            color="bg-amber-100 text-amber-700"
          />

          <StatCard
            title="Shortlisted / Interview"
            value={stats.shortlisted}
            icon={Users}
            color="bg-violet-100 text-violet-700"
          />

          <StatCard
            title="Accepted Applications"
            value={stats.accepted}
            icon={CheckCircle}
            color="bg-emerald-100 text-emerald-700"
          />
        </section>

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_190px]">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone, course..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="All">All Statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
            <p className="text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredApplications.length}
              </span>{" "}
              matching applications
            </p>

            {(search || statusFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* Applications Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Applications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review and manage student applications.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              {stats.rejected} Rejected
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-8">
              <LoaderCircle
                size={36}
                className="animate-spin text-blue-600"
              />
              <p className="text-sm font-medium text-slate-500">
                Loading applications...
              </p>
            </div>
          ) : visibleApplications.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-500">
                <FileText size={32} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                No Applications Found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {applications.length === 0
                  ? "Abhi koi application available nahi hai, ya API se records nahi mile."
                  : "Your search or filters do not match any applications."}
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  fetchApplications();
                }}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Refresh Applications
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Applicant</th>
                      <th className="px-5 py-4 font-semibold">Course</th>
                      <th className="px-5 py-4 font-semibold">Applied Date</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                              {app.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {app.name}
                              </p>

                              <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                                {app.email || app.phone || "No contact details"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-800">
                            {app.course}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {app.education}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(app.appliedAt)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={app.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-900">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          JobOrbit Training Institute Portal · Application Management
        </p>
      </main>

      {selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => {
            if (!saving) setSelectedApplication(null);
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}