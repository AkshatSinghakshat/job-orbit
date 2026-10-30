import React, { useCallback, useEffect, useMemo, useState } from "react";
import TrainingNavbar from "./TrainingNavbar";
import {
  Search,
  RefreshCw,
  Video,
  Play,
  Plus,
  X,
  Trash2,
  Eye,
  ExternalLink,
  Clock,
  BookOpen,
  UserRound,
  CalendarDays,
  Download,
  AlertCircle,
  Filter,
  Link as LinkIcon,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const ENDPOINT = "/class-recordings";
const PAGE_SIZE = 8;

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
    payload?.recordings,
    payload?.classRecordings,
    payload?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;

  return [];
}

function getId(item) {
  return item?.id ?? item?._id ?? item?.recordingId;
}

function getTitle(item) {
  return item?.title || item?.recordingTitle || item?.name || "Untitled Recording";
}

function getCourse(item) {
  return item?.courseName || item?.course || item?.course?.name || "Not specified";
}

function getInstructor(item) {
  return (
    item?.instructorName ||
    item?.instructor?.name ||
    item?.teacherName ||
    item?.teacher?.name ||
    "Not specified"
  );
}

function getVideoUrl(item) {
  return item?.videoUrl || item?.recordingUrl || item?.url || item?.link || "";
}

function getDate(item) {
  const value =
    item?.recordingDate ||
    item?.classDate ||
    item?.createdAt ||
    item?.date;

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function escapeCSV(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function ClassRecordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    title: "",
    courseName: "",
    instructorName: "",
    videoUrl: "",
    recordingDate: "",
    duration: "",
    description: "",
  });

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

  const loadRecordings = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");

      try {
        const payload = await apiRequest(ENDPOINT);
        setRecordings(normalizeList(payload));
      } catch (err) {
        setError(err.message || "Recordings load nahi ho sakin.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiRequest]
  );

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const courses = useMemo(() => {
    return [
      ...new Set(
        recordings
          .map(getCourse)
          .filter((course) => course !== "Not specified")
      ),
    ].sort();
  }, [recordings]);

  const filteredRecordings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recordings.filter((item) => {
      const searchable = [
        getTitle(item),
        getCourse(item),
        getInstructor(item),
        item?.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (courseFilter === "All" || getCourse(item) === courseFilter)
      );
    });
  }, [recordings, search, courseFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecordings.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleRecordings = filteredRecordings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, courseFilter]);

  function resetForm() {
    setForm({
      title: "",
      courseName: "",
      instructorName: "",
      videoUrl: "",
      recordingDate: "",
      duration: "",
      description: "",
    });
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.videoUrl.trim()) {
      setError("Recording title aur video URL zaroori hain.");
      return;
    }

    if (!isValidHttpUrl(form.videoUrl.trim())) {
      setError("Valid HTTP ya HTTPS video URL enter karein.");
      return;
    }

    setSaving(true);

    try {
      const payload = await apiRequest(ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          courseName: form.courseName.trim(),
          instructorName: form.instructorName.trim(),
          videoUrl: form.videoUrl.trim(),
          duration: form.duration.trim(),
          description: form.description.trim(),
        }),
      });

      const created =
        payload?.data?.recording ||
        payload?.data ||
        payload?.recording;

      if (created && typeof created === "object" && getId(created) != null) {
        setRecordings((current) => [created, ...current]);
      } else {
        await loadRecordings(false);
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err.message || "Recording save nahi ho saki.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const id = getId(item);

    if (id == null) {
      setError("Recording ID nahi mili. Backend response check karein.");
      return;
    }

    const confirmed = window.confirm(
      `Kya aap "${getTitle(item)}" recording delete karna chahte hain?`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await apiRequest(`${ENDPOINT}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      setRecordings((current) =>
        current.filter(
          (recording) => String(getId(recording)) !== String(id)
        )
      );

      if (
        selectedRecording &&
        String(getId(selectedRecording)) === String(id)
      ) {
        setSelectedRecording(null);
      }
    } catch (err) {
      setError(err.message || "Recording delete nahi ho saki.");
    } finally {
      setDeletingId(null);
    }
  }

  function exportCSV() {
    const columns = [
      ["Title", getTitle],
      ["Course", getCourse],
      ["Instructor", getInstructor],
      ["Video URL", getVideoUrl],
      ["Recording Date", getDate],
      ["Duration", (item) => item?.duration || ""],
      ["Description", (item) => item?.description || ""],
    ];

    const rows = [
      columns.map(([heading]) => escapeCSV(heading)).join(","),
      ...filteredRecordings.map((item) =>
        columns.map(([, getter]) => escapeCSV(getter(item))).join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF" + rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "class-recordings.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <TrainingNavbar />

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Video size={17} />
              Training Institute / Class Recordings
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Class Recordings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Training sessions ki recordings manage karein, course-wise
              videos dekhein aur students ke liye learning resources maintain karein.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadRecordings(false)}
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
              disabled={!filteredRecordings.length}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus size={17} />
              Add Recording
            </button>
          </div>
        </div>

        {/* Error banner */}
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

        {/* Summary cards */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Recordings",
              value: recordings.length,
              icon: Video,
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Available Courses",
              value: courses.length,
              icon: BookOpen,
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Matching Results",
              value: filteredRecordings.length,
              icon: Search,
              color: "bg-amber-50 text-amber-600",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {loading ? "—" : card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Recordings listing */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recording Library
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredRecordings.length} recordings found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search recordings..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-64"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={courseFilter}
                    onChange={(event) => setCourseFilter(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-52"
                  >
                    <option value="All">All Courses</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Video size={27} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No class recordings found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Recording library khaali hai ya search se koi match nahi mila.
                Add Recording par click karke nayi recording add karein.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCourseFilter("All");
                }}
                className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleRecordings.map((item, index) => {
                  const id = getId(item) ?? `${currentPage}-${index}`;
                  const videoUrl = getVideoUrl(item);

                  return (
                    <article
                      key={id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                    >
                      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-700">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                        <div className="absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-indigo-400/20" />

                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition group-hover:scale-110">
                          <Video size={30} />
                        </div>

                        {item?.duration && (
                          <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                            <Clock size={12} className="mr-1 inline" />
                            {item.duration}
                          </span>
                        )}

                        <span className="absolute left-3 top-3 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                          Class Recording
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="line-clamp-2 min-h-12 text-base font-bold text-slate-900">
                          {getTitle(item)}
                        </h3>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <BookOpen size={16} className="shrink-0 text-indigo-500" />
                            <span className="truncate">{getCourse(item)}</span>
                          </div>

                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <UserRound size={16} className="shrink-0 text-indigo-500" />
                            <span className="truncate">{getInstructor(item)}</span>
                          </div>

                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <CalendarDays size={16} className="shrink-0 text-indigo-500" />
                            <span>{getDate(item)}</span>
                          </div>
                        </div>

                        {item?.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-500">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            onClick={() => setSelectedRecording(item)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Eye size={15} />
                            Details
                          </button>

                          {isValidHttpUrl(videoUrl) && (
                            <a
                              href={videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                              <Play size={15} />
                              Watch
                            </a>
                          )}

                          <button
                            type="button"
                            title="Delete recording"
                            aria-label={`Delete ${getTitle(item)}`}
                            disabled={deletingId === getId(item)}
                            onClick={() => handleDelete(item)}
                            className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-2.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredRecordings.length
                  )}{" "}
                  of {filteredRecordings.length}
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
                      setPage((value) =>
                        Math.min(totalPages, value + 1)
                      )
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

      {/* Add recording modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <form
            onSubmit={handleCreate}
            className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add Class Recording
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Recording details aur video link enter karein.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <FormField
                label="Recording Title *"
                value={form.title}
                onChange={(value) =>
                  setForm((current) => ({ ...current, title: value }))
                }
                placeholder="e.g. React Hooks - Lecture 5"
                required
              />

              <FormField
                label="Course Name"
                value={form.courseName}
                onChange={(value) =>
                  setForm((current) => ({ ...current, courseName: value }))
                }
                placeholder="e.g. Full Stack Development"
              />

              <FormField
                label="Instructor Name"
                value={form.instructorName}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    instructorName: value,
                  }))
                }
                placeholder="Instructor name"
              />

              <FormField
                label="Duration"
                value={form.duration}
                onChange={(value) =>
                  setForm((current) => ({ ...current, duration: value }))
                }
                placeholder="e.g. 45 minutes"
              />

              <FormField
                label="Recording Date"
                type="date"
                value={form.recordingDate}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    recordingDate: value,
                  }))
                }
              />

              <div className="sm:col-span-2">
                <FormField
                  label="Video URL *"
                  type="url"
                  value={form.videoUrl}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, videoUrl: value }))
                  }
                  placeholder="https://..."
                  required
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  YouTube, Vimeo ya kisi accessible video hosting ka link dein.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Lecture mein cover kiye gaye topics..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
                {saving ? "Saving..." : "Save Recording"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recording details modal */}
      {selectedRecording && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecording(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="recording-modal-title"
            className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Recording Library
                </p>
                <h2
                  id="recording-modal-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  Recording Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecording(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex h-36 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-700 text-white">
                <Video size={48} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {getTitle(selectedRecording)}
                </h3>
                {selectedRecording?.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {selectedRecording.description}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  icon={BookOpen}
                  label="Course"
                  value={getCourse(selectedRecording)}
                />
                <DetailField
                  icon={UserRound}
                  label="Instructor"
                  value={getInstructor(selectedRecording)}
                />
                <DetailField
                  icon={CalendarDays}
                  label="Recording Date"
                  value={getDate(selectedRecording)}
                />
                <DetailField
                  icon={Clock}
                  label="Duration"
                  value={selectedRecording?.duration}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Video URL
                </p>
                <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <LinkIcon size={17} className="mt-0.5 shrink-0 text-indigo-600" />
                  <span className="min-w-0 break-all text-sm text-slate-600">
                    {getVideoUrl(selectedRecording) || "No video URL provided"}
                  </span>
                </div>
              </div>

              {isValidHttpUrl(getVideoUrl(selectedRecording)) && (
                <a
                  href={getVideoUrl(selectedRecording)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Play size={17} />
                  Open Recording
                  <ExternalLink size={15} />
                </a>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setSelectedRecording(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value === undefined || value === null || value === ""
            ? "Not provided"
            : String(value)}
        </p>
      </div>
    </div>
  );
}
