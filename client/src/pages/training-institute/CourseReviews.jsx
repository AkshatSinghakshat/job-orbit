
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Star,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Eye,
  X,
} from "lucide-react";

import trainingApi from "../../services/trainingApi";

const PAGE_SIZE = 8;

const getReviewId = (review) =>
  review.id ?? review._id ?? review.reviewId;

const getReviewList = (response) => {
  const payload = response?.data ?? response;

  const reviews = Array.isArray(payload) ? payload
    : Array.isArray(payload?.reviews) ? payload.reviews
      : Array.isArray(payload?.items) ? payload.items
        : Array.isArray(payload?.results) ? payload.results : [];
  return reviews.map((review) => ({
    ...review,
    status: review.status || (review.isApproved ? "approved" : "rejected"),
  }));

};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong.";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Rating({ value = 0 }) {
  const rating = Math.min(5, Math.max(0, Number(value) || 0));

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((number) => (
        <Star
          key={number}
          size={15}
          className={
            number <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }
        />
      ))}

      <span className="ml-1 text-sm font-semibold text-gray-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  const styles = {
    approved: "bg-emerald-50 text-emerald-700",
    published: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    pending: "bg-amber-50 text-amber-700",
    flagged: "bg-orange-50 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[normalized] || "bg-gray-100 text-gray-700"
      }`}
    >
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}

export default function CourseReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadReviews = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setNotice("");

    try {
      const response = await trainingApi.get(
        "/training/reviews"
      );

      setReviews(getReviewList(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((review) => {
        const searchable = [
          review.studentName,
          review.student?.name,
          review.user?.name,
          review.courseName,
          review.course?.title,
          review.comment,
          review.review,
          review.title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    if (ratingFilter !== "all") {
      result = result.filter(
        (review) => Number(review.rating) === Number(ratingFilter)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (review) =>
          String(review.status || "pending").toLowerCase() ===
          statusFilter
      );
    }

    result.sort((a, b) => {
      if (sortOrder === "highest") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }

      if (sortOrder === "lowest") {
        return Number(a.rating || 0) - Number(b.rating || 0);
      }

      const dateA = new Date(
        a.createdAt || a.date || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.date || 0
      ).getTime();

      return sortOrder === "oldest"
        ? dateA - dateB
        : dateB - dateA;
    });

    return result;
  }, [reviews, search, ratingFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleReviews = filteredReviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, ratingFilter, statusFilter, sortOrder]);

  const stats = useMemo(() => {
    const total = reviews.length;

    const average =
      total > 0
        ? reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / total
        : 0;

    const pending = reviews.filter(
      (review) =>
        String(review.status || "pending").toLowerCase() === "pending"
    ).length;

    const approved = reviews.filter((review) =>
      ["approved", "published"].includes(
        String(review.status || "").toLowerCase()
      )
    ).length;

    return {
      total,
      average: average.toFixed(1),
      pending,
      approved,
    };
  }, [reviews]);

  const updateReviewStatus = async (review, status) => {
    const id = getReviewId(review);

    if (id == null) {
      setError("Review ID missing. Backend response check karo.");
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await trainingApi.patch(
        `/training/reviews/${encodeURIComponent(id)}`,
        { status }
      );

      setReviews((previous) =>
        previous.map((item) =>
          getReviewId(item) === id
            ? { ...item, status, isApproved: status === "approved" }
            : item
        )
      );

      setNotice(`Review ${status} successfully.`);
    } catch (err) {
      setError(
        `Review status update failed: ${getErrorMessage(err)}`
      );
    } finally {
      setBusyId(null);
    }
  };

  const deleteReview = async () => {
    if (!confirmDelete) return;

    const id = getReviewId(confirmDelete);

    if (id == null) {
      setError("Review ID missing. Delete nahi kiya ja sakta.");
      setConfirmDelete(null);
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await trainingApi.delete(
        `/training/reviews/${encodeURIComponent(id)}`
      );

      setReviews((previous) =>
        previous.filter((review) => getReviewId(review) !== id)
      );

      setNotice("Review deleted successfully.");
      setConfirmDelete(null);

      if (selectedReview && getReviewId(selectedReview) === id) {
        setSelectedReview(null);
      }
    } catch (err) {
      setError(`Review delete failed: ${getErrorMessage(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-indigo-600">
              <MessageSquare size={17} />
              Training Institute
            </div>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Course Reviews
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review student feedback and manage course ratings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadReviews(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Request failed</p>
              <p className="mt-1 break-words">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {notice}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Reviews",
              value: stats.total,
              icon: MessageSquare,
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Average Rating",
              value: `${stats.average} / 5`,
              icon: Star,
              color: "bg-amber-50 text-amber-600",
            },
            {
              label: "Pending Reviews",
              value: stats.pending,
              icon: AlertCircle,
              color: "bg-orange-50 text-orange-600",
            },
            {
              label: "Approved Reviews",
              value: stats.approved,
              icon: CheckCircle,
              color: "bg-emerald-50 text-emerald-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">
                      {item.label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {loading ? "—" : item.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter size={18} />
            Search and Filters
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student or course..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Student Reviews
            </h2>

            <span className="text-sm text-slate-500">
              {filteredReviews.length} results
            </span>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : visibleReviews.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <MessageSquare size={27} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No reviews found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Reviews API से डेटा नहीं मिला या फिल्टर के अनुसार कोई
                review उपलब्ध नहीं है।
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRatingFilter("all");
                  setStatusFilter("all");
                  setSortOrder("newest");
                  loadReviews(true);
                }}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Student / Course</th>
                      <th className="px-5 py-4">Rating</th>
                      <th className="px-5 py-4">Review</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleReviews.map((review, index) => {
                      const id = getReviewId(review) ?? index;
                      const student =
                        review.studentName ||
                        review.student?.name ||
                        review.user?.name ||
                        "Student";

                      const course =
                        review.courseName ||
                        review.course?.title ||
                        "Course";

                      const comment =
                        review.comment ||
                        review.review ||
                        review.title ||
                        "No written feedback";

                      const status = String(
                        review.status || "pending"
                      ).toLowerCase();

                      return (
                        <tr
                          key={id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800">
                              {student}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {course}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <Rating value={review.rating} />
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <p className="truncate text-sm text-slate-600">
                              {comment}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                            {formatDate(
                              review.createdAt || review.date
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={status} />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                title="View Review"
                                onClick={() =>
                                  setSelectedReview(review)
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                              >
                                <Eye size={16} />
                              </button>

                              {status !== "approved" &&
                                status !== "published" && (
                                  <button
                                    type="button"
                                    title="Approve Review"
                                    disabled={busyId === getReviewId(review)}
                                    onClick={() =>
                                      updateReviewStatus(
                                        review,
                                        "approved"
                                      )
                                    }
                                    className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}

                              {status !== "rejected" && (
                                <button
                                  type="button"
                                  title="Reject Review"
                                  disabled={busyId === getReviewId(review)}
                                  onClick={() =>
                                    updateReviewStatus(
                                      review,
                                      "rejected"
                                    )
                                  }
                                  className="rounded-lg border border-orange-200 p-2 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}

                              <button
                                type="button"
                                title="Delete Review"
                                disabled={busyId === getReviewId(review)}
                                onClick={() =>
                                  setConfirmDelete(review)
                                }
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
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

              {/* Mobile and tablet cards */}
              <div className="grid gap-4 p-4 lg:hidden">
                {visibleReviews.map((review, index) => {
                  const id = getReviewId(review) ?? index;
                  const status = String(
                    review.status || "pending"
                  ).toLowerCase();

                  return (
                    <article
                      key={id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {review.studentName ||
                              review.student?.name ||
                              review.user?.name ||
                              "Student"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {review.courseName ||
                              review.course?.title ||
                              "Course"}
                          </p>
                        </div>

                        <StatusBadge status={status} />
                      </div>

                      <div className="mt-3">
                        <Rating value={review.rating} />
                      </div>

                      <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                        {review.comment ||
                          review.review ||
                          "No written feedback"}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        {formatDate(
                          review.createdAt || review.date
                        )}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReview(review)}
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          disabled={busyId === getReviewId(review)}
                          onClick={() =>
                            updateReviewStatus(review, "approved")
                          }
                          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={busyId === getReviewId(review)}
                          onClick={() =>
                            updateReviewStatus(review, "rejected")
                          }
                          className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmDelete(review)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  {filteredReviews.length === 0
                    ? 0
                    : (currentPage - 1) * PAGE_SIZE + 1}
                  {" – "}
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredReviews.length
                  )}{" "}
                  of {filteredReviews.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setPage((previous) => previous - 1)
                    }
                    className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="min-w-24 text-center text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((previous) => previous + 1)
                    }
                    className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Review details modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReview(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="review-dialog-title"
                className="text-xl font-bold text-slate-900"
              >
                Review Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
                aria-label="Close review details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500">Student</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedReview.studentName ||
                    selectedReview.student?.name ||
                    selectedReview.user?.name ||
                    "Student"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Course</p>
                <p className="mt-1 font-medium text-slate-800">
                  {selectedReview.courseName ||
                    selectedReview.course?.title ||
                    "Course"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Rating</p>
                <div className="mt-2">
                  <Rating value={selectedReview.rating} />
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">Review</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {selectedReview.comment ||
                    selectedReview.review ||
                    "No written feedback"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Status</p>
                <div className="mt-2">
                  <StatusBadge status={selectedReview.status} />
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">Date</p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(
                    selectedReview.createdAt || selectedReview.date
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={23} />
            </div>

            <h2
              id="delete-dialog-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Delete this review?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This action cannot be undone. The review will be deleted
              only if the backend confirms the request.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={busyId !== null}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteReview}
                disabled={busyId !== null}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busyId !== null ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
