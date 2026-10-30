import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TrainingNavbar from "./TrainingNavbar";
import {
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Download,
  BookOpen,
  GraduationCap,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  Layers,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/$/, "");

const ENDPOINT = "/training/courses";
const PAGE_SIZE = 8;

const STATUS_OPTIONS = ["Draft", "Published", "Archived"];

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  duration: "",
  fees: "",
  level: "Beginner",
  status: "Draft",
  instructor: "",
  prerequisites: "",
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.data,
    payload?.courses,
    payload?.courseDetails,
    payload?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;

  return [];
}

function getId(item) {
  return item?.id ?? item?._id ?? item?.courseId;
}

function getTitle(item) {
  return item?.title || item?.courseName || item?.name || "Untitled Course";
}

function getCategory(item) {
  if (typeof item?.category === "string") return item.category;

  return (
    item?.category?.name ||
    item?.categoryName ||
    item?.courseCategory ||
    "Uncategorized"
  );
}

function getDescription(item) {
  return item?.description || item?.overview || item?.about || "";
}

function getDuration(item) {
  return item?.duration || item?.courseDuration || "";
}

function getFees(item) {
  return item?.fees ?? item?.price ?? item?.courseFee ?? "";
}

function getLevel(item) {
  return item?.level || item?.difficultyLevel || "Beginner";
}

function getStatus(item) {
  const status = String(item?.status || "Draft").toLowerCase();

  if (status === "published" || status === "active") return "Published";
  if (status === "archived" || status === "inactive") return "Archived";

  return "Draft";
}

function getInstructor(item) {
  if (typeof item?.instructor === "string") return item.instructor;

  return (
    item?.instructor?.name ||
    item?.instructorName ||
    item?.trainerName ||
    ""
  );
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

function formatCurrency(value) {
  if (value === "" || value === null || value === undefined) return "—";

  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
}

function escapeCSV(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const STATUS_STYLES = {
  Draft: "bg-amber-50 text-amber-700 ring-amber-200",
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Archived: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function CourseDetails() {
  const { id: routeCourseId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const apiRequest = useCallback(async (path, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        payload?.message ||
          payload?.error ||
          `Request failed (${response.status})`
      );
    }

    return payload;
  }, []);

  const loadCourses = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");

      try {
        const payload = await apiRequest(routeCourseId ? `${ENDPOINT}/${encodeURIComponent(routeCourseId)}` : ENDPOINT);
        setCourses(routeCourseId ? [payload?.course || payload?.data].filter(Boolean) : normalizeList(payload));
      } catch (err) {
        setError(err.message || "Courses load nahi ho sake.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiRequest, routeCourseId]
  );

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (!routeCourseId || courses.length !== 1) return;
    setSelectedCourse(courses[0]);
  }, [routeCourseId, courses]);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          courses
            .map(getCategory)
            .filter((category) => category !== "Uncategorized")
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [courses]
  );

  const stats = useMemo(
    () => ({
      total: courses.length,
      published: courses.filter(
        (course) => getStatus(course) === "Published"
      ).length,
      categories: categories.length,
      totalFees: courses.reduce((sum, course) => {
        const fees = Number(getFees(course));
        return sum + (Number.isFinite(fees) ? fees : 0);
      }, 0),
    }),
    [courses, categories]
  );

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter((course) => {
      const searchable = [
        getTitle(course),
        getCategory(course),
        getDescription(course),
        getInstructor(course),
        getLevel(course),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (categoryFilter === "All" ||
          getCategory(course) === categoryFilter) &&
        (statusFilter === "All" || getStatus(course) === statusFilter)
      );
    });
  }, [courses, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);

  const visibleCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingCourse(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(course) {
    setEditingCourse(course);

    setForm({
      title: getTitle(course) === "Untitled Course" ? "" : getTitle(course),
      category:
        getCategory(course) === "Uncategorized" ? "" : getCategory(course),
      description: getDescription(course),
      duration: String(getDuration(course) || ""),
      fees: getFees(course) === "" ? "" : String(getFees(course)),
      level: getLevel(course),
      status: getStatus(course),
      instructor: getInstructor(course),
      prerequisites: course?.prerequisites || "",
    });

    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Course title enter karna zaroori hai.");
      return;
    }

    if (!form.category.trim()) {
      setError("Course category enter karna zaroori hai.");
      return;
    }

    if (
      form.fees !== "" &&
      (!Number.isFinite(Number(form.fees)) || Number(form.fees) < 0)
    ) {
      setError("Course fees zero ya positive number honi chahiye.");
      return;
    }

    const editingId = editingCourse ? getId(editingCourse) : null;

    if (editingCourse && editingId == null) {
      setError("Course ID nahi mili. Backend response check karein.");
      return;
    }

    const body = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      fee: form.fees === "" ? 0 : Number(form.fees),
      level: form.level,
      status: form.status,
    };

    setSaving(true);

    try {
      const payload = await apiRequest(
        editingCourse
          ? `${ENDPOINT}/${encodeURIComponent(editingId)}`
          : ENDPOINT,
        {
          method: editingCourse ? "PUT" : "POST",
          body: JSON.stringify(body),
        }
      );

      const saved =
        payload?.data?.course ||
        payload?.data?.courseDetail ||
        payload?.data ||
        payload?.course ||
        payload?.courseDetail;

      if (saved && typeof saved === "object" && getId(saved) != null) {
        if (editingCourse) {
          setCourses((current) =>
            current.map((course) =>
              String(getId(course)) === String(editingId)
                ? { ...course, ...saved }
                : course
            )
          );
        } else {
          setCourses((current) => [saved, ...current]);
        }
      } else {
        await loadCourses(false);
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(
        err.message ||
          `Course ${editingCourse ? "update" : "create"} nahi ho saka.`
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    const id = getId(course);

    if (id == null) {
      setError("Course ID nahi mili. Backend response check karein.");
      return;
    }

    if (
      !window.confirm(
        `Kya aap "${getTitle(course)}" course delete karna chahte hain?`
      )
    ) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      await apiRequest(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      setCourses((current) =>
        current.filter((item) => String(getId(item)) !== String(id))
      );

      if (
        selectedCourse &&
        String(getId(selectedCourse)) === String(id)
      ) {
        setSelectedCourse(null);
      }
    } catch (err) {
      setError(err.message || "Course delete nahi ho saka.");
    } finally {
      setDeletingId(null);
    }
  }

  function exportCSV() {
    const columns = [
      ["Course Title", getTitle],
      ["Category", getCategory],
      ["Description", getDescription],
      ["Duration", getDuration],
      ["Fees (INR)", getFees],
      ["Level", getLevel],
      ["Instructor", getInstructor],
      ["Status", getStatus],
      ["Created Date", (course) => formatDate(course?.createdAt)],
    ];

    const rows = [
      columns.map(([label]) => escapeCSV(label)).join(","),
      ...filteredCourses.map((course) =>
        columns.map(([, getter]) => escapeCSV(getter(course))).join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF" + rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "joborbit-course-details.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const statCards = [
    {
      label: "Total Courses",
      value: stats.total,
      icon: BookOpen,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Published Courses",
      value: stats.published,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Course Categories",
      value: stats.categories,
      icon: Layers,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Combined Course Fees",
      value: formatCurrency(stats.totalFees),
      icon: IndianRupee,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <TrainingNavbar />

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <GraduationCap size={17} />
              Training Institute / Course Details
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Course Details
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              JobOrbit Training Institute ke courses, fees, duration,
              instructors aur publication status manage karein.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadCourses(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={exportCSV}
              disabled={!filteredCourses.length}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus size={17} />
              Add Course
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-2 break-words text-2xl font-bold text-slate-900">
                      {loading ? "—" : card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Courses table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Courses
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredCourses.length} matching courses
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search courses..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-56"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-48"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-36"
                >
                  <option value="All">All Statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BookOpen size={27} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No courses found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Course abhi available nahi hai ya search filters se match nahi
                mila. Naya course add karke shuru karein.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All");
                  setStatusFilter("All");
                }}
                className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Course</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Duration</th>
                      <th className="px-5 py-4 font-semibold">Fees</th>
                      <th className="px-5 py-4 font-semibold">Level</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleCourses.map((course, index) => {
                      const id = getId(course) ?? `${currentPage}-${index}`;
                      const status = getStatus(course);

                      return (
                        <tr key={id} className="transition hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <BookOpen size={21} />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {getTitle(course)}
                                </p>
                                <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                  {getInstructor(course) || "Instructor not assigned"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
                              {getCategory(course)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                              <Clock size={15} className="text-slate-400" />
                              {getDuration(course) || "—"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                            {formatCurrency(getFees(course))}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {getLevel(course)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="View course"
                                aria-label={`View ${getTitle(course)}`}
                                onClick={() => setSelectedCourse(course)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                title="Edit course"
                                aria-label={`Edit ${getTitle(course)}`}
                                onClick={() => openEditForm(course)}
                                className="rounded-lg border border-slate-200 p-2 text-indigo-600 hover:bg-indigo-50"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                title="Delete course"
                                aria-label={`Delete ${getTitle(course)}`}
                                disabled={deletingId === getId(course)}
                                onClick={() => handleDelete(course)}
                                className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredCourses.length
                  )}{" "}
                  of {filteredCourses.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setPage((value) => Math.max(1, value - 1))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((value) => Math.min(totalPages, value + 1))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Create / Edit Course Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
              resetForm();
            }
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Course ki basic information aur pricing configure karein.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. Full Stack Web Development"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    list="course-category-options"
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    placeholder="e.g. Web Development"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                  <datalist id="course-category-options">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Instructor
                  </label>
                  <input
                    type="text"
                    maxLength={150}
                    value={form.instructor}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        instructor: event.target.value,
                      }))
                    }
                    placeholder="Instructor name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Duration
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={form.duration}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        duration: event.target.value,
                      }))
                    }
                    placeholder="e.g. 12 weeks"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Fees (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.fees}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fees: event.target.value,
                      }))
                    }
                    placeholder="e.g. 9999"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Level
                  </label>
                  <select
                    value={form.level}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        level: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>All Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  maxLength={3000}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Course ke baare mein details aur learning outcomes..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Prerequisites
                </label>
                <textarea
                  rows={2}
                  maxLength={1500}
                  value={form.prerequisites}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      prerequisites: event.target.value,
                    }))
                  }
                  placeholder="Students ko course se pehle kya aana chahiye?"
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Publication Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving && <RefreshCw size={15} className="animate-spin" />}
                {saving
                  ? "Saving..."
                  : editingCourse
                    ? "Update Course"
                    : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCourse(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-detail-title"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Course Information
                </p>
                <h2
                  id="course-detail-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  {getTitle(selectedCourse)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryCard
                  icon={Layers}
                  label="Category"
                  value={getCategory(selectedCourse)}
                />
                <SummaryCard
                  icon={IndianRupee}
                  label="Course Fees"
                  value={formatCurrency(getFees(selectedCourse))}
                />
                <SummaryCard
                  icon={Clock}
                  label="Duration"
                  value={getDuration(selectedCourse) || "Not specified"}
                />
                <SummaryCard
                  icon={GraduationCap}
                  label="Level"
                  value={getLevel(selectedCourse)}
                />
              </div>

              <DetailField
                label="Instructor"
                value={getInstructor(selectedCourse)}
              />
              <DetailField
                label="Description"
                value={getDescription(selectedCourse)}
              />
              <DetailField
                label="Prerequisites"
                value={selectedCourse?.prerequisites}
              />
              <DetailField
                label="Publication Status"
                value={getStatus(selectedCourse)}
              />
              <DetailField
                label="Created Date"
                value={formatDate(selectedCourse?.createdAt)}
              />

              <button
                type="button"
                onClick={() => {
                  const course = selectedCourse;
                  setSelectedCourse(null);
                  openEditForm(course);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Pencil size={16} />
                Edit Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <Icon size={19} className="text-indigo-600" />
      <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-lg font-bold text-slate-900">
        {value ?? "—"}
      </p>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-slate-800">
        {value === undefined || value === null || value === ""
          ? "Not provided"
          : String(value)}
      </p>
    </div>
  );
}
