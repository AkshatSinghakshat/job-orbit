
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  Search,
  RefreshCw,
  FileText,
  MapPin,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const STATUSES = [
  "applied",
  "shortlisted",
  "interview",
  "selected",
  "rejected",
];

const statusColors = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-purple-100 text-purple-700",
  interview: "bg-amber-100 text-amber-700",
  selected: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken");

const getCandidateName = (app) =>
  app.fullName ||
  app.Student?.fullName ||
  app.Student?.name ||
  "Candidate";

const getCandidateEmail = (app) =>
  app.email ||
  app.Student?.email ||
  app.Student?.User?.email ||
  "Email not provided";

export default function CompanyApplicants() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Login token nahi mila. Dobara login karke try karein."
        );
      }

      const response = await axios.get(
        `${API_URL}/api/applications/company`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(response.data.applications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Applicants load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((app) => {
      const matchesStatus =
        filter === "all" || app.status === filter;

      const searchableText = [
        getCandidateName(app),
        getCandidateEmail(app),
        app.phone,
        app.city,
        app.Job?.title,
        app.qualification,
        app.college,
        app.skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!query || searchableText.includes(query))
      );
    });
  }, [applications, search, filter]);

  const counts = useMemo(() => {
    const result = { all: applications.length };

    for (const status of STATUSES) {
      result[status] = applications.filter(
        (app) => app.status === status
      ).length;
    }

    return result;
  }, [applications]);

  const updateStatus = async (applicationId, newStatus) => {
    const previousApplications = applications;

    setNotice("");
    setError("");
    setUpdatingId(applicationId);

    // Show the new status immediately.
    setApplications((current) =>
      current.map((app) =>
        app.id === applicationId
          ? { ...app, status: newStatus }
          : app
      )
    );

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      await axios.patch(
        `${API_URL}/api/applications/${applicationId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotice("Application status successfully updated.");
    } catch (err) {
      setApplications(previousApplications);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Status update failed."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openResume = (resume) => {
    if (!resume) return;

    const resumeUrl = /^https?:\/\//i.test(resume)
      ? resume
      : `${API_URL}/${resume.replace(/^\/+/, "")}`;

    window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              JOBORBIT / COMPANY
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Applicants Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review candidates and manage their application status.
            </p>
          </div>

          <button
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {notice}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Applicants", value: counts.all },
            { label: "Shortlisted", value: counts.shortlisted },
            { label: "Interviews", value: counts.interview },
            { label: "Selected", value: counts.selected },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500">{item.label}</p>
                <Users size={19} className="text-indigo-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, email, skills or job..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Applicants */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            Loading applicants...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Users className="mx-auto text-slate-300" size={42} />
            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              No applicants found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Applicants will appear here when candidates apply to your jobs.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <article
                key={app.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                      {getCandidateName(app).charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-bold text-slate-900">
                        {getCandidateName(app)}
                      </h2>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {getCandidateEmail(app)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                        {app.Job?.title && (
                          <span className="flex items-center gap-1.5">
                            <BriefcaseBusiness size={15} />
                            {app.Job.title}
                          </span>
                        )}

                        {app.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={15} />
                            {app.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[app.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {app.status}
                    </span>

                    <label className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-slate-600">
                        Update status
                      </span>

                      <select
                        value={app.status}
                        disabled={updatingId === app.id}
                        onChange={(e) =>
                          updateStatus(app.id, e.target.value)
                        }
                        className="max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">Qualification</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {app.qualification || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">College</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {app.college || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Applied on</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {app.skills && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-400">Skills</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                      {app.skills}
                    </p>
                  </div>
                )}

                {app.coverLetter && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-400">Cover Letter</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => openResume(app.resume)}
                    disabled={!app.resume}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FileText size={17} />
                    {app.resume ? "Open Resume" : "Resume not uploaded"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Showing {filteredApplications.length} of {applications.length} applications
        </p>
      </div>
    </div>
  );
}
