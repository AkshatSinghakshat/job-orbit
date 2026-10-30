import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  BookOpen,
  Search,
  Users,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock3,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

// Use VITE_API_URL in .env; local and deployed defaults are handled separately.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://joborbit-api.onrender.com/api")
).replace(/\/+$/, "");

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
const isLoggedIn = Boolean(token);

const user = JSON.parse(localStorage.getItem("user") || "{}");

const role = (
  localStorage.getItem("role") ||
  user.role ||
  user.userType ||
  "student"
).toLowerCase();

const dashboardPath =
  role === "company" || role === "employer"
    ? "/company/dashboard"
    : "/student/dashboard";

  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [trainingInstitutes, setTrainingInstitutes] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingTraining, setLoadingTraining] = useState(true);

  const [jobsError, setJobsError] = useState("");
  const [companiesError, setCompaniesError] = useState("");
  const [trainingError, setTrainingError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ========================================
  // GET LIVE JOBS
  // ========================================

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setJobsError("");

      const response = await axios.get(
        `${API_URL}/jobs`,
        {
          timeout: 10000,
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setJobs(data);
      } else if (Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else if (Array.isArray(data.data)) {
        setJobs(data.data);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Fetch Jobs Error:", error);

      setJobs([]);
      setJobsError(
        error.response?.data?.message ||
          (error.response
            ? `Jobs API failed (HTTP ${error.response.status}). Check the backend route.`
            : "Cannot reach the backend. Check VITE_API_URL, backend status, and CORS.")
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  // ========================================
  // GET LIVE COMPANIES
  // ========================================

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      setCompaniesError("");

      const response = await axios.get(
        `${API_URL}/companies`,
        {
          timeout: 10000,
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setCompanies(data);
      } else if (Array.isArray(data.companies)) {
        setCompanies(data.companies);
      } else if (Array.isArray(data.data)) {
        setCompanies(data.data);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error(
        "Fetch Companies Error:",
        error
      );

      setCompanies([]);
      setCompaniesError(
        error.response?.data?.message ||
          (error.response
            ? `Companies API failed (HTTP ${error.response.status}). Check the backend route.`
            : "Cannot reach the backend. Check VITE_API_URL, backend status, and CORS.")
      );
    } finally {
      setLoadingCompanies(false);
    }
  };

  // ========================================
  // GET LIVE TRAINING INSTITUTES
  // ========================================

  const fetchTrainingInstitutes = async () => {
    try {
      setLoadingTraining(true);
      setTrainingError("");

      const response = await axios.get(
        `${API_URL}/training`,
        {
          timeout: 10000,
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setTrainingInstitutes(data);
      } else if (
        Array.isArray(data.training)
      ) {
        setTrainingInstitutes(data.training);
      } else if (
        Array.isArray(data.institutes)
      ) {
        setTrainingInstitutes(data.institutes);
      } else if (Array.isArray(data.data)) {
        setTrainingInstitutes(data.data);
      } else {
        setTrainingInstitutes([]);
      }
    } catch (error) {
      console.error(
        "Fetch Training Error:",
        error
      );

      setTrainingInstitutes([]);
      setTrainingError(
        error.response?.data?.message ||
          (error.response
            ? `Training API failed (HTTP ${error.response.status}). Check the backend route.`
            : "Cannot reach the backend. Check VITE_API_URL, backend status, and CORS.")
      );
    } finally {
      setLoadingTraining(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchTrainingInstitutes();
  }, []);

  // ========================================
  // SEARCH
  // ========================================

  const handleSearch = async () => {
    const cleanKeyword = keyword.trim();
    const cleanLocation = location.trim();

    if (!cleanKeyword && !cleanLocation) {
      await fetchJobs();
      return;
    }

    try {
      setSearching(true);
      setJobsError("");

      const response = await axios.get(
        `${API_URL}/jobs`,
        {
          params: {
            keyword: cleanKeyword || undefined,
            location:
              cleanLocation || undefined,
          },
          timeout: 10000,
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setJobs(data);
      } else if (Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else if (Array.isArray(data.data)) {
        setJobs(data.data);
      } else {
        setJobs([]);
      }

      document
        .getElementById("jobs")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    } catch (error) {
      console.error(
        "Job Search Error:",
        error
      );

      setJobsError(
        error.response?.data?.message ||
          (error.response
            ? `Job search failed (HTTP ${error.response.status}).`
            : "Cannot reach the backend. Check VITE_API_URL, backend status, and CORS.")
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ========================================
  // LIVE STATS
  // ========================================

  const stats = useMemo(
    () => [
      {
        label: "Live Jobs",
        value: jobs.length,
        icon: BriefcaseBusiness,
      },
      {
        label: "Companies",
        value: companies.length,
        icon: Building2,
      },
      {
        label: "Training Institutes",
        value: trainingInstitutes.length,
        icon: BookOpen,
      },
    ],
    [jobs, companies, trainingInstitutes]
  );

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-6 md:py-4">

          {/* Logo */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 bg-blue-600 shadow-lg shadow-blue-600/30 transition duration-300 group-hover:scale-105">
              <BriefcaseBusiness size={22} />

              <span className="absolute inset-0 animate-ping rounded-xl bg-blue-500/20" />
            </div>

            <div className="text-left">
              <div className="text-lg font-bold sm:text-xl">
                JobOrbit
              </div>

              <div className="text-[9px] uppercase tracking-[0.28em] text-slate-500">
                Career Platform
              </div>
            </div>
          </button>

          {/* Navigation */}

          <nav className="hidden items-center gap-5 lg:gap-8 md:flex">
            <a
              href="#jobs"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Find Jobs
            </a>

            <a
              href="#companies"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Companies
            </a>

            <a
              href="#training"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Training
            </a>

            <a
              href="#features"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Features
            </a>
          </nav>

  {/* Desktop auth actions */}
<div className="hidden items-center gap-2 sm:flex">
  {isLoggedIn ? (
    <>
      <button
        type="button"
        onClick={() => navigate("/feed")}
        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        Feed
      </button>

      <button
        type="button"
        onClick={() => navigate(dashboardPath)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
      >
        Dashboard
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        Login
      </button>

      <button
        type="button"
        onClick={() => navigate("/register")}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
      >
        Get Started
      </button>
    </>
  )}
</div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 px-4 pb-4 pt-3 shadow-xl md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {[
                ["Find Jobs", "#jobs"],
                ["Companies", "#companies"],
                ["Training", "#training"],
                ["Features", "#features"],
              ].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
                  {label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                {isLoggedIn ? (
                  <>
                    <button type="button" onClick={() => { setMobileMenuOpen(false); navigate("/feed"); }} className="min-h-11 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200">Feed</button>
                    <button type="button" onClick={() => { setMobileMenuOpen(false); navigate(dashboardPath); }} className="min-h-11 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Dashboard</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="min-h-11 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200">Login</button>
                    <button type="button" onClick={() => { setMobileMenuOpen(false); navigate("/register"); }} className="min-h-11 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Get Started</button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <main>

        <section className="relative overflow-hidden">

          {/* Animated background */}

          <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 animate-pulse rounded-full bg-blue-600/20 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="pointer-events-none absolute left-1/2 top-0 h-[550px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

          {/* Grid */}

          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-5 sm:pb-20 sm:pt-16 md:px-6 md:pb-32 md:pt-28">

            <div className="mx-auto max-w-5xl text-center">

              {/* Badge */}

              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs sm:mb-7 sm:px-4 sm:text-sm text-blue-300 shadow-lg shadow-blue-600/5">
                <Sparkles
                  size={15}
                  className="animate-pulse"
                />

                <span>
                  One ecosystem for your career
                </span>
              </div>

              {/* Heading */}

              <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-8xl">

                Build your future.

                <br />

                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  Find your orbit.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl px-1 text-sm leading-6 text-slate-400 sm:mt-8 sm:text-base sm:leading-7 md:text-lg">
                Discover opportunities, connect with companies,
                collaborate with colleges and build career-ready
                skills through one connected platform.
              </p>

              {/* Search */}

              <div className="mx-auto mt-7 w-full max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl sm:mt-10">

                <div className="flex flex-col gap-2 md:flex-row">

                  {/* Keyword */}

                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-900/90 px-3 py-3.5 sm:px-4">
                    <Search
                      size={20}
                      className="shrink-0 text-blue-400"
                    />

                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) =>
                        setKeyword(e.target.value)
                      }
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Job title, skills or keywords"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>

                  {/* Location */}

                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-900/90 px-3 py-3.5 sm:px-4">
                    <MapPin
                      size={20}
                      className="shrink-0 text-cyan-400"
                    />

                    <input
                      type="text"
                      value={location}
                      onChange={(e) =>
                        setLocation(e.target.value)
                      }
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Location"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>

                  {/* Search Button */}

                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold sm:w-auto sm:px-7 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {searching ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Searching
                      </>
                    ) : (
                      <>
                        Search Jobs
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600">
                Search results are loaded from the JobOrbit
                backend.
              </p>

            </div>

            {/* Floating visual cards */}

            <div className="pointer-events-none relative mx-auto mt-16 hidden max-w-5xl lg:block">

              <FloatingCard
                className="absolute left-0 top-0 -rotate-3"
                icon={BriefcaseBusiness}
                title="Job discovery"
                text="Live opportunities"
              />

              <FloatingCard
                className="absolute right-0 top-5 rotate-3"
                icon={GraduationCap}
                title="Career growth"
                text="Skills & training"
              />

              <div className="mx-auto h-20 max-w-xl rounded-full border border-blue-500/10 bg-blue-500/5 blur-2xl" />
            </div>

          </div>
        </section>

        {/* =====================================================
            LIVE STATS
        ====================================================== */}

        <section className="border-y border-white/10 bg-slate-900/50">

          <div className="mx-auto grid max-w-7xl grid-cols-3 gap-1 px-2 py-3 sm:px-5 sm:py-6 md:px-6">

            {stats.map((stat) => (
              <LiveStat
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
              />
            ))}

          </div>
        </section>

        {/* =====================================================
            JOBS
        ====================================================== */}

        <section
          id="jobs"
          className="scroll-mt-20 mx-auto max-w-7xl px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24"
        >

          <SectionHeading
            eyebrow="Live opportunities"
            title="Latest jobs"
            description="Explore opportunities currently available through the JobOrbit platform."
          />

          {loadingJobs ? (
            <LoadingState text="Loading live jobs..." />
          ) : jobsError ? (
            <ErrorState
              message={jobsError}
              onRetry={fetchJobs}
            />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No jobs available yet"
              text="Once companies publish jobs, they will appear here automatically."
            />
          ) : (
            <div className="mt-7 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.slice(0, 6).map((job) => (
                <JobCard
  key={job.id || job._id}
  job={job}
  onClick={() => navigate(`/jobs/${job.id || job._id}`)}
/>
              ))}
            </div>
          )}

        </section>

        {/* =====================================================
            COMPANIES
        ====================================================== */}

        <section
          id="companies"
          className="scroll-mt-24 border-y border-white/10 bg-slate-900/40"
        >

          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24">

            <SectionHeading
              eyebrow="Employer ecosystem"
              title="Companies on JobOrbit"
              description="Companies registered on the platform can build teams and discover talent."
            />

            {loadingCompanies ? (
              <LoadingState text="Loading companies..." />
            ) : companiesError ? (
              <ErrorState
                message={companiesError}
                onRetry={fetchCompanies}
              />
            ) : companies.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No companies available yet"
                text="Registered companies will appear here automatically."
              />
            ) : (
              <div className="mt-7 grid gap-4 sm:mt-10 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">

                {companies
                  .slice(0, 8)
                  .map((company) => (
                    <CompanyCard
                      key={
                        company.id ||
                        company._id
                      }
                      company={company}
                    />
                  ))}

              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            TRAINING
        ====================================================== */}

        <section
          id="training"
          className="scroll-mt-20 mx-auto max-w-7xl px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24"
        >

          <SectionHeading
            eyebrow="Learn & grow"
            title="Training ecosystem"
            description="Training institutes can showcase programs and help learners become career ready."
          />

          {loadingTraining ? (
            <LoadingState text="Loading training institutes..." />
          ) : trainingError ? (
            <ErrorState
              message={trainingError}
              onRetry={fetchTrainingInstitutes}
            />
          ) : trainingInstitutes.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No training institutes available yet"
              text="Training institutes will appear here after registration."
            />
          ) : (
            <div className="mt-7 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">

              {trainingInstitutes
                .slice(0, 6)
                .map((institute) => (
                  <TrainingCard
                    key={
                      institute.id ||
                      institute._id
                    }
                    institute={institute}
                  />
                ))}

            </div>
          )}

        </section>

        {/* =====================================================
            FEATURES
        ====================================================== */}

        <section
          id="features"
          className="border-y border-white/10 bg-slate-900/40"
        >

          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24">

            <SectionHeading
              eyebrow="The JobOrbit ecosystem"
              title="Everything connected in one place"
              description="Different users, different goals, one connected career platform."
            />

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <FeatureCard
                icon={GraduationCap}
                title="Students"
                text="Discover jobs, internships and career-building opportunities."
                onClick={() =>
                  navigate("/register/student")
                }
              />

              <FeatureCard
                icon={Building2}
                title="Colleges"
                text="Connect students with employers and career opportunities."
                onClick={() =>
                  navigate("/register/college")
                }
              />

              <FeatureCard
                icon={BriefcaseBusiness}
                title="Companies"
                text="Build your hiring pipeline and discover relevant candidates."
                onClick={() =>
                  navigate("/register/company")
                }
              />

              <FeatureCard
                icon={BookOpen}
                title="Training Institutes"
                text="Offer programs and help learners develop industry-ready skills."
                onClick={() =>
                  navigate("/register/training")
                }
              />

            </div>

          </div>
        </section>

        {/* =====================================================
            WHY JOBORBIT
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-5 sm:py-20 md:px-6 md:py-24">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Why JobOrbit
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                A connected career journey.
              </h2>

              <p className="mt-6 leading-7 text-slate-400">
                JobOrbit brings opportunity discovery, hiring,
                education and training together so every part of
                the career ecosystem can work together.
              </p>

              <div className="mt-8 space-y-5">

                <WhyItem
                  icon={Search}
                  title="Discover"
                  text="Find opportunities from live platform data."
                />

                <WhyItem
                  icon={Users}
                  title="Connect"
                  text="Bring students, colleges and organizations together."
                />

                <WhyItem
                  icon={ShieldCheck}
                  title="Secure"
                  text="Role-based authentication keeps platform access controlled."
                />

              </div>

            </div>

            <div className="relative">

              <div className="absolute -inset-8 rounded-full bg-blue-600/10 blur-3xl" />

              <div className="relative rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl">

                <div className="flex items-center justify-between border-b border-white/10 pb-5">

                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      JobOrbit
                    </p>

                    <h3 className="mt-1 text-2xl font-bold">
                      Career ecosystem
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                    <Sparkles size={21} />
                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  <DashboardItem
                    icon={GraduationCap}
                    title="Student"
                    text="Discover opportunities"
                  />

                  <DashboardItem
                    icon={BriefcaseBusiness}
                    title="Company"
                    text="Discover talent"
                  />

                  <DashboardItem
                    icon={Building2}
                    title="College"
                    text="Connect students"
                  />

                  <DashboardItem
                    icon={BookOpen}
                    title="Training"
                    text="Build career-ready skills"
                  />

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            CTA
        ====================================================== */}

        <section className="px-4 pb-14 sm:px-5 sm:pb-20 md:px-6 md:pb-24">

          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-6 text-center shadow-2xl sm:p-10 md:p-16">

            <div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative">

              <Sparkles
                className="mx-auto text-blue-400"
                size={31}
              />

              <h2 className="mt-5 text-3xl font-black sm:text-4xl md:text-5xl">
                Ready to enter your orbit?
              </h2>

              <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
                Create your JobOrbit account and start building
                your next opportunity.
              </p>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-500"
              >
                Create Account
                <ArrowRight size={18} />
              </button>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">

          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={17} />

            <span>
              © {new Date().getFullYear()} JobOrbit
            </span>
          </div>

          <div className="flex flex-wrap gap-6">

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="transition hover:text-white"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="transition hover:text-white"
            >
              Register
            </button>

            <a
              href="#jobs"
              className="transition hover:text-white"
            >
              Jobs
            </a>

            <a
              href="#companies"
              className="transition hover:text-white"
            >
              Companies
            </a>

          </div>

        </div>

      </footer>

    </div>
  );
}

// ==========================================================
// SECTION HEADING
// ==========================================================

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="max-w-2xl">

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
        {description}
      </p>

    </div>
  );
}

// ==========================================================
// LIVE STAT
// ==========================================================

function LiveStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-2 border-r border-white/10 px-1 py-3 text-center last:border-r-0 sm:flex-row sm:gap-4 sm:py-5 sm:text-left">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
        <Icon size={21} />
      </div>

      <div>
        <p className="text-xl font-black sm:text-2xl">
          {value}
        </p>

        <p className="text-[10px] leading-4 text-slate-500 sm:text-xs">
          {label}
        </p>
      </div>

    </div>
  );
}

// ==========================================================
// JOB CARD
// ==========================================================

function JobCard({
  job,
  onClick,
}) {
  const title =
    job.title ||
    job.jobTitle ||
    job.position ||
    "Untitled position";

  const company =
    job.companyName ||
    job.company?.name ||
    job.company ||
    "Company";

  const jobLocation =
    job.location ||
    job.city ||
    "Location not specified";

  const type =
    job.jobType ||
    job.type ||
    job.employmentType ||
    "Opportunity";

  return (
    <div className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-blue-500/[0.04]">

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
          <BriefcaseBusiness size={21} />
        </div>

        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
          {type}
        </span>

      </div>

      <h3 className="mt-5 break-words text-base font-bold sm:text-lg">
        {title}
      </h3>

      <p className="mt-2 break-words text-sm text-blue-400">
        {company}
      </p>

      <div className="mt-5 space-y-2 text-sm text-slate-500">

        <div className="flex items-center gap-2">
          <MapPin size={15} />
          {jobLocation}
        </div>

        {job.createdAt && (
          <div className="flex items-center gap-2">
            <Clock3 size={15} />
            {formatDate(job.createdAt)}
          </div>
        )}

      </div>

      <button
        type="button"
        onClick={onClick}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-semibold transition hover:border-blue-500/40 hover:bg-blue-600/10 hover:text-blue-300"
      >
        View Opportunity
        <ChevronRight size={16} />
      </button>

    </div>
  );
}

// ==========================================================
// COMPANY CARD
// ==========================================================

function CompanyCard({
  company,
}) {
  const name =
    company.name ||
    company.companyName ||
    company.user?.name ||
    "Company";

  const industry =
    company.industry ||
    "Industry not specified";

  const location =
    company.location ||
    "Location not specified";

  return (
    <div className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 transition group-hover:bg-blue-600 group-hover:text-white">
        <Building2 size={22} />
      </div>

      <h3 className="mt-5 break-words text-base font-bold sm:text-lg">
        {name}
      </h3>

      <p className="mt-2 break-words text-sm text-slate-400">
        {industry}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <MapPin size={14} />
        {location}
      </div>

    </div>
  );
}

// ==========================================================
// TRAINING CARD
// ==========================================================

function TrainingCard({
  institute,
}) {
  const name =
    institute.name ||
    institute.instituteName ||
    institute.trainingInstituteName ||
    institute.user?.name ||
    "Training Institute";

  const address =
    institute.address ||
    "Location not specified";

  const categories =
    institute.categories ||
    "Training programs";

  return (
    <div className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
        <BookOpen size={22} />
      </div>

      <h3 className="mt-5 break-words text-base font-bold sm:text-lg">
        {name}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm text-slate-400">
        {categories}
      </p>

      <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
        <MapPin
          size={14}
          className="mt-0.5 shrink-0"
        />
        {address}
      </div>

    </div>
  );
}

// ==========================================================
// FEATURE CARD
// ==========================================================

function FeatureCard({
  icon: Icon,
  title,
  text,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 text-left transition duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:bg-blue-500/[0.04]"
    >

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 transition duration-300 group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={22} />
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-400">
        Get started
        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
        />
      </div>

    </button>
  );
}

// ==========================================================
// WHY ITEM
// ==========================================================

function WhyItem({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
        <Icon size={19} />
      </div>

      <div>
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {text}
        </p>
      </div>

    </div>
  );
}

// ==========================================================
// DASHBOARD ITEM
// ==========================================================

function DashboardItem({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-blue-500/20 hover:bg-blue-500/[0.04]">

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
        <Icon size={19} />
      </div>

      <div className="flex-1">
        <p className="font-semibold">
          {title}
        </p>

        <p className="text-[10px] leading-4 text-slate-500 sm:text-xs">
          {text}
        </p>
      </div>

      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

    </div>
  );
}

// ==========================================================
// FLOATING CARD
// ==========================================================

function FloatingCard({
  className,
  icon: Icon,
  title,
  text,
}) {
  return (
    <div
      className={`w-60 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl ${className}`}
    >

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
          <Icon size={19} />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {text}
          </p>
        </div>

      </div>

    </div>
  );
}

// ==========================================================
// LOADING
// ==========================================================

function LoadingState({
  text,
}) {
  return (
    <div className="mt-12 flex min-h-40 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">

      <div className="flex items-center gap-3 text-sm text-slate-400">

        <Loader2
          size={19}
          className="animate-spin text-blue-400"
        />

        {text}

      </div>

    </div>
  );
}

// ==========================================================
// ERROR
// ==========================================================

function ErrorState({
  message,
  onRetry,
}) {
  return (
    <div className="mt-12 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">

      <AlertCircle
        size={28}
        className="mx-auto text-red-400"
      />

      <p className="mt-4 text-sm text-slate-300">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
      >
        <RefreshCw size={15} />
        Try Again
      </button>

    </div>
  );
}

// ==========================================================
// EMPTY
// ==========================================================

function EmptyState({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400">
        <Icon size={25} />
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}

// ==========================================================
// DATE FORMAT
// ==========================================================

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(value));
  } catch {
    return "";
  }
}

export default Home;