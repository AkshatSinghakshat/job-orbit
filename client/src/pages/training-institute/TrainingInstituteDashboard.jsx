import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrainingDashboard } from "../../services/trainingApi";
import TrainingNavbar from "./TrainingNavbar";

const initialStats = {
  students: 0,
  courses: 0,
  applications: 0,
  trainers: 0,
  batches: 0,
  revenue: 0,
};

const modules = [
  {
    title: "Courses",
    description: "Manage training courses",
    icon: "📚",
    path: "/training-institute/courses",
  },
  {
    title: "Applications",
    description: "Manage student admissions",
    icon: "📝",
    path: "/training-institute/applications",
  },
  {
    title: "Students",
    description: "View enrolled students",
    icon: "👨‍🎓",
    path: "/training-institute/students",
  },
  {
    title: "Trainers",
    description: "Manage your trainers",
    icon: "👨‍🏫",
    path: "/training-institute/trainers",
  },
  {
    title: "Batches",
    description: "Manage training batches",
    icon: "📅",
    path: "/training-institute/batches",
  },
  {
    title: "Institute Profile",
    description: "Manage institute information",
    icon: "🏢",
    path: "/training-institute/profile",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function StatCard({ title, value, icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 transition hover:border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h2 className="mt-3 text-3xl font-bold text-white">{value}</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">{description}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
      {message}
    </div>
  );
}

export default function TrainingInstituteDashboard() {
  const [dashboard, setDashboard] = useState({
    stats: initialStats,
    institute: null,
    courses: [],
    applications: [],
    batches: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getTrainingDashboard();
      const data = response?.data ?? response;

      setDashboard({
        stats: {
          ...initialStats,
          ...(data?.stats || {}),
        },
        institute: data?.institute || null,
        courses: Array.isArray(data?.courses) ? data.courses : [],
        applications: Array.isArray(data?.applications)
          ? data.applications
          : [],
        batches: Array.isArray(data?.batches) ? data.batches : [],
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load institute dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = dashboard.stats;

  const statCards = [
    {
      title: "Total Students",
      value: Number(stats.students || 0).toLocaleString("en-IN"),
      icon: "👨‍🎓",
      description: "Students associated with your institute",
    },
    {
      title: "Total Courses",
      value: Number(stats.courses || 0).toLocaleString("en-IN"),
      icon: "📚",
      description: "Courses managed by your institute",
    },
    {
      title: "Applications",
      value: Number(stats.applications || 0).toLocaleString("en-IN"),
      icon: "📝",
      description: "Student admission applications",
    },
    {
      title: "Total Trainers",
      value: Number(stats.trainers || 0).toLocaleString("en-IN"),
      icon: "👨‍🏫",
      description: "Trainers in your organization",
    },
    {
      title: "Training Batches",
      value: Number(stats.batches || 0).toLocaleString("en-IN"),
      icon: "📅",
      description: "Training batches created",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.revenue),
      icon: "💰",
      description: "Revenue reported by the backend",
    },
  ];

  if (loading) {
    return (
      <>
        <TrainingNavbar />
        <div className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="mb-8 h-8 w-72 rounded bg-slate-800" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-36 rounded-2xl border border-slate-800 bg-slate-900" />)}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TrainingNavbar />

      <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                {dashboard.institute?.name || "Training Institute Dashboard"}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Manage your institute, courses and students.
              </p>
            </div>

            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </header>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => loadDashboard()}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          <section className="mb-10">
            <h2 className="mb-5 text-xl font-semibold">Institute Overview</h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {statCards.map((item) => (
                <StatCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-5 text-xl font-semibold">Management Modules</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <Link
                  key={module.path}
                  to={module.path}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-blue-500"
                >
                  <div className="text-3xl">{module.icon}</div>
                  <h3 className="mt-4 font-semibold">{module.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {module.description}
                  </p>
                  <span className="mt-4 inline-block text-sm text-blue-400">
                    Open Module →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Courses</h2>
              <Link
                to="/training-institute/courses"
                className="text-sm text-blue-400"
              >
                View All →
              </Link>
            </div>

            {dashboard.courses.length === 0 ? (
              <EmptyState message="No courses available yet." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-700">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-4">Course</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.courses.slice(0, 5).map((course, index) => (
                      <tr
                        key={course.id || course._id || index}
                        className="border-t border-slate-800"
                      >
                        <td className="p-4">
                          {course.title || course.name || "Untitled"}
                        </td>
                        <td className="p-4 text-slate-400">
                          {course.duration || "—"}
                        </td>
                        <td className="p-4">{course.status || "Active"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mb-10">
            <h2 className="mb-5 text-xl font-semibold">Recent Applications</h2>

            {dashboard.applications.length === 0 ? (
              <EmptyState message="No applications received yet." />
            ) : (
              <div className="space-y-3">
                {dashboard.applications.slice(0, 5).map((item, index) => (
                  <div
                    key={item.id || item._id || index}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {item.studentName ||
                          item.name ||
                          item.student?.name ||
                          "Student"}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.courseName ||
                          item.course?.title ||
                          "Course not specified"}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                      {item.status || "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
