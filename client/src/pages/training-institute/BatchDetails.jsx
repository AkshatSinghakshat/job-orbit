import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  Users,
  BookOpen,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  Filter,
  Save,
  GraduationCap,
  MapPin,
} from "lucide-react";

import TrainingNavbar from "./TrainingNavbar";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const PAGE_SIZE = 8;

const STATUS_OPTIONS = ["Upcoming", "Ongoing", "Completed", "Cancelled"];

const EMPTY_FORM = {
  batchName: "",
  courseName: "",
  instructorName: "",
  startDate: "",
  endDate: "",
  timing: "",
  capacity: "30",
  mode: "Offline",
  location: "",
  status: "Upcoming",
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed (${response.status})`
    );
  }

  return data;
}

function extractBatches(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.batches)) return response.batches;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;

  return [];
}

function normalizeBatch(item, index) {
  return {
    ...item,
    id: item.id ?? item.batchId ?? item.batch_id ?? index + 1,
    batchName:
      item.batchName ??
      item.batch_name ??
      item.name ??
      item.title ??
      "",
    courseName:
      item.courseName ??
      item.course_name ??
      item.course ??
      "",
    instructorName:
      item.instructorName ??
      item.instructor_name ??
      item.instructor?.name ??
      "",
    startDate: item.startDate ?? item.start_date ?? "",
    endDate: item.endDate ?? item.end_date ?? "",
    timing: item.timing ?? item.schedule ?? "",
    capacity: item.capacity ?? item.maxStudents ?? item.max_students ?? 30,
    studentCount:
      item.studentCount ??
      item.student_count ??
      item.enrolledStudents ??
      item.enrolled_students ??
      0,
    mode: item.mode ?? item.deliveryMode ?? item.delivery_mode ?? "Offline",
    location: item.location ?? item.venue ?? "",
    status: STATUS_OPTIONS.includes(item.status) ? item.status : "Upcoming",
  };
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

function StatusBadge({ status }) {
  const styles = {
    Upcoming: "bg-blue-50 text-blue-700 ring-blue-200",
    Ongoing: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Completed: "bg-slate-100 text-slate-700 ring-slate-200",
    Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
        styles[status] || styles.Upcoming
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  maxLength,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        maxLength={maxLength}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function BatchFormModal({ initialData, mode, saving, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initialData ? { ...EMPTY_FORM, ...initialData } : { ...EMPTY_FORM }
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm(
      initialData ? { ...EMPTY_FORM, ...initialData } : { ...EMPTY_FORM }
    );
    setFormError("");
  }, [initialData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (
      !form.batchName.trim() ||
      !form.courseName.trim() ||
      !form.startDate ||
      !form.endDate
    ) {
      setFormError(
        "Batch name, course name, start date aur end date bharna zaroori hai."
      );
      return;
    }

    if (form.endDate < form.startDate) {
      setFormError("End date, start date se pehle nahi ho sakti.");
      return;
    }

    const capacity = Number(form.capacity);

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
      setFormError("Capacity 1 se 10000 ke beech honi chahiye.");
      return;
    }

    onSubmit({
      ...form,
      batchName: form.batchName.trim(),
      courseName: form.courseName.trim(),
      instructorName: form.instructorName.trim(),
      capacity,
      location: form.location.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="my-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/20 p-3 text-blue-300">
              <BookOpen size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {mode === "edit" ? "Edit Batch" : "Create New Batch"}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Enter the batch details below.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10 disabled:opacity-50"
            aria-label="Close form"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {formError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Batch Name"
                name="batchName"
                value={form.batchName}
                onChange={handleChange}
                placeholder="e.g. Web Development Batch 01"
                required
                maxLength={150}
              />

              <InputField
                label="Course Name"
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                placeholder="e.g. Full Stack Development"
                required
                maxLength={150}
              />

              <InputField
                label="Instructor Name"
                name="instructorName"
                value={form.instructorName}
                onChange={handleChange}
                placeholder="Instructor name"
                maxLength={100}
              />

              <InputField
                label="Class Timing"
                name="timing"
                value={form.timing}
                onChange={handleChange}
                placeholder="e.g. 10:00 AM - 12:00 PM"
                maxLength={100}
              />

              <InputField
                label="Start Date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                type="date"
                required
              />

              <InputField
                label="End Date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                type="date"
                required
                min={form.startDate || undefined}
              />

              <InputField
                label="Student Capacity"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                type="number"
                min="1"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Training Mode
                </label>

                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Batch Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                label="Location / Venue"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter classroom or online venue"
                maxLength={200}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? "Saving..."
                : mode === "edit"
                  ? "Update Batch"
                  : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BatchDetailsModal({ batch, onClose }) {
  if (!batch) return null;

  const capacity = Number(batch.capacity) || 0;
  const enrolled = Number(batch.studentCount) || 0;
  const fillPercentage =
    capacity > 0 ? Math.min(100, (enrolled / capacity) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
          <div>
            <h2 className="text-xl font-bold">Batch Details</h2>
            <p className="mt-1 text-sm text-slate-300">
              Batch ID: {batch.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Close details"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {batch.batchName}
            </h3>

            <p className="mt-1 text-slate-500">{batch.courseName}</p>

            <div className="mt-3">
              <StatusBadge status={batch.status} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={GraduationCap}
              label="Instructor"
              value={batch.instructorName || "Not assigned"}
            />

            <DetailItem
              icon={CalendarDays}
              label="Start Date"
              value={formatDate(batch.startDate)}
            />

            <DetailItem
              icon={CalendarDays}
              label="End Date"
              value={formatDate(batch.endDate)}
            />

            <DetailItem
              icon={Clock}
              label="Timing"
              value={batch.timing || "Not specified"}
            />

            <DetailItem
              icon={MapPin}
              label="Mode / Location"
              value={[batch.mode, batch.location].filter(Boolean).join(" · ")}
            />

            <DetailItem
              icon={Users}
              label="Student Capacity"
              value={`${enrolled} / ${capacity}`}
            />
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-slate-700">
                Batch Occupancy
              </span>

              <span className="font-semibold text-slate-900">
                {Math.round(fillPercentage)}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={17} />
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default function BatchDetails() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [viewingBatch, setViewingBatch] = useState(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/batch-details");
      const records = extractBatches(response);

      setBatches(records.map(normalizeBatch));
    } catch (err) {
      setError(
        err.message ||
          "Batches load nahi hue. Backend API check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, modeFilter]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    return {
      total: batches.length,
      ongoing: batches.filter((batch) => batch.status === "Ongoing").length,
      upcoming: batches.filter((batch) => batch.status === "Upcoming").length,
      students: batches.reduce(
        (total, batch) => total + (Number(batch.studentCount) || 0),
        0
      ),
    };
  }, [batches]);

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return batches
      .filter((batch) => {
        const matchesSearch = [
          batch.batchName,
          batch.courseName,
          batch.instructorName,
          batch.location,
          batch.mode,
        ].some((value) => String(value ?? "").toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "All" || batch.status === statusFilter;

        const matchesMode = modeFilter === "All" || batch.mode === modeFilter;

        return matchesSearch && matchesStatus && matchesMode;
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate || 0).getTime() || 0;
        const dateB = new Date(b.startDate || 0).getTime() || 0;

        return dateA - dateB;
      });
  }, [batches, search, statusFilter, modeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBatches.length / PAGE_SIZE)
  );

  const visibleBatches = filteredBatches.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleSave(formData) {
    setSaving(true);
    setError("");

    try {
      if (editingBatch) {
        await apiRequest(
          `/batch-details/${encodeURIComponent(editingBatch.id)}`,
          {
            method: "PATCH",
            body: JSON.stringify(formData),
          }
        );

        setNotice("Batch updated successfully.");
      } else {
        await apiRequest("/batch-details", {
          method: "POST",
          body: JSON.stringify(formData),
        });

        setNotice("Batch created successfully.");
      }

      setFormOpen(false);
      setEditingBatch(null);

      await fetchBatches();
    } catch (err) {
      setError(
        err.message ||
          "Batch save nahi hua. Backend API check karein."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(batch) {
    const confirmed = window.confirm(
      `Kya aap "${batch.batchName}" ko delete karna chahte hain?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(
        `/batch-details/${encodeURIComponent(batch.id)}`,
        { method: "DELETE" }
      );

      setBatches((previous) =>
        previous.filter((item) => String(item.id) !== String(batch.id))
      );

      setNotice("Batch deleted successfully.");
    } catch (err) {
      setError(
        err.message ||
          "Batch delete nahi hua. Backend API check karein."
      );
    }
  }

  function exportCSV() {
    const headers = [
      "Batch ID",
      "Batch Name",
      "Course",
      "Instructor",
      "Start Date",
      "End Date",
      "Timing",
      "Students Enrolled",
      "Capacity",
      "Mode",
      "Location",
      "Status",
    ];

    const rows = filteredBatches.map((batch) => [
      batch.id,
      batch.batchName,
      batch.courseName,
      batch.instructorName,
      batch.startDate,
      batch.endDate,
      batch.timing,
      batch.studentCount,
      batch.capacity,
      batch.mode,
      batch.location,
      batch.status,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "joborbit-batch-details.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function openAddForm() {
    setEditingBatch(null);
    setFormOpen(true);
  }

  function openEditForm(batch) {
    setEditingBatch(batch);
    setFormOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TrainingNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <GraduationCap size={19} />
              <span>Training Institute Portal</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Batch Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Create training batches, assign instructors, manage schedules,
              and monitor student enrollment.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchBatches}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={exportCSV}
              disabled={filteredBatches.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={19} />
              Create Batch
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notice && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle size={19} />
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Request failed</p>
              <p className="mt-1 break-words">{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-rose-100"
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Batches"
            value={stats.total}
            icon={BookOpen}
            color="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Ongoing Batches"
            value={stats.ongoing}
            icon={Clock}
            color="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            title="Upcoming Batches"
            value={stats.upcoming}
            icon={CalendarDays}
            color="bg-violet-100 text-violet-700"
          />

          <StatCard
            title="Enrolled Students"
            value={stats.students}
            icon={Users}
            color="bg-amber-100 text-amber-700"
          />
        </section>

        {/* Search & Filters */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_180px]">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search batch, course, instructor, location..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="All">All Statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={modeFilter}
              onChange={(event) => setModeFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
            <p className="text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredBatches.length}
              </span>{" "}
              batches
            </p>

            {(search || statusFilter !== "All" || modeFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setModeFilter("All");
                }}
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* Batch Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5">
            <h2 className="text-lg font-bold">All Training Batches</h2>
            <p className="mt-1 text-sm text-slate-500">
              View schedules, enrollment and batch information.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
              <LoaderCircle
                size={36}
                className="animate-spin text-blue-600"
              />
              <p className="text-sm text-slate-500">Loading batches...</p>
            </div>
          ) : visibleBatches.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-500">
                <BookOpen size={32} />
              </div>

              <h3 className="text-lg font-bold">No Batches Found</h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {batches.length === 0
                  ? "No batch records were returned by the backend. Create your first batch to get started."
                  : "Your search or filters do not match any batches."}
              </p>

              {batches.length === 0 ? (
                <button
                  onClick={openAddForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Create First Batch
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setModeFilter("All");
                  }}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Batch</th>
                      <th className="px-5 py-4 font-semibold">Schedule</th>
                      <th className="px-5 py-4 font-semibold">Instructor</th>
                      <th className="px-5 py-4 font-semibold">Enrollment</th>
                      <th className="px-5 py-4 font-semibold">Mode</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleBatches.map((batch) => {
                      const capacity = Number(batch.capacity) || 0;
                      const enrolled = Number(batch.studentCount) || 0;
                      const percentage =
                        capacity > 0
                          ? Math.min(100, (enrolled / capacity) * 100)
                          : 0;

                      return (
                        <tr
                          key={batch.id}
                          className="transition hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                <BookOpen size={21} />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900">
                                  {batch.batchName || "Unnamed Batch"}
                                </p>

                                <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                  {batch.courseName || "Course not specified"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-800">
                              {formatDate(batch.startDate)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              to {formatDate(batch.endDate)}
                            </p>

                            {batch.timing && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={13} />
                                {batch.timing}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {batch.instructorName || "Not assigned"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                              <span className="font-semibold text-slate-800">
                                {enrolled} / {capacity}
                              </span>
                              <span className="text-slate-500">
                                {Math.round(percentage)}%
                              </span>
                            </div>

                            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                              {batch.mode}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={batch.status} />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewingBatch(batch)}
                                title="View Details"
                                aria-label="View batch details"
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                onClick={() => openEditForm(batch)}
                                title="Edit Batch"
                                aria-label="Edit batch"
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                onClick={() => handleDelete(batch)}
                                title="Delete Batch"
                                aria-label="Delete batch"
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-900">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          JobOrbit Training Institute Portal · Batch Management
        </p>
      </main>

      {formOpen && (
        <BatchFormModal
          initialData={editingBatch}
          mode={editingBatch ? "edit" : "add"}
          saving={saving}
          onClose={() => {
            if (!saving) {
              setFormOpen(false);
              setEditingBatch(null);
            }
          }}
          onSubmit={handleSave}
        />
      )}

      {viewingBatch && (
        <BatchDetailsModal
          batch={viewingBatch}
          onClose={() => setViewingBatch(null)}
        />
      )}
    </div>
  );
}
