
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Search, Pencil, Trash2, BriefcaseBusiness, RefreshCw
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Login token nahi mila. Please login again.");

      const response = await fetch(`${API_URL}/api/jobs/company/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Jobs load nahi hui.");

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      setError(err.message || "Server se connect nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const updateStatus = async (job, status) => {
    try {
      setBusyId(job.id);
      const token = getToken();

      const response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Status update nahi hua.");

      setJobs(prev => prev.map(item =>
        item.id === job.id ? { ...item, ...data.job, status } : item
      ));
    } catch (err) {
      alert(err.message);
      loadJobs();
    } finally {
      setBusyId(null);
    }
  };

  const deleteJob = async (job) => {
    if (!window.confirm(`"${job.title}" ko delete karna hai?`)) return;

    try {
      setBusyId(job.id);
      const response = await fetch(`${API_URL}/api/jobs/${job.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Job delete nahi hui.");

      setJobs(prev => prev.filter(item => item.id !== job.id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const filteredJobs = jobs.filter(job =>
    `${job.title || ""} ${job.location || ""} ${job.jobType || ""}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">Company Workspace</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Job Management</h1>
            <p className="mt-2 text-slate-500">Manage your job postings and hiring.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadJobs} className="rounded-xl border bg-white px-4 py-3" title="Refresh">
              <RefreshCw size={19} />
            </button>
            <Link to="/company/jobs/create" className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
              <Plus size={18} /> Create Job
            </Link>
          </div>
        </div>

        <div className="my-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Total Jobs", jobs.length],
            ["Published", jobs.filter(j => j.status === "published").length],
            ["Applications", jobs.reduce((sum, j) => sum + Number(j.applicationCount || j.Applications?.length || 0), 0)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border bg-white p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-xl border bg-white px-4">
          <Search size={18} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, location or job type..." className="w-full py-4 outline-none" />
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p>{error}</p>
            <button onClick={loadJobs} className="mt-2 font-semibold underline">Try again</button>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                {["Job", "Location", "Type", "Applications", "Status", "Actions"].map(label =>
                  <th key={label} className="p-4 font-semibold">{label}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-slate-500">Loading jobs...</td></tr>
              ) : filteredJobs.map(job => (
                <tr key={job.id} className="border-t hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{job.title}</p>
                    <p className="mt-1 text-xs text-slate-500">ID: {job.id}</p>
                  </td>
                  <td className="p-4">{job.location || "Not specified"}</td>
                  <td className="p-4 capitalize">{job.jobType || "—"}</td>
                  <td className="p-4">{job.applicationCount ?? job.Applications?.length ?? 0}</td>
                  <td className="p-4">
                    <select
                      value={job.status || "draft"}
                      disabled={busyId === job.id}
                      onChange={e => updateStatus(job, e.target.value)}
                      className="rounded-lg border bg-white p-2 capitalize disabled:opacity-50"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/company/jobs/${job.id}/edit`} title="Edit job" className="text-blue-600">
                        <Pencil size={18} />
                      </Link>
                      <button disabled={busyId === job.id} onClick={() => deleteJob(job)} title="Delete job" className="text-red-600 disabled:opacity-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && filteredJobs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <BriefcaseBusiness size={34} className="mx-auto mb-3 text-slate-400" />
                    <p className="font-semibold text-slate-700">{search ? "No matching jobs found." : "No jobs found."}</p>
                    <p className="mt-1 text-slate-500">Create a job to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
