
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const initialForm = {
  title: "", description: "", location: "", jobType: "full-time",
  experience: "", salaryMin: "", salaryMax: "", skills: "",
  qualification: "", vacancies: 1, applicationDeadline: "", status: "draft"
};

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Login token nahi mila. Please login again.");

      const response = await fetch(`${API_URL}/api/jobs/${id}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Job details load nahi hui.");

      const job = data.job;
      if (!job) throw new Error("Job data nahi mila.");

      setForm({
        ...initialForm,
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        jobType: job.jobType || "full-time",
        experience: job.experience || "",
        salaryMin: job.salaryMin ?? "",
        salaryMax: job.salaryMax ?? "",
        skills: job.skills || "",
        qualification: job.qualification || "",
        vacancies: job.vacancies ?? job.openings ?? 1,
        applicationDeadline: job.applicationDeadline
          ? String(job.applicationDeadline).slice(0, 10)
          : "",
        status: job.status || "draft"
      });
    } catch (err) {
      setError(err.message || "Job load nahi hui.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Login token nahi mila. Please login again.");

      const payload = {
        ...form,
        salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
        salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
        vacancies: Number(form.vacancies || 1)
      };

      const response = await fetch(`${API_URL}/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Job update nahi hui.");

      alert(data.message || "Job successfully update ho gayi!");
      navigate("/company/jobs");
    } catch (err) {
      setError(err.message || "Update karte waqt error aaya.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500";

  if (loading) return <div className="p-10 text-center text-slate-500">Loading job details...</div>;

  if (error && !form.title) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
        <button onClick={loadJob} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-white">Try Again</button>
        <Link to="/company/jobs" className="ml-4 text-blue-600">Back to Jobs</Link>
      </div>
    );
  }

  const fields = [
    ["Job Title *", "title"],
    ["Location", "location"],
    ["Experience", "experience"],
    ["Minimum Salary", "salaryMin", "number"],
    ["Maximum Salary", "salaryMax", "number"],
    ["Vacancies", "vacancies", "number"],
    ["Qualification", "qualification"],
    ["Skills", "skills"]
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/company/jobs" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600">
          <ArrowLeft size={17} /> Back to Job Management
        </Link>

        <h1 className="text-3xl font-bold text-slate-900">Edit Job</h1>
        <p className="mb-6 mt-2 text-slate-500">Update your job posting details.</p>

        {error && <div className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map(([label, name, type]) => (
              <label key={name} className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  name={name}
                  type={type || "text"}
                  value={form[name]}
                  onChange={handleChange}
                  min={type === "number" ? 0 : undefined}
                  required={name === "title"}
                  className={inputClass}
                />
              </label>
            ))}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Job Type</span>
              <select name="jobType" value={form.jobType} onChange={handleChange} className={inputClass}>
                {["full-time", "part-time", "internship", "contract", "remote"].map(type =>
                  <option key={type} value={type}>{type}</option>
                )}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Application Deadline</span>
              <input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} className={inputClass} />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Status</span>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Job Description *</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows={7} required className={inputClass} />
          </label>

          <div className="flex justify-end gap-3 border-t pt-5">
            <button type="button" onClick={() => navigate("/company/jobs")} className="rounded-xl border px-5 py-3 font-semibold">
              Cancel
            </button>
            <button disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60">
              <Save size={17} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
