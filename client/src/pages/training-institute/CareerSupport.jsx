import { useCallback, useEffect, useMemo, useState } from "react";
import TrainingNavbar from "./TrainingNavbar";
import {
  Search,
  RefreshCw,
  BriefcaseBusiness,
  Users,
  Clock,
  CheckCircle2,
  Eye,
  X,
  Download,
  AlertCircle,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  Filter,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/$/, "");

const ENDPOINT = "/training/career-support";

const STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Resolved",
  "Rejected",
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
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

  const possibleLists = [
    payload?.data,
    payload?.requests,
    payload?.careerSupport,
    payload?.applications,
    payload?.results,
  ];

  for (const item of possibleLists) {
    if (Array.isArray(item)) return item;
  }

  if (payload?.data && Array.isArray(payload.data.rows)) {
    return payload.data.rows;
  }

  if (payload?.data && Array.isArray(payload.data.results)) {
    return payload.data.results;
  }

  return [];
}

function getId(item) {
  return item?.id ?? item?._id ?? item?.requestId;
}

function getStatus(item) {
  const raw = String(item?.status || "Pending").toLowerCase();

  if (raw === "in progress" || raw === "in_progress") {
    return "In Progress";
  }

  if (raw === "resolved" || raw === "completed") {
    return "Resolved";
  }

  if (raw === "rejected" || raw === "declined") {
    return "Rejected";
  }

  return "Pending";
}

function getStudentName(item) {
  return (
    item?.studentName ||
    item?.name ||
    item?.student?.name ||
    item?.user?.name ||
    item?.fullName ||
    "Unnamed Student"
  );
}

function getCourseName(item) {
  return (
    item?.courseName ||
    item?.course ||
    item?.program ||
    item?.student?.course ||
    "Not specified"
  );
}

function getRequestTitle(item) {
  return (
    item?.subject ||
    item?.title ||
    item?.careerGoal ||
    item?.supportType ||
    item?.category ||
    "Career Guidance Request"
  );
}

function getDate(item) {
  const value =
    item?.createdAt ||
    item?.requestDate ||
    item?.date ||
    item?.updatedAt;

  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export default function CareerSupport() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;

  const apiRequest = useCallback(async (path, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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

  const loadRequests = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const payload = await apiRequest(ENDPOINT);
        setRequests(normalizeList(payload));
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Career support requests load nahi ho sake."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiRequest]
  );

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(
      (item) => getStatus(item) === "Pending"
    ).length;
    const inProgress = requests.filter(
      (item) => getStatus(item) === "In Progress"
    ).length;
    const resolved = requests.filter(
      (item) => getStatus(item) === "Resolved"
    ).length;

    return { total, pending, inProgress, resolved };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((item) => {
      const searchableText = [
        getStudentName(item),
        getCourseName(item),
        getRequestTitle(item),
        item?.email,
        item?.student?.email,
        item?.phone,
        item?.student?.phone,
        item?.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        getStatus(item) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  async function updateStatus(item, newStatus) {
    const id = getId(item);

    if (id === undefined || id === null) {
      setError(
        "Is request ki ID nahi mili. Backend response mein id field check karein."
      );
      return;
    }

    const previousRequests = requests;
    setUpdatingId(id);
    setError("");

    setRequests((current) =>
      current.map((request) =>
        String(getId(request)) === String(id)
          ? { ...request, status: newStatus }
          : request
      )
    );

    try {
      const payload = await apiRequest(
        `${ENDPOINT}/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const updatedItem =
        payload?.data?.request ||
        payload?.data ||
        payload?.request ||
        payload?.careerSupport;

      if (updatedItem && typeof updatedItem === "object") {
        setRequests((current) =>
          current.map((request) =>
            String(getId(request)) === String(id)
              ? { ...request, ...updatedItem, status: newStatus }
              : request
          )
        );
      }

      setSelectedRequest((current) =>
        current && String(getId(current)) === String(id)
          ? { ...current, status: newStatus }
          : current
      );
    } catch (err) {
      setRequests(previousRequests);
      setError(
        getErrorMessage(
          err,
          "Status update nahi ho saka. Backend API check karein."
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function exportCSV() {
    const columns = [
      ["Student", getStudentName],
      ["Email", (item) => item?.email || item?.student?.email || ""],
      ["Phone", (item) => item?.phone || item?.student?.phone || ""],
      ["Course", getCourseName],
      ["Request", getRequestTitle],
      ["Status", getStatus],
      ["Date", getDate],
      ["Description", (item) => item?.description || item?.message || ""],
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      columns.map(([heading]) => escapeCSV(heading)).join(","),
      ...filteredRequests.map((item) =>
        columns
          .map(([, getter]) => escapeCSV(getter(item)))
          .join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF" + rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "career-support-requests.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const statCards = [
    {
      label: "Total Requests",
      value: stats.total,
      icon: BriefcaseBusiness,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <TrainingNavbar />

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <BriefcaseBusiness size={17} />
              Training Institute / Career Support
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Career Support
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Students ki career guidance requests dekhein, unka
              status manage karein aur support progress track karein.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadRequests(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
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
              disabled={!filteredRequests.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
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

        {/* Main table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Career Support Requests
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Total {filteredRequests.length} matching requests
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
                    placeholder="Search student, course..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-64"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-44"
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
          ) : filteredRequests.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BriefcaseBusiness size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No career support requests found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Abhi koi request available nahi hai, ya aapke search
                aur filters se match nahi mila.
              </p>

              {(search || statusFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Student</th>
                      <th className="px-5 py-4 font-semibold">Request</th>
                      <th className="px-5 py-4 font-semibold">Course</th>
                      <th className="px-5 py-4 font-semibold">Date</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedRequests.map((item, index) => {
                      const id = getId(item) ?? `${currentPage}-${index}`;
                      const status = getStatus(item);

                      return (
                        <tr
                          key={id}
                          className="transition hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700">
                                {getStudentName(item)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {getStudentName(item)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {item?.email ||
                                    item?.student?.email ||
                                    "Email not provided"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-[220px] truncate text-sm font-medium text-slate-800">
                              {getRequestTitle(item)}
                            </p>
                            <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                              {item?.description ||
                                item?.message ||
                                "No description"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {getCourseName(item)}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {getDate(item)}
                          </td>

                          <td className="px-5 py-4">
                            <select
                              aria-label={`Status for ${getStudentName(item)}`}
                              value={status}
                              disabled={updatingId === getId(item)}
                              onChange={(event) =>
                                updateStatus(item, event.target.value)
                              }
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset outline-none disabled:opacity-50 ${
                                STATUS_STYLES[status]
                              }`}
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(item)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Eye size={15} />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  {filteredRequests.length
                    ? (currentPage - 1) * PAGE_SIZE + 1
                    : 0}
                  {"–"}
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredRequests.length
                  )}{" "}
                  of {filteredRequests.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setPage((value) => Math.max(1, value - 1))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Request details modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="career-support-modal-title"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Career Support
                </p>

                <h2
                  id="career-support-modal-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  Request Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
                  {getStudentName(selectedRequest)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {getStudentName(selectedRequest)}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {getCourseName(selectedRequest)}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                    STATUS_STYLES[getStatus(selectedRequest)]
                  }`}
                >
                  {getStatus(selectedRequest)}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  icon={Mail}
                  label="Email"
                  value={
                    selectedRequest?.email ||
                    selectedRequest?.student?.email
                  }
                />

                <DetailField
                  icon={Phone}
                  label="Phone"
                  value={
                    selectedRequest?.phone ||
                    selectedRequest?.student?.phone
                  }
                />

                <DetailField
                  icon={GraduationCap}
                  label="Course"
                  value={getCourseName(selectedRequest)}
                />

                <DetailField
                  icon={CalendarDays}
                  label="Request Date"
                  value={getDate(selectedRequest)}
                />

                <DetailField
                  icon={BriefcaseBusiness}
                  label="Career Goal / Request"
                  value={getRequestTitle(selectedRequest)}
                />

                <DetailField
                  icon={MessageSquare}
                  label="Request ID"
                  value={getId(selectedRequest)}
                />
              </div>

              <div>
                <h4 className="mb-2 text-sm font-bold text-slate-800">
                  Request Description
                </h4>

                <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  {selectedRequest?.description ||
                    selectedRequest?.message ||
                    selectedRequest?.details ||
                    "Student ne koi description provide nahi ki hai."}
                </div>
              </div>

              {selectedRequest?.resumeUrl && (
                <a
                  href={selectedRequest.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View Resume <ExternalLink size={15} />
                </a>
              )}

              <div>
                <label
                  htmlFor="career-status"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Update Request Status
                </label>

                <select
                  id="career-status"
                  value={getStatus(selectedRequest)}
                  disabled={updatingId === getId(selectedRequest)}
                  onChange={(event) =>
                    updateStatus(selectedRequest, event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Status update server par save hone ke liye backend
                  PATCH endpoint configured hona chahiye.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
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
