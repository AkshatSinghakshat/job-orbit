
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock3,
  UserCheck,
  Search,
  RefreshCw,
  BriefcaseBusiness,
  MapPin,
  Mail,
  Eye,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const STATUSES = [
  "All statuses",
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

const STATUS_OPTIONS = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function normalizeStatus(status = "") {
  const value = String(status).toLowerCase();

  if (value === "applied" || value === "pending") return "Applied";
  if (value === "shortlisted") return "Shortlisted";
  if (value === "interview") return "Interview";
  if (value === "selected") return "Selected";
  if (value === "rejected") return "Rejected";

  return status || "Applied";
}

function getStudent(application) {
  return (
    application.Student ||
    application.student ||
    application.Candidate ||
    application.candidate ||
    application.applicant ||
    application.user ||
    {}
  );
}

function getJobTitle(application) {
  return (
    application.Job?.title ||
    application.job?.title ||
    application.jobTitle ||
    application.job?.jobTitle ||
    "Job Application"
  );
}

function getStudentName(student) {
  return (
    student.fullName ||
    student.name ||
    student.studentName ||
    student.username ||
    "Candidate"
  );
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getSkills(student) {
  if (Array.isArray(student.skills)) return student.skills;

  if (typeof student.skills === "string") {
    return student.skills
      .split(/[,;\n]/)
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function requestJson(url, options = {}) {
  const token = getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function extractApplications(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.applications)) return data.applications;
  if (Array.isArray(data.data?.applications)) return data.data.applications;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.rows)) return data.rows;

  return [];
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const classes = {
    Applied: "status-applied",
    Shortlisted: "status-shortlisted",
    Interview: "status-interview",
    Selected: "status-selected",
    Rejected: "status-rejected",
  };

  return (
    <span className={`status-badge ${classes[normalized] || "status-applied"}`}>
      {normalized}
    </span>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="application-stat-card">
      <div className="application-stat-top">
        <span>{title}</span>
        <span className={`application-stat-icon ${color}`}>{icon}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export default function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [jobFilter, setJobFilter] = useState("All jobs");
  const [updatingId, setUpdatingId] = useState(null);

  const loadApplications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setPageError("");

      // Expected endpoint: GET /api/applications/company
      const data = await requestJson(`${API_URL}/api/applications/company`);
      setApplications(extractApplications(data));
    } catch (error) {
      setPageError(
        error.message ||
          "Applications load nahi ho paayi. Backend API check karein."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const jobs = useMemo(() => {
    return [
      ...new Set(applications.map(getJobTitle).filter(Boolean)),
    ];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const student = getStudent(application);
      const name = getStudentName(student);
      const email = student.email || student.emailAddress || "";
      const title = getJobTitle(application);
      const location =
        student.location || student.city || student.address || "";
      const skills = getSkills(student).join(" ");

      const matchesSearch =
        !query ||
        [name, email, title, location, skills].some((value) =>
          String(value).toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "All statuses" ||
        normalizeStatus(application.status) === statusFilter;

      const matchesJob =
        jobFilter === "All jobs" || title === jobFilter;

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [applications, search, statusFilter, jobFilter]);

  const counts = useMemo(() => {
    return {
      total: applications.length,
      applied: applications.filter(
        (item) => normalizeStatus(item.status) === "Applied"
      ).length,
      shortlisted: applications.filter(
        (item) => normalizeStatus(item.status) === "Shortlisted"
      ).length,
      selected: applications.filter(
        (item) => normalizeStatus(item.status) === "Selected"
      ).length,
    };
  }, [applications]);

  async function handleStatusChange(application, nextStatus) {
    const applicationId = application.id || application._id;

    if (!applicationId) {
      setPageError("Application ID missing hai. Status update nahi ho sakta.");
      return;
    }

    const previousStatus = application.status;

    setUpdatingId(applicationId);
    setPageError("");
    setSuccessMessage("");

    // Optimistically update the visible card.
    setApplications((current) =>
      current.map((item) =>
        String(item.id || item._id) === String(applicationId)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      // Expected endpoint: PATCH /api/applications/:id/status
      await requestJson(
        `${API_URL}/api/applications/${encodeURIComponent(applicationId)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus.toLowerCase() }),
        }
      );

      setSuccessMessage(`Application status changed to ${nextStatus}.`);
    } catch (error) {
      // Roll back the status if the server rejects the update.
      setApplications((current) =>
        current.map((item) =>
          String(item.id || item._id) === String(applicationId)
            ? { ...item, status: previousStatus }
            : item
        )
      );

      setPageError(error.message || "Status update nahi ho saka.");
    } finally {
      setUpdatingId(null);
    }
  }

  function openCandidateProfile(application) {
    const applicationId = application.id || application._id;

    if (!applicationId) {
      setPageError("Application ID nahi mila.");
      return;
    }

    navigate(`/company/candidates/${applicationId}`);
  }

  return (
    <div className="applications-page">
      <style>{`
        .applications-page {
          min-height: 100vh;
          padding: 30px 24px 50px;
          background: #071426;
          color: #edf4ff;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
        }
        .applications-page * { box-sizing: border-box; }
        .applications-container { max-width: 1200px; margin: 0 auto; }
        .applications-page-header {
          display: flex; justify-content: space-between; align-items: center;
          gap: 20px; margin-bottom: 24px;
        }
        .applications-eyebrow {
          color: #53a8ff; font-size: 11px; font-weight: 800;
          letter-spacing: 1.4px;
        }
        .applications-page h1 {
          margin: 7px 0; font-size: 29px; font-weight: 800;
          letter-spacing: -.7px;
        }
        .applications-subtitle { margin: 0; color: #91a8c8; font-size: 13px; }
        .applications-refresh {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 9px; padding: 12px 15px; border: 1px solid #31415a;
          border-radius: 12px; background: #0c1b30; color: white;
          font-size: 12px; font-weight: 700; cursor: pointer;
        }
        .applications-refresh:hover { background: #152741; }
        .applications-alert {
          margin: 18px 0; padding: 13px 15px; border-radius: 11px;
          font-size: 13px; line-height: 1.6;
        }
        .applications-success {
          border: 1px solid #087c62; background: #052a2b; color: #55f0c0;
        }
        .applications-error {
          border: 1px solid #843f4c; background: #301723; color: #ffb8c1;
        }
        .applications-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px; margin: 22px 0;
        }
        .application-stat-card {
          min-height: 96px; padding: 18px;
          border: 1px solid #22334a; border-radius: 15px; background: #0d1c31;
        }
        .application-stat-top {
          display: flex; justify-content: space-between; align-items: center;
          gap: 10px; color: #9ab0cf; font-size: 12px;
        }
        .application-stat-card > strong {
          display: block; margin-top: 12px; color: white;
          font-size: 26px; font-weight: 800;
        }
        .application-stat-icon {
          display: grid; place-items: center; width: 31px; height: 31px;
          border-radius: 9px; background: #132a47; color: #5ab5ff;
        }
        .stat-amber { color: #ffcb55; }
        .stat-violet { color: #c58aff; }
        .stat-green { color: #25e7b1; }
        .applications-filters {
          display: grid; grid-template-columns: 1.15fr 1fr 1fr;
          gap: 10px; padding: 15px; border: 1px solid #22334a;
          border-radius: 15px; background: #0d1c31;
        }
        .applications-search-wrap { position: relative; }
        .applications-search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: #7186a4;
        }
        .applications-input, .applications-select {
          width: 100%; min-height: 42px; padding: 10px 12px;
          border: 1px solid #35465f; border-radius: 10px;
          outline: none; background: #071426; color: #f4f7ff;
          font: inherit; font-size: 12px;
        }
        .applications-input { padding-left: 37px; }
        .applications-input:focus, .applications-select:focus {
          border-color: #4389ff; box-shadow: 0 0 0 3px #4389ff1a;
        }
        .applications-count { margin-top: 14px; color: #91a8c8; font-size: 12px; }
        .applications-list { display: grid; gap: 14px; margin-top: 20px; }
        .application-card {
          display: grid; grid-template-columns: minmax(0, 1fr) 235px;
          gap: 22px; padding: 20px; border: 1px solid #22334a;
          border-radius: 16px; background: #0d1c31;
        }
        .application-candidate { display: flex; gap: 14px; min-width: 0; }
        .application-avatar {
          display: grid; place-items: center; flex-shrink: 0;
          width: 49px; height: 49px; border-radius: 13px;
          background: #142f54; color: #9ac8ff; font-size: 16px; font-weight: 800;
        }
        .application-candidate-info { min-width: 0; }
        .application-candidate-info h2 {
          margin: 2px 0 7px; font-size: 15px; font-weight: 800;
          overflow-wrap: anywhere;
        }
        .application-meta {
          display: flex; flex-wrap: wrap; align-items: center;
          gap: 9px 16px; margin-bottom: 9px;
          color: #91a8c8; font-size: 12px;
        }
        .application-meta span { display: inline-flex; align-items: center; gap: 6px; }
        .application-job-title { color: #8cc5ff; }
        .application-skills { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
        .application-skill {
          padding: 5px 8px; border: 1px solid #263e5c; border-radius: 7px;
          background: #102540; color: #a9c7ed; font-size: 11px;
        }
        .application-date { color: #7289a9; font-size: 11px; }
        .application-actions { display: flex; flex-direction: column; gap: 10px; }
        .application-actions label { color: #91a8c8; font-size: 11px; }
        .status-badge {
          display: inline-flex; align-items: center; width: fit-content;
          padding: 5px 9px; border: 1px solid; border-radius: 20px;
          font-size: 11px; font-weight: 750;
        }
        .status-applied { border-color: #536c89; background: #162a42; color: #c0d3ee; }
        .status-shortlisted { border-color: #6742a8; background: #271943; color: #d5b4ff; }
        .status-interview { border-color: #916414; background: #332710; color: #ffdb77; }
        .status-selected { border-color: #087a60; background: #06332c; color: #61efbf; }
        .status-rejected { border-color: #8d3949; background: #381923; color: #ffabb7; }
        .application-view-button {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%; padding: 11px 12px;
          border: 1px solid #2867dc; border-radius: 10px;
          background: #1557d8; color: white; font-size: 12px;
          font-weight: 750; cursor: pointer; transition: background .15s;
        }
        .application-view-button:hover { background: #2672f6; }
        .application-view-button:disabled { opacity: .55; cursor: not-allowed; }
        .applications-empty {
          padding: 45px 20px; border: 1px dashed #35465f;
          border-radius: 15px; color: #91a8c8; text-align: center;
        }
        .applications-empty h2 { margin: 12px 0 6px; color: #e6efff; font-size: 17px; }
        .applications-empty p { margin: 0; font-size: 13px; }
        .applications-loading {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; min-height: 220px; color: #9bb4d5; font-size: 13px;
        }
        .applications-loading svg { animation: applications-spin 1s linear infinite; }
        @keyframes applications-spin { to { transform: rotate(360deg); } }
        @media (max-width: 850px) {
          .applications-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .application-card { grid-template-columns: 1fr; }
          .application-actions { max-width: none; }
        }
        @media (max-width: 600px) {
          .applications-page { padding: 22px 12px 35px; }
          .applications-page-header { align-items: flex-start; }
          .applications-page h1 { font-size: 25px; }
          .applications-refresh { padding: 10px; }
          .applications-filters { grid-template-columns: 1fr; }
          .application-card { padding: 15px; }
          .applications-stats { gap: 9px; }
          .application-stat-card { padding: 13px; }
          .application-stat-top { font-size: 11px; }
          .application-stat-card > strong { font-size: 23px; }
        }
      `}</style>

      <div className="applications-container">
        <header className="applications-page-header">
          <div>
            <span className="applications-eyebrow">COMPANY WORKSPACE</span>
            <h1>Applications</h1>
            <p className="applications-subtitle">
              Review candidates and manage their application status.
            </p>
          </div>

          <button
            type="button"
            className="applications-refresh"
            onClick={() => loadApplications(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw size={15} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {successMessage && (
          <div className="applications-alert applications-success">
            <CheckCircle2 size={16} style={{ display: "inline", marginRight: 7 }} />
            {successMessage}
          </div>
        )}

        {pageError && (
          <div className="applications-alert applications-error">
            <AlertCircle size={16} style={{ display: "inline", marginRight: 7 }} />
            {pageError}
          </div>
        )}

        <div className="applications-stats">
          <StatCard
            title="Total Applications"
            value={counts.total}
            icon={<Users size={18} />}
            color=""
          />
          <StatCard
            title="Awaiting Review"
            value={counts.applied}
            icon={<Clock3 size={18} />}
            color="stat-amber"
          />
          <StatCard
            title="Shortlisted"
            value={counts.shortlisted}
            icon={<UserCheck size={18} />}
            color="stat-violet"
          />
          <StatCard
            title="Selected"
            value={counts.selected}
            icon={<Users size={18} />}
            color="stat-green"
          />
        </div>

        <div className="applications-filters">
          <div className="applications-search-wrap">
            <Search className="applications-search-icon" size={16} />
            <input
              className="applications-input"
              type="search"
              placeholder="Search candidate, email, job..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search applications"
            />
          </div>

          <select
            className="applications-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="applications-select"
            value={jobFilter}
            onChange={(event) => setJobFilter(event.target.value)}
            aria-label="Filter by job"
          >
            <option value="All jobs">All jobs</option>
            {jobs.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>
        

        <div className="applications-count">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>

        {loading ? (
          <div className="applications-loading">
            <LoaderCircle size={24} />
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="applications-empty" style={{ marginTop: 20 }}>
            <Users size={34} style={{ margin: "0 auto" }} />
            <h2>No applications found</h2>
            <p>
              {applications.length === 0
                ? "Applications will appear here when students apply for your jobs."
                : "Try changing your search text or filters."}
            </p>
          </div>
        ) : (
          <div className="applications-list">
            {filteredApplications.map((application) => {
              const applicationId = application.id || application._id;
              const student = getStudent(application);
              const name = getStudentName(student);
              const email =
                student.email || student.emailAddress || "Email not provided";
              const location =
                student.location || student.city || student.address;
              const skills = getSkills(student);
              const status = normalizeStatus(application.status);
              const isUpdating =
                String(updatingId) === String(applicationId);

              return (
                <article
                  className="application-card"
                  key={applicationId}
                >
                  <div className="application-candidate">
                    <div className="application-avatar">
                      {getInitials(name)}
                    </div>

                    <div className="application-candidate-info">
                      <h2>{name}</h2>

                      <div className="application-meta">
                        <span>
                          <Mail size={14} />
                          {email}
                        </span>
                      </div>

                      <div className="application-meta">
                        <span className="application-job-title">
                          <BriefcaseBusiness size={14} />
                          {getJobTitle(application)}
                        </span>

                        {location && (
                          <span>
                            <MapPin size={14} />
                            {location}
                          </span>
                        )}
                      </div>

                      {skills.length > 0 && (
                        <div className="application-skills">
                          {skills.slice(0, 8).map((skill, index) => (
                            <span
                              className="application-skill"
                              key={`${skill}-${index}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="application-date">
                        Applied:{" "}
                        {formatDate(
                          application.createdAt || application.appliedAt
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="application-actions">
                    <StatusBadge status={status} />

                    <label htmlFor={`status-${applicationId}`}>
                      Update status
                    </label>

                    <select
                      id={`status-${applicationId}`}
                      className="applications-select"
                      value={status}
                      disabled={isUpdating}
                      onChange={(event) =>
                        handleStatusChange(application, event.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="application-view-button"
                      onClick={() => openCandidateProfile(application)}
                    >
                      <Eye size={16} />
                      View Student Profile
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
