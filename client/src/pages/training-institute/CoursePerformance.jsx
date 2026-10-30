import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  Filter,
  GraduationCap,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import TrainingNavbar from "./TrainingNavbar";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const EMPTY_FORM = {
  courseName: "",
  courseCode: "",
  batchName: "",
  instructorName: "",
  totalStudents: "",
  completedStudents: "",
  averageScore: "",
  passRate: "",
  completionRate: "",
  status: "Active",
  remarks: "",
};

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

const getId = (item) =>
  item?.id ??
  item?._id ??
  item?.coursePerformanceId ??
  item?.performanceId;

const getNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatPercent = (value) =>
  `${getNumber(value).toFixed(1).replace(/\.0$/, "")}%`;

const getErrorMessage = (error, fallback) =>
  error?.message || fallback;

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof result === "object"
        ? result?.message || result?.error
        : result;

    throw new Error(
      message || `Request failed with status ${response.status}`
    );
  }

  return result;
}

function normalizeRecords(result) {
  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.records)) return result.records;
  if (Array.isArray(result?.performances)) return result.performances;
  if (Array.isArray(result?.results)) return result.results;

  return [];
}

function normalizeRecord(item = {}) {
  return {
    ...item,
    courseName: item.courseName ?? item.course_name ?? item.name ?? "",
    courseCode: item.courseCode ?? item.course_code ?? "",
    batchName: item.batchName ?? item.batch_name ?? item.batch ?? "",
    instructorName:
      item.instructorName ??
      item.instructor_name ??
      item.instructor ??
      item.trainerName ??
      "",
    totalStudents:
      item.totalStudents ?? item.total_students ?? item.studentCount ?? 0,
    completedStudents:
      item.completedStudents ??
      item.completed_students ??
      item.completedCount ??
      0,
    averageScore: item.averageScore ?? item.average_score ?? item.avgScore ?? 0,
    passRate: item.passRate ?? item.pass_rate ?? 0,
    completionRate:
      item.completionRate ??
      item.completion_rate ??
      item.completionPercentage ??
      0,
    status: item.status ?? "Active",
    remarks: item.remarks ?? item.description ?? "",
  };
}

function StatCard({ title, value, subtitle, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ring-1 ${tones[tone] || tones.blue}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, color = "bg-blue-600" }) {
  const percent = Math.max(0, Math.min(100, getNumber(value)));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function PerformanceModal({
  open,
  mode,
  record,
  saving,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(
      record
        ? {
            ...EMPTY_FORM,
            ...normalizeRecord(record),
            totalStudents: String(normalizeRecord(record).totalStudents ?? ""),
            completedStudents: String(
              normalizeRecord(record).completedStudents ?? ""
            ),
            averageScore: String(normalizeRecord(record).averageScore ?? ""),
            passRate: String(normalizeRecord(record).passRate ?? ""),
            completionRate: String(
              normalizeRecord(record).completionRate ?? ""
            ),
          }
        : EMPTY_FORM
    );

    setFormError("");
  }, [open, record]);

  if (!open) return null;

  const update = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.courseName.trim()) {
      setFormError("कृपया कोर्स का नाम भरें।");
      return;
    }

    const total = getNumber(form.totalStudents);
    const completed = getNumber(form.completedStudents);
    const average = getNumber(form.averageScore);
    const passRate = getNumber(form.passRate);
    const completionRate = getNumber(form.completionRate);

    if (
      total < 0 ||
      completed < 0 ||
      completed > total ||
      average < 0 ||
      average > 100 ||
      passRate < 0 ||
      passRate > 100 ||
      completionRate < 0 ||
      completionRate > 100
    ) {
      setFormError(
        "संख्या सही भरें। प्रतिशत 0–100 के बीच हो और completed students, total students से अधिक न हों।"
      );
      return;
    }

    const payload = {
      courseName: form.courseName.trim(),
      courseCode: form.courseCode.trim(),
      batchName: form.batchName.trim(),
      instructorName: form.instructorName.trim(),
      totalStudents: total,
      completedStudents: completed,
      averageScore: average,
      passRate,
      completionRate,
      status: form.status,
      remarks: form.remarks.trim(),
    };

    try {
      await onSave(payload);
    } catch (error) {
      setFormError(getErrorMessage(error, "रिकॉर्ड सेव नहीं हो सका।"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === "edit" ? "Edit Performance" : "Add Course Performance"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              कोर्स और विद्यार्थियों की performance details भरें।
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Course Name *">
              <input
                className={inputClass}
                name="courseName"
                value={form.courseName}
                onChange={update}
                placeholder="e.g. Full Stack Web Development"
                required
              />
            </Field>

            <Field label="Course Code">
              <input
                className={inputClass}
                name="courseCode"
                value={form.courseCode}
                onChange={update}
                placeholder="e.g. FSWD-101"
              />
            </Field>

            <Field label="Batch Name">
              <input
                className={inputClass}
                name="batchName"
                value={form.batchName}
                onChange={update}
                placeholder="e.g. October 2026"
              />
            </Field>

            <Field label="Instructor Name">
              <input
                className={inputClass}
                name="instructorName"
                value={form.instructorName}
                onChange={update}
                placeholder="Instructor name"
              />
            </Field>

            <Field label="Total Students">
              <input
                className={inputClass}
                type="number"
                name="totalStudents"
                min="0"
                step="1"
                value={form.totalStudents}
                onChange={update}
                placeholder="0"
              />
            </Field>

            <Field label="Completed Students">
              <input
                className={inputClass}
                type="number"
                name="completedStudents"
                min="0"
                step="1"
                value={form.completedStudents}
                onChange={update}
                placeholder="0"
              />
            </Field>

            <Field label="Average Score (%)">
              <input
                className={inputClass}
                type="number"
                name="averageScore"
                min="0"
                max="100"
                step="0.1"
                value={form.averageScore}
                onChange={update}
                placeholder="0–100"
              />
            </Field>

            <Field label="Pass Rate (%)">
              <input
                className={inputClass}
                type="number"
                name="passRate"
                min="0"
                max="100"
                step="0.1"
                value={form.passRate}
                onChange={update}
                placeholder="0–100"
              />
            </Field>

            <Field label="Completion Rate (%)">
              <input
                className={inputClass}
                type="number"
                name="completionRate"
                min="0"
                max="100"
                step="0.1"
                value={form.completionRate}
                onChange={update}
                placeholder="0–100"
              />
            </Field>

            <Field label="Status">
              <select
                className={inputClass}
                name="status"
                value={form.status}
                onChange={update}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Remarks / Notes">
                <textarea
                  className={inputClass}
                  name="remarks"
                  rows={3}
                  value={form.remarks}
                  onChange={update}
                  placeholder="Performance observations..."
                />
              </Field>
            </div>

            {formError && (
              <div className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle size={16} className="animate-spin" />}
              {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ record, onClose, onEdit }) {
  if (!record) return null;

  const item = normalizeRecord(record);

  const metrics = [
    { label: "Average Score", value: formatPercent(item.averageScore) },
    { label: "Pass Rate", value: formatPercent(item.passRate) },
    { label: "Completion Rate", value: formatPercent(item.completionRate) },
    {
      label: "Students Completed",
      value: `${getNumber(item.completedStudents)} / ${getNumber(item.totalStudents)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Course Performance
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {item.courseName || "Unnamed Course"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {[item.courseCode, item.batchName].filter(Boolean).join(" • ") ||
                "Course details"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {metric.value}
              </p>
            </div>
          ))}

          <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">Instructor</p>
            <p className="mt-1 text-sm text-slate-600">
              {item.instructorName || "Not assigned"}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-700">Status</p>
            <p className="mt-1 text-sm text-slate-600">{item.status}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">Remarks</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
              {item.remarks || "No remarks added."}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onEdit(record)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Edit3 size={16} /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursePerformance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("courseName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/course-performance");
      setRecords(normalizeRecords(result).map(normalizeRecord));
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Course performance data लोड नहीं हो सका।"
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = records.filter((record) => {
      const matchesSearch = [
        record.courseName,
        record.courseCode,
        record.batchName,
        record.instructorName,
        record.remarks,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" ||
        String(record.status).toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const left = a[sortBy] ?? "";
      const right = b[sortBy] ?? "";

      const comparison =
        typeof left === "number" || typeof right === "number"
          ? getNumber(left) - getNumber(right)
          : String(left).localeCompare(String(right));

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [records, search, statusFilter, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const stats = useMemo(() => {
    const totalCourses = records.length;

    const totalStudents = records.reduce(
      (sum, item) => sum + getNumber(item.totalStudents),
      0
    );

    const averageScore = totalCourses
      ? records.reduce((sum, item) => sum + getNumber(item.averageScore), 0) /
        totalCourses
      : 0;

    const averagePassRate = totalCourses
      ? records.reduce((sum, item) => sum + getNumber(item.passRate), 0) /
        totalCourses
      : 0;

    const averageCompletion = totalCourses
      ? records.reduce(
          (sum, item) => sum + getNumber(item.completionRate),
          0
        ) / totalCourses
      : 0;

    return {
      totalCourses,
      totalStudents,
      averageScore,
      averagePassRate,
      averageCompletion,
    };
  }, [records]);

  const openCreate = () => {
    setSelectedRecord(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setDetailRecord(null);
    setSelectedRecord(record);
    setModalMode("edit");
    setModalOpen(true);
  };

  const saveRecord = async (payload) => {
    setSaving(true);

    try {
      if (modalMode === "edit") {
        const id = getId(selectedRecord);
        if (id == null) {
          throw new Error("इस रिकॉर्ड की ID नहीं मिली; अपडेट नहीं किया जा सकता।");
        }

        await apiRequest(`/course-performance/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        setNotice("Course performance सफलतापूर्वक अपडेट हुई।");
      } else {
        await apiRequest("/course-performance", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setNotice("Course performance रिकॉर्ड जोड़ दिया गया।");
      }

      setModalOpen(false);
      setSelectedRecord(null);
      await loadRecords();
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record) => {
    const id = getId(record);

    if (id == null) {
      setError("इस रिकॉर्ड की ID नहीं मिली; डिलीट नहीं किया जा सकता।");
      return;
    }

    const confirmed = window.confirm(
      `क्या आप "${record.courseName || "इस रिकॉर्ड"}" को डिलीट करना चाहते हैं?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await apiRequest(`/course-performance/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      setNotice("रिकॉर्ड सफलतापूर्वक डिलीट हो गया।");
      await loadRecords();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "रिकॉर्ड डिलीट नहीं हो सका।"));
    }
  };

  const exportCSV = () => {
    const columns = [
      ["Course Name", "courseName"],
      ["Course Code", "courseCode"],
      ["Batch", "batchName"],
      ["Instructor", "instructorName"],
      ["Total Students", "totalStudents"],
      ["Completed Students", "completedStudents"],
      ["Average Score", "averageScore"],
      ["Pass Rate", "passRate"],
      ["Completion Rate", "completionRate"],
      ["Status", "status"],
      ["Remarks", "remarks"],
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      columns.map(([label]) => escapeCSV(label)).join(","),
      ...filteredRecords.map((record) =>
        columns.map(([, key]) => escapeCSV(record[key])).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "course-performance.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TrainingNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <Activity size={14} /> TRAINING ANALYTICS
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Course Performance
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                अपने courses, student results, pass rates और completion
                progress को एक ही dashboard से मॉनिटर और मैनेज करें।
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-950 shadow-sm transition hover:bg-blue-50"
                >
                  <Plus size={18} /> Add Performance
                </button>

                <button
                  type="button"
                  onClick={loadRecords}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh Data
                </button>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:block lg:min-w-56">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <TrendingUp size={25} />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Average Course Score</p>
                  <p className="mt-1 text-3xl font-bold">
                    {formatPercent(stats.averageScore)}
                  </p>
                </div>
              </div>
              <div className="mt-5 border-t border-white/15 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Average completion</span>
                  <span className="font-semibold">
                    {formatPercent(stats.averageCompletion)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-emerald-300 transition-all"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, stats.averageCompletion)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {notice && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={18} /> {notice}
            <button
              type="button"
              className="ml-auto rounded-lg p-1 hover:bg-emerald-100"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span className="flex-1">{error}</span>
            <button
              type="button"
              className="rounded-lg p-1 hover:bg-rose-100"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            subtitle="Performance records"
            icon={BookOpen}
            tone="blue"
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents.toLocaleString("en-IN")}
            subtitle="Across listed courses"
            icon={Users}
            tone="violet"
          />
          <StatCard
            title="Average Pass Rate"
            value={formatPercent(stats.averagePassRate)}
            subtitle="Across all courses"
            icon={Award}
            tone="green"
          />
          <StatCard
            title="Completion Rate"
            value={formatPercent(stats.averageCompletion)}
            subtitle="Average course completion"
            icon={Target}
            tone="amber"
          />
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Performance Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredRecords.length} record
                {filteredRecords.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:min-w-64">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search course, batch, instructor..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="relative">
                <Filter
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  className={`${inputClass} pl-9 sm:min-w-36`}
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <button
                type="button"
                onClick={exportCSV}
                disabled={!filteredRecords.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={17} /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort("courseName")}
                      className="hover:text-blue-700"
                    >
                      Course ↕
                    </button>
                  </th>
                  <th className="px-5 py-4 font-semibold">Batch / Instructor</th>
                  <th className="px-5 py-4 font-semibold">Students</th>
                  <th className="px-5 py-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort("averageScore")}
                      className="hover:text-blue-700"
                    >
                      Avg. Score ↕
                    </button>
                  </th>
                  <th className="px-5 py-4 font-semibold">Pass Rate</th>
                  <th className="px-5 py-4 font-semibold">Completion</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="inline-flex items-center gap-3 text-sm text-slate-500">
                        <LoaderCircle
                          size={20}
                          className="animate-spin text-blue-600"
                        />
                        Loading course performance...
                      </div>
                    </td>
                  </tr>
                ) : visibleRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                          <BarChart3 size={28} />
                        </div>
                        <h3 className="mt-4 font-semibold text-slate-800">
                          No performance records found
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Search बदलें या पहला performance record जोड़ें।
                        </p>
                        <button
                          type="button"
                          onClick={openCreate}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          <Plus size={16} /> Add First Record
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRecords.map((record, index) => {
                    const id = getId(record);
                    const key = id ?? `${record.courseName}-${index}`;

                    return (
                      <tr
                        key={key}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                              <GraduationCap size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {record.courseName || "Unnamed Course"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {record.courseCode || "No course code"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-800">
                            {record.batchName || "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {record.instructorName || "No instructor"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {getNumber(record.completedStudents)} /{" "}
                            {getNumber(record.totalStudents)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Completed
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="w-28">
                            <div className="mb-2 flex justify-between text-xs">
                              <span className="font-semibold text-slate-800">
                                {formatPercent(record.averageScore)}
                              </span>
                            </div>
                            <ProgressBar
                              value={record.averageScore}
                              color="bg-blue-600"
                            />
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="w-24">
                            <p className="mb-2 text-xs font-semibold text-slate-800">
                              {formatPercent(record.passRate)}
                            </p>
                            <ProgressBar
                              value={record.passRate}
                              color="bg-emerald-500"
                            />
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="w-24">
                            <p className="mb-2 text-xs font-semibold text-slate-800">
                              {formatPercent(record.completionRate)}
                            </p>
                            <ProgressBar
                              value={record.completionRate}
                              color="bg-violet-500"
                            />
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              String(record.status).toLowerCase() === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : String(record.status).toLowerCase() ===
                                  "completed"
                                ? "bg-blue-50 text-blue-700"
                                : String(record.status).toLowerCase() ===
                                  "archived"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {record.status || "Draft"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setDetailRecord(record)}
                              title="View details"
                              aria-label="View details"
                              className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(record)}
                              title="Edit record"
                              aria-label="Edit record"
                              className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-700"
                            >
                              <Edit3 size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRecord(record)}
                              title="Delete record"
                              aria-label="Delete record"
                              className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              {filteredRecords.length
                ? (currentPage - 1) * pageSize + 1
                : 0}{" "}
              to {Math.min(currentPage * pageSize, filteredRecords.length)} of{" "}
              {filteredRecords.length} records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span className="px-2 text-sm font-medium text-slate-600">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <footer className="py-6 text-center text-xs text-slate-400">
          JobOrbit Training Institute · Course Performance Dashboard
        </footer>
      </main>

      <PerformanceModal
        open={modalOpen}
        mode={modalMode}
        record={selectedRecord}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setSelectedRecord(null);
        }}
        onSave={saveRecord}
      />

      <DetailModal
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={openEdit}
      />
    </div>
  );
}
