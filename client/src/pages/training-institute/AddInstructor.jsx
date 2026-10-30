import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Search,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Eye,
  X,
  Users,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  Filter,
  Save,
  Briefcase,
} from "lucide-react";

import TrainingNavbar from "./TrainingNavbar";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  qualification: "",
  specialization: "",
  experience: "",
  status: "Active",
};

const STATUS_OPTIONS = ["Active", "Inactive"];

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

function extractInstructors(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.instructors)) return response.instructors;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;

  return [];
}

function normalizeInstructor(item, index) {
  return {
    ...item,
    id: item.id ?? item.instructorId ?? item.instructor_id ?? index + 1,
    name:
      item.name ??
      item.fullName ??
      item.full_name ??
      item.instructorName ??
      "",
    email: item.email ?? item.emailAddress ?? item.email_address ?? "",
    phone:
      item.phone ??
      item.mobile ??
      item.phoneNumber ??
      item.phone_number ??
      "",
    qualification:
      item.qualification ??
      item.education ??
      item.highestQualification ??
      "",
    specialization:
      item.specialization ??
      item.expertise ??
      item.subject ??
      item.course ??
      "",
    experience: item.experience ?? item.experienceYears ?? "",
    status:
      String(item.status ?? "Active").toLowerCase() === "inactive"
        ? "Inactive"
        : "Active",
  };
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
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

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function InstructorModal({
  initialData,
  onClose,
  onSubmit,
  saving,
  mode,
}) {
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

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name || !email || !phone || !form.specialization.trim()) {
      setFormError(
        "Name, email, phone aur specialization bharna zaroori hai."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Valid email address enter karein.");
      return;
    }

    if (!/^[+\d\s()-]{7,20}$/.test(phone)) {
      setFormError("Valid phone number enter karein.");
      return;
    }

    if (
      form.experience !== "" &&
      (!Number.isFinite(Number(form.experience)) ||
        Number(form.experience) < 0 ||
        Number(form.experience) > 60)
    ) {
      setFormError("Experience 0 se 60 years ke beech hona chahiye.");
      return;
    }

    onSubmit({
      ...form,
      name,
      email,
      phone,
      qualification: form.qualification.trim(),
      specialization: form.specialization.trim(),
      experience:
        form.experience === "" ? "" : Number(form.experience),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/20 p-3 text-blue-300">
              <UserPlus size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {mode === "edit" ? "Edit Instructor" : "Add Instructor"}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Enter instructor information below.
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
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter instructor name"
                required
                maxLength={100}
              />

              <InputField
                label="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="instructor@example.com"
                type="email"
                required
                maxLength={150}
              />

              <InputField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                type="tel"
                required
                maxLength={20}
              />

              <InputField
                label="Qualification"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g. MCA, B.Tech"
                maxLength={150}
              />

              <InputField
                label="Specialization / Subject"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g. Web Development"
                required
                maxLength={150}
              />

              <InputField
                label="Experience (Years)"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. 3"
                type="number"
                min="0"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Instructor Status
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
                  ? "Update Instructor"
                  : "Save Instructor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailsModal({ instructor, onClose }) {
  if (!instructor) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
          <h2 className="text-xl font-bold">Instructor Profile</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Close details"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">
              {instructor.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-xl font-bold text-slate-900">
                {instructor.name}
              </h3>
              <div className="mt-2">
                <StatusBadge status={instructor.status} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <DetailRow icon={Mail} label="Email" value={instructor.email} />
            <DetailRow icon={Phone} label="Phone" value={instructor.phone} />
            <DetailRow
              icon={GraduationCap}
              label="Qualification"
              value={instructor.qualification}
            />
            <DetailRow
              icon={BookOpen}
              label="Specialization"
              value={instructor.specialization}
            />
            <DetailRow
              icon={Briefcase}
              label="Experience"
              value={
                instructor.experience === "" ||
                instructor.experience == null
                  ? "Not provided"
                  : `${instructor.experience} years`
              }
            />
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-900">
          {value || "Not provided"}
        </p>
      </div>
    </div>
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

export default function AddInstructor() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [viewingInstructor, setViewingInstructor] = useState(null);

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/add-instructor");
      const records = extractInstructors(response);

      setInstructors(records.map(normalizeInstructor));
    } catch (err) {
      setError(
        err.message ||
          "Instructors load nahi ho paaye. Backend API check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(
    () => ({
      total: instructors.length,
      active: instructors.filter((item) => item.status === "Active").length,
      inactive: instructors.filter((item) => item.status === "Inactive")
        .length,
      specializations: new Set(
        instructors
          .map((item) => item.specialization.trim().toLowerCase())
          .filter(Boolean)
      ).size,
    }),
    [instructors]
  );

  const filteredInstructors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return instructors.filter((item) => {
      const matchesSearch = [
        item.name,
        item.email,
        item.phone,
        item.qualification,
        item.specialization,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [instructors, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInstructors.length / PAGE_SIZE)
  );

  const visibleInstructors = filteredInstructors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleSave(formData) {
    setSaving(true);
    setError("");

    try {
      if (editingInstructor) {
        await apiRequest(
          `/add-instructor/${encodeURIComponent(editingInstructor.id)}`,
          {
            method: "PATCH",
            body: JSON.stringify(formData),
          }
        );

        setNotice("Instructor updated successfully.");
      } else {
        await apiRequest("/add-instructor", {
          method: "POST",
          body: JSON.stringify(formData),
        });

        setNotice("Instructor added successfully.");
      }

      setFormOpen(false);
      setEditingInstructor(null);

      await fetchInstructors();
    } catch (err) {
      setError(
        err.message ||
          "Instructor save nahi hua. Backend API check karein."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(instructor) {
    const confirmed = window.confirm(
      `Kya aap ${instructor.name} ko delete karna chahte hain?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(
        `/add-instructor/${encodeURIComponent(instructor.id)}`,
        { method: "DELETE" }
      );

      setInstructors((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(instructor.id)
        )
      );

      setNotice("Instructor deleted successfully.");
    } catch (err) {
      setError(
        err.message ||
          "Instructor delete nahi hua. Backend API check karein."
      );
    }
  }

  function exportCSV() {
    const headers = [
      "Instructor ID",
      "Name",
      "Email",
      "Phone",
      "Qualification",
      "Specialization",
      "Experience",
      "Status",
    ];

    const rows = filteredInstructors.map((item) => [
      item.id,
      item.name,
      item.email,
      item.phone,
      item.qualification,
      item.specialization,
      item.experience,
      item.status,
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
    anchor.download = "joborbit-instructors.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function openAddForm() {
    setEditingInstructor(null);
    setFormOpen(true);
  }

  function openEditForm(instructor) {
    setEditingInstructor(instructor);
    setFormOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TrainingNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <GraduationCap size={19} />
              <span>Training Institute Portal</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Instructor Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Add instructors, manage their profiles, update information,
              and organize your training team.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchInstructors}
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
              disabled={filteredInstructors.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <UserPlus size={18} />
              Add Instructor
            </button>
          </div>
        </div>

        {/* Alerts */}
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
            title="Total Instructors"
            value={stats.total}
            icon={Users}
            color="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Active Instructors"
            value={stats.active}
            icon={CheckCircle}
            color="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            title="Inactive Instructors"
            value={stats.inactive}
            icon={AlertCircle}
            color="bg-amber-100 text-amber-700"
          />

          <StatCard
            title="Specializations"
            value={stats.specializations}
            icon={BookOpen}
            color="bg-violet-100 text-violet-700"
          />
        </section>

        {/* Search and Filters */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, phone, specialization..."
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
            <p className="text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredInstructors.length}
              </span>{" "}
              instructors
            </p>

            {(search || statusFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5">
            <h2 className="text-lg font-bold">All Instructors</h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage registered instructors.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
              <LoaderCircle
                size={36}
                className="animate-spin text-blue-600"
              />
              <p className="text-sm text-slate-500">
                Loading instructors...
              </p>
            </div>
          ) : visibleInstructors.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-500">
                <Users size={32} />
              </div>

              <h3 className="text-lg font-bold">No Instructors Found</h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {instructors.length === 0
                  ? "No instructor records were returned by the backend. Add an instructor to get started."
                  : "Your search or status filter does not match any instructors."}
              </p>

              {instructors.length === 0 ? (
                <button
                  onClick={openAddForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <UserPlus size={17} />
                  Add First Instructor
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
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
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Instructor</th>
                      <th className="px-5 py-4 font-semibold">Contact</th>
                      <th className="px-5 py-4 font-semibold">Specialization</th>
                      <th className="px-5 py-4 font-semibold">Experience</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleInstructors.map((instructor) => (
                      <tr
                        key={instructor.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                              {instructor.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "IN"}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {instructor.name || "Unnamed Instructor"}
                              </p>

                              <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                {instructor.qualification || "Qualification not provided"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="flex items-center gap-2 text-sm text-slate-700">
                            <Mail size={15} className="shrink-0 text-slate-400" />
                            <span className="max-w-xs truncate">
                              {instructor.email || "No email"}
                            </span>
                          </p>

                          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <Phone size={15} className="shrink-0" />
                            {instructor.phone || "No phone"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium text-slate-800">
                            {instructor.specialization || "Not specified"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {instructor.experience === "" ||
                          instructor.experience == null
                            ? "—"
                            : `${instructor.experience} years`}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={instructor.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingInstructor(instructor)}
                              title="View Details"
                              aria-label="View instructor details"
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              onClick={() => openEditForm(instructor)}
                              title="Edit Instructor"
                              aria-label="Edit instructor"
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(instructor)}
                              title="Delete Instructor"
                              aria-label="Delete instructor"
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
          JobOrbit Training Institute Portal · Instructor Management
        </p>
      </main>

      {formOpen && (
        <InstructorModal
          initialData={editingInstructor}
          mode={editingInstructor ? "edit" : "add"}
          saving={saving}
          onClose={() => {
            if (!saving) {
              setFormOpen(false);
              setEditingInstructor(null);
            }
          }}
          onSubmit={handleSave}
        />
      )}

      {viewingInstructor && (
        <DetailsModal
          instructor={viewingInstructor}
          onClose={() => setViewingInstructor(null)}
        />
      )}
    </div>
  );
}
