
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  BriefcaseBusiness,
  MapPin,
  CheckCircle,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const STATUS_LABELS = {
  shortlisted: "Shortlisted",
  interview: "Interview",
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

function getStudent(application) {
  return application?.Student || application?.student || {};
}

function getUser(application) {
  const student = getStudent(application);
  return student.User || student.user || {};
}

function getJob(application) {
  return application?.Job || application?.job || {};
}

export default function Shortlisted() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadApplications() {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/applications/company`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to load candidates.");
      }

      setApplications(
        Array.isArray(data.applications) ? data.applications : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const status = application.status;
      const user = getUser(application);
      const job = getJob(application);

      const isRelevant =
        status === "shortlisted" || status === "interview";

      const matchesFilter = filter === "all" || status === filter;

      const matchesSearch =
        !query ||
        String(user.name || "").toLowerCase().includes(query) ||
        String(user.email || "").toLowerCase().includes(query) ||
        String(job.title || "").toLowerCase().includes(query);

      return isRelevant && matchesFilter && matchesSearch;
    });
  }, [applications, search, filter]);

  async function updateStatus(applicationId, status) {
    setUpdatingId(applicationId);
    setError("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Status update failed.");
      }

      setApplications((previous) =>
        previous.map((application) =>
          String(application.id) === String(applicationId)
            ? {
                ...application,
                status: data.application?.status || status,
              }
            : application
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const shortlistedCount = applications.filter(
    (item) => item.status === "shortlisted"
  ).length;

  const interviewCount = applications.filter(
    (item) => item.status === "interview"
  ).length;

  return (
    <main className="min-h-screen bg-[#071426] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              COMPANY WORKSPACE
            </p>
            <h1 className="text-3xl font-bold">Shortlisted Candidates</h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage shortlisted applicants and candidates scheduled for interviews.
            </p>
          </div>

          <button
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Shortlisted"
            value={shortlistedCount}
            icon={<CheckCircle size={21} />}
          />
          <SummaryCard
            title="Interview"
            value={interviewCount}
            icon={<Users size={21} />}
          />
          <SummaryCard
            title="Total in Pipeline"
            value={shortlistedCount + interviewCount}
            icon={<BriefcaseBusiness size={21} />}
          />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-[#0d1b30] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by candidate, email or job..."
                className="w-full rounded-xl border border-slate-700 bg-[#071426] py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-[#071426] px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All shortlisted / interview</option>
              <option value="shortlisted">Shortlisted only</option>
              <option value="interview">Interview only</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0d1b30] p-10 text-center text-slate-400">
            Loading candidates...
          </div>
        ) : candidates.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0d1b30] p-12 text-center">
            <Users size={38} className="mx-auto mb-4 text-slate-500" />
            <h2 className="text-lg font-semibold">No candidates found</h2>
            <p className="mt-2 text-sm text-slate-400">
              Candidates will appear here after you shortlist them from Applications.
            </p>
          </div>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {candidates.map((application) => {
              const user = getUser(application);
              const job = getJob(application);

              return (
                <article
                  key={application.id}
                  className="rounded-2xl border border-slate-800 bg-[#0d1b30] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-lg font-bold text-blue-300">
                      {(user.name || "S").charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-lg font-semibold">
                        {user.name || "Student"}
                      </h2>

                      {user.email && (
                        <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-400">
                          <Mail size={14} />
                          {user.email}
                        </p>
                      )}

                      <p className="mt-3 flex items-center gap-2 text-sm text-blue-300">
                        <BriefcaseBusiness size={15} />
                        {job.title || "Job title unavailable"}
                      </p>

                      {job.location && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                          <MapPin size={14} />
                          {job.location}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                            application.status === "interview"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-purple-500/15 text-purple-300"
                          }`}
                        >
                          {STATUS_LABELS[application.status]}
                        </span>

                        <select
                          value={application.status}
                          disabled={updatingId === application.id}
                          onChange={(event) =>
                            updateStatus(application.id, event.target.value)
                          }
                          className="rounded-xl border border-slate-700 bg-[#071426] px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                          aria-label={`Update status for ${user.name || "candidate"}`}
                        >
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1b30] p-5">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-sm">{title}</span>
        <span className="text-blue-400">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
    </div>
  );
}
