import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  BriefcaseBusiness,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock3,
  Banknote,
  Building2,
  CalendarDays,
  GraduationCap,
  Briefcase,
  Menu,
  X,
  Loader2,
  AlertCircle,
  Search,
  Bookmark,
  Share2,
  CheckCircle2,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function formatSalary(job) {
  const min = job?.salaryMin ?? job?.minSalary;
  const max = job?.salaryMax ?? job?.maxSalary;

  if (min == null && max == null) {
    return job?.salary || "Salary not specified";
  }

  const format = (value) =>
    Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  if (min != null && max != null) return `₹ ${format(min)} – ${format(max)}`;
  if (min != null) return `From ₹ ${format(min)}`;
  return `Up to ₹ ${format(max)}`;
}

function formatDate(value) {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getJobType(job) {
  return job?.jobType || job?.employmentType || job?.type || "Not specified";
}

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJob() {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/jobs/${id}`, {
          signal: controller.signal,
        });

        const payload = response.data;
        const jobData = payload?.job || payload?.data || payload;

        if (!jobData || !(jobData.id || jobData._id)) {
          throw new Error("Job details could not be found.");
        }

        setJob(jobData);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Job details error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load job details. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    if (id) loadJob();
    else {
      setError("Invalid job ID.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [id]);

  const companyName =
    job?.Company?.companyName ||
    job?.company?.companyName ||
    job?.companyName ||
    job?.company?.name ||
    "Hiring Company";

  const location = job?.location || job?.workLocation || "Location not specified";
  const jobType = getJobType(job);
  const salary = formatSalary(job);
  const jobId = job?.id || job?._id || id;
  const description = job?.description || "No job description has been provided yet.";
  const companyLocation =
    job?.Company?.location || job?.company?.location || job?.companyLocation;

  const handleApply = () => {
    if (!localStorage.getItem("token")) {
      navigate("/login", {
        state: { message: "Please log in to apply for this job." },
      });
      return;
    }
    navigate(`/jobs/${jobId}/apply`, { state: { job } });
  };

  const handleSave = () => {
    if (!localStorage.getItem("token")) {
      navigate("/login", {
        state: { message: "Please log in to save jobs." },
      });
      return;
    }

    let existing = [];
    try {
      const storedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      existing = Array.isArray(storedJobs) ? storedJobs : [];
    } catch {
      existing = [];
    }
    const next = saved
      ? existing.filter((item) => String(item.id) !== String(jobId))
      : [...existing.filter((item) => String(item.id) !== String(jobId)), {
          id: jobId,
          title: job?.title,
          companyName,
          location,
        }];

    localStorage.setItem("savedJobs", JSON.stringify(next));
    setSaved(!saved);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: job?.title || "Job on JobOrbit", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Share failed:", err);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let existing = [];
    try {
      const storedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      existing = Array.isArray(storedJobs) ? storedJobs : [];
    } catch {
      existing = [];
    }
    setSaved(existing.some((item) => String(item.id) === String(jobId)));
  }, [jobId]);

  const navLinks = [
    { label: "Feed", to: "/feed" },
    { label: "Dashboard", to: "/student" },
  ];

  return (
    <div className="min-h-screen bg-[#030817] text-slate-100">
      {/* Shared JobOrbit header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#060c1b]/95 shadow-sm backdrop-blur-xl">
        <nav className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
              <BriefcaseBusiness size={24} />
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight text-slate-100">
                Job<span className="text-blue-400">Orbit</span>
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.2em] text-slate-400">
                CAREER PLATFORM
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  item.label === "Jobs"
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-300 hover:bg-[#14213a] hover:text-blue-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
            <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            className="rounded-xl border border-slate-800 p-2.5 text-slate-200 transition hover:bg-[#14213a] lg:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-800 bg-[#060c1b] px-4 py-4 shadow-lg lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => { setMenuOpen(false); navigate(-1); }}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-[#14213a]"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-blue-400 transition hover:gap-3 hover:text-blue-300"
        >
          <ArrowLeft size={17} />
          Back to Jobs
        </button>

        {loading ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-slate-800 bg-[#101a2e] shadow-sm">
            <Loader2 size={36} className="animate-spin text-blue-400" />
            <p className="mt-4 font-semibold text-slate-300">Loading job details...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-[#101a2e] p-8 text-center shadow-sm sm:p-12">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertCircle size={28} />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-slate-100">
              Could not load this job
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/feed")}
                className="rounded-xl border border-slate-800 px-5 py-3 font-semibold text-slate-200 hover:bg-[#0d1629]"
              >
                Browse Jobs
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Job hero */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111d3b] via-[#0d172d] to-[#060c1b] p-6 text-white shadow-xl shadow-black/20 sm:p-9 lg:p-11">
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-4 -top-12 h-52 w-52 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-[#101a2e]/15 shadow-lg backdrop-blur">
                    <BriefcaseBusiness size={28} />
                  </div>
                  <p className="mb-2 text-sm font-semibold text-blue-100">
                    Job opportunity
                  </p>
                  <h1 className="max-w-3xl break-words text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    {job?.title || "Job title unavailable"}
                  </h1>
                  <div className="mt-4 flex items-center gap-2 text-blue-100">
                    <Building2 size={18} />
                    <span className="font-medium">{companyName}</span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#101a2e]/15 px-4 py-2 text-sm font-medium backdrop-blur">
                      <MapPin size={16} />
                      {location}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#101a2e]/15 px-4 py-2 text-sm font-medium backdrop-blur">
                      <Clock3 size={16} />
                      {jobType}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#101a2e]/15 px-4 py-2 text-sm font-medium backdrop-blur">
                      <Banknote size={16} />
                      {salary}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    aria-label={saved ? "Remove saved job" : "Save job"}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-[#101a2e]/10 px-3 text-sm font-semibold transition hover:bg-[#101a2e]/20"
                  >
                    <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">{saved ? "Saved" : "Save job"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share job"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-[#101a2e]/10 px-3 text-sm font-semibold transition hover:bg-[#101a2e]/20"
                  >
                    {copied ? <CheckCircle2 size={17} /> : <Share2 size={17} />}
                    <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Main details and overview */}
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="min-w-0 rounded-3xl border border-slate-800 bg-[#101a2e] p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Briefcase size={21} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-100">Job Description</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Learn more about the role and opportunity
                    </p>
                  </div>
                </div>

                <div className="mt-7 whitespace-pre-line break-words text-[15px] leading-8 text-slate-300">
                  {description}
                </div>

                {(job?.skills || job?.requiredSkills) && (
                  <div className="mt-8 border-t border-slate-800 pt-6">
                    <h3 className="font-bold text-slate-100">Skills and requirements</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(Array.isArray(job.skills || job.requiredSkills)
                        ? job.skills || job.requiredSkills
                        : String(job.skills || job.requiredSkills)
                            .split(",")
                            .map((item) => item.trim())
                      ).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 grid gap-4 border-t border-slate-800 pt-6 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                      <GraduationCap size={20} />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Experience</p>
                      <p className="mt-1 font-semibold text-slate-100">{job?.experience || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                      <CalendarDays size={20} />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Application deadline</p>
                      <p className="mt-1 font-semibold text-slate-100">
                        {formatDate(job?.applicationDeadline || job?.deadline)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#101a2e] shadow-sm">
                  <div className="border-b border-slate-800 bg-[#0d1629] p-6">
                    <h2 className="text-lg font-extrabold text-slate-100">Job Overview</h2>
                    <p className="mt-1 text-sm text-slate-400">Important details at a glance</p>
                  </div>

                  <div className="space-y-5 p-6">
                    <OverviewItem icon={Briefcase} label="Employment Type" value={jobType} />
                    <OverviewItem icon={MapPin} label="Location" value={location} />
                    <OverviewItem icon={Banknote} label="Salary Range" value={salary} />
                    <OverviewItem icon={Building2} label="Company" value={companyName} />
                    {companyLocation && (
                      <OverviewItem icon={MapPin} label="Company Location" value={companyLocation} />
                    )}
                    <OverviewItem
                      icon={CalendarDays}
                      label="Posted On"
                      value={formatDate(job?.createdAt || job?.postedAt)}
                    />

                    <button
                      type="button"
                      onClick={handleApply}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                    >
                      Apply Now
                      <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                    </button>

                    <p className="text-center text-xs leading-5 text-slate-400">
                      {localStorage.getItem("token")
                        ? "Review your details before submitting your application."
                        : "Please log in to submit your application."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10/70 p-4">
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-[#101a2e] p-2 text-blue-400 shadow-sm">
                      <Search size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-100">Keep exploring</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        Find more roles that match your interests and career goals.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/feed")}
                        className="mt-2 text-sm font-bold text-blue-400 hover:text-blue-900"
                      >
                        Browse more jobs →
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      <footer className="mt-10 border-t border-slate-800 bg-[#101a2e]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BriefcaseBusiness size={17} />
            </span>
            Job<span className="-ml-2 text-blue-400">Orbit</span>
          </Link>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} JobOrbit. Connecting talent with opportunity.
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold text-slate-300 hover:text-blue-400"
          >
            Back to Home
          </button>
        </div>
      </footer>
    </div>
  );
}

function OverviewItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 rounded-xl bg-[#14213a] p-2.5 text-slate-300">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
}

export default JobDetails;
