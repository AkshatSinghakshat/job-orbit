
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const getJobId = (job) => job.id ?? job._id;

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchJobs() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/jobs`);

      if (!response.ok) {
        throw new Error(`Jobs load nahi hui (${response.status})`);
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : data.jobs ?? data.data ?? [];

      if (!Array.isArray(list)) {
        throw new Error("API se jobs ka format sahi nahi mila.");
      }

      setJobs(list);
    } catch (err) {
      setError(
        `${err.message}. Backend server aur jobs API check karein.`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const city = location.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = String(job.title ?? job.jobTitle ?? "").toLowerCase();
      const company = String(
        job.companyName ?? job.company?.name ?? job.company ?? ""
      ).toLowerCase();
      const description = String(job.description ?? "").toLowerCase();
      const jobLocation = String(
        job.location ?? job.city ?? ""
      ).toLowerCase();
      const type = String(
        job.jobType ?? job.type ?? job.employmentType ?? ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        company.includes(query) ||
        description.includes(query);

      const matchesLocation = !city || jobLocation.includes(city);

      const matchesType =
        jobType === "All" ||
        type.replace(/[-_]/g, " ").includes(jobType.toLowerCase());

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [jobs, search, location, jobType]);

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("All");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-200">
            Your career starts here
          </p>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Find your dream job
          </h1>

          <p className="mt-4 max-w-2xl text-blue-100">
            Explore jobs, internships and new career opportunities with
            JobOrbit.
          </p>

          <div className="mt-8 grid gap-3 rounded-2xl bg-white p-3 shadow-xl md:grid-cols-[1fr_0.8fr_auto]">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
              <Search className="shrink-0 text-slate-400" size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, skill or company"
                className="w-full py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
              <MapPin className="shrink-0 text-slate-400" size={20} />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or location"
                className="w-full py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <button
              onClick={() => document.getElementById("job-results")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      <section id="job-results" className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Latest Opportunities</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading jobs..."
                : `${filteredJobs.length} jobs found`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-slate-500" />
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="All">All job types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
            </select>

            <button
              onClick={resetFilters}
              title="Reset filters"
              className="rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-100"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center text-slate-500 shadow-sm">
            Loading available jobs...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">Jobs load nahi ho pa rahi hain.</p>
            <p className="mt-2 text-sm">{error}</p>
            <button
              onClick={fetchJobs}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BriefcaseBusiness className="mx-auto text-slate-400" size={42} />
            <h3 className="mt-4 text-lg font-bold">No jobs found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Search ya filters change karke dobara try karein.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 font-semibold text-blue-600"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filteredJobs.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredJobs.map((job, index) => {
              const id = getJobId(job);
              const title = job.title ?? job.jobTitle ?? "Untitled Position";
              const company =
                job.companyName ??
                job.company?.name ??
                (typeof job.company === "string" ? job.company : "") ??
                "Company";
              const type =
                job.jobType ?? job.type ?? job.employmentType ?? "Job";
              const salary =
                job.salary ??
                job.salaryRange ??
                (job.salaryMin != null || job.salaryMax != null
                  ? `${job.salaryMin ?? ""} - ${job.salaryMax ?? ""}`
                  : "Not specified");
              const jobLocation = job.location ?? job.city ?? "Location not specified";

              return (
                <article
                  key={id ?? index}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <BriefcaseBusiness size={23} />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {type}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {company}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} /> {jobLocation}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} /> {salary}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                    {job.description || "Open the job details to learn more about this opportunity."}
                  </p>

                  {id != null ? (
                    <Link
                      to={`/jobs/${id}`}
                      className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Details <ArrowRight size={18} />
                    </Link>
                  ) : (
                    <p className="mt-4 text-xs text-amber-700">
                      Job ID missing; details link unavailable.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
