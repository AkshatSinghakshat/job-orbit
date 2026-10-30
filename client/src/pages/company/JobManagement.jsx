import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BriefcaseBusiness,
  RefreshCw,
  MapPin,
  FileText,
  Users,
  ArrowUpRight,
  LayoutDashboard,
  AlertCircle,
  X,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

const formatJobType = (type = "") =>
  type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function StatusBadge({ status }) {
  const styles = {
    published: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    draft: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    closed: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  const current = (status || "draft").toLowerCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[current] ||
        "border-slate-500/20 bg-slate-500/10 text-slate-400"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {current.charAt(0).toUpperCase() + current.slice(1)}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, description, accent }) {
  return (
    <div className="group rounded-2xl border border-[#243047] bg-[#10182e] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#354968]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accent}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Login token nahi mila. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/jobs/company/my-jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Jobs load nahi hui.");
      }

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      setError(err.message || "Server se connect nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const updateStatus = async (job, status) => {
    try {
      setBusyId(job.id);

      const token = getToken();

      if (!token) {
        throw new Error("Login token nahi mila. Please login again.");
      }

      const response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update nahi hua.");
      }

      setJobs((prev) =>
        prev.map((item) =>
          item.id === job.id
            ? { ...item, ...data.job, status }
            : item
        )
      );
    } catch (err) {
      alert(err.message);
      await loadJobs();
    } finally {
      setBusyId(null);
    }
  };

  const deleteJob = async (job) => {
    if (!window.confirm(`"${job.title}" ko delete karna hai?`)) {
      return;
    }

    try {
      setBusyId(job.id);

      const token = getToken();

      if (!token) {
        throw new Error("Login token nahi mila. Please login again.");
      }

      const response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Job delete nahi hui.");
      }

      setJobs((prev) => prev.filter((item) => item.id !== job.id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    `${job.title || ""} ${job.location || ""} ${job.jobType || ""}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  const totalJobs = jobs.length;

  const publishedJobs = jobs.filter(
    (job) => (job.status || "").toLowerCase() === "published"
  ).length;

  const totalApplications = jobs.reduce(
    (sum, job) =>
      sum + Number(job.applicationCount ?? job.Applications?.length ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#080d20] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
              <BriefcaseBusiness size={15} />
              Company Workspace
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Job Management
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage your job postings and hiring in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadJobs}
              disabled={loading}
              title="Refresh jobs"
              aria-label="Refresh jobs"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#293650] bg-[#10182e] px-4 text-sm font-semibold text-slate-300 transition hover:border-blue-500/50 hover:bg-[#17233b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/company/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#293650] bg-[#10182e] px-4 text-sm font-semibold text-slate-300 transition hover:border-blue-500/50 hover:text-blue-400"
            >
              <LayoutDashboard size={17} />
              Dashboard
            </Link>

            <Link
              to="/company/jobs/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <Plus size={18} />
              Create Job
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Jobs"
            value={totalJobs}
            icon={BriefcaseBusiness}
            description="All your job postings"
            accent="border-blue-500/20 bg-blue-500/10 text-blue-400"
          />

          <StatCard
            title="Published Jobs"
            value={publishedJobs}
            icon={CheckCircle2}
            description="Currently marked as published"
            accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          />

          <StatCard
            title="Applications"
            value={totalApplications}
            icon={Users}
            description="Applications across your job postings"
            accent="border-violet-500/20 bg-violet-500/10 text-violet-400"
          />
        </div>

        {/* Job List Container */}
        <div className="overflow-hidden rounded-2xl border border-[#243047] bg-[#10182e]">
          {/* Search and count */}
          <div className="flex flex-col gap-4 border-b border-[#243047] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-bold text-white">
                Your Job Postings
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Review and manage your opportunities.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-[#293650] bg-[#0b1224] px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 sm:w-80">
                <Search size={18} className="shrink-0 text-slate-500" />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs..."
                  aria-label="Search jobs by title, location or type"
                  className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="shrink-0 text-slate-500 transition hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <span className="whitespace-nowrap text-sm text-slate-400">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "job" : "jobs"}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-400"
                />
                <p className="text-sm text-red-300">{error}</p>
              </div>

              <button
                type="button"
                onClick={loadJobs}
                className="self-start text-sm font-semibold text-red-300 hover:text-white sm:self-center"
              >
                Try again
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-[#243047] bg-[#0b1224] text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Job</th>
                  <th className="px-4 py-4 font-semibold">Location</th>
                  <th className="px-4 py-4 font-semibold">Type</th>
                  <th className="px-4 py-4 font-semibold">Applications</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#243047]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <RefreshCw
                        size={25}
                        className="mx-auto mb-3 animate-spin text-blue-400"
                      />
                      <p className="text-sm text-slate-400">
                        Loading your jobs...
                      </p>
                    </td>
                  </tr>
                ) : !error && filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="transition hover:bg-[#151f36]"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-100">
                              {job.title || "Untitled Job"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Job ID: {job.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2 text-slate-300">
                          <MapPin
                            size={15}
                            className="shrink-0 text-slate-500"
                          />
                          <span>
                            {job.location || "Not specified"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <span className="inline-flex items-center rounded-lg border border-[#293650] bg-[#0b1224] px-2.5 py-1.5 text-xs font-medium text-slate-300">
                          {formatJobType(job.jobType || "Not specified")}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Users size={16} className="text-slate-500" />
                          {job.applicationCount ??
                            job.Applications?.length ??
                            0}
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex flex-col items-start gap-2">
                          <StatusBadge status={job.status} />

                          <select
                            aria-label={`Change status for ${job.title}`}
                            value={job.status || "draft"}
                            disabled={busyId === job.id}
                            onChange={(e) =>
                              updateStatus(job, e.target.value)
                            }
                            className="max-w-36 rounded-lg border border-[#293650] bg-[#0b1224] px-2.5 py-2 text-xs text-slate-300 outline-none transition focus:border-blue-500 disabled:opacity-50"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/company/jobs/${job.id}/edit`}
                            title="Edit job"
                            aria-label={`Edit ${job.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-blue-400 transition hover:border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-300"
                          >
                            <Pencil size={17} />
                          </Link>

                          <button
                            type="button"
                            disabled={busyId === job.id}
                            onClick={() => deleteJob(job)}
                            title="Delete job"
                            aria-label={`Delete ${job.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-red-400 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {busyId === job.id ? (
                              <RefreshCw
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#293650] bg-[#0b1224] text-slate-500">
                        {search ? (
                          <Search size={24} />
                        ) : (
                          <BriefcaseBusiness size={25} />
                        )}
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-white">
                        {search
                          ? "No matching jobs found"
                          : "No jobs created yet"}
                      </h3>

                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                        {search
                          ? "Try a different title, location or job type."
                          : "Create your first job posting to start finding the right candidates."}
                      </p>

                      {search ? (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="mt-4 text-sm font-semibold text-blue-400 hover:text-blue-300"
                        >
                          Clear search
                        </button>
                      ) : (
                        <Link
                          to="/company/jobs/create"
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                          <Plus size={17} />
                          Create Your First Job
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && !error && filteredJobs.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-[#243047] bg-[#0b1224] px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                Showing {filteredJobs.length} of {jobs.length} jobs
              </span>

              <span className="inline-flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-blue-400" />
                JobOrbit Employer Workspace
              </span>
            </div>
          )}
        </div>

        {/* Bottom Note */}
        <p className="mt-5 text-center text-xs text-slate-600">
          JobOrbit · Connecting talent with opportunity
        </p>
      </div>
    </div>
  );
}
