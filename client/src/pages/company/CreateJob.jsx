
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Send } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const initialForm = {
  title: "",
  description: "",
  location: "",
  jobType: "full-time",
  experience: "",
  salaryMin: "",
  salaryMax: "",
  skills: "",
  qualification: "",
  vacancies: "1",
  applicationDeadline: "",
  status: "published"
};

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      if (!token) throw new Error("Login token nahi mila. Please login again.");

      const payload = {
        ...form,
        salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
        salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
        vacancies: Number(form.vacancies || 1)
      };

      const response = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Job create nahi hui.");

      alert(data.message || "Job successfully create ho gayi!");
      navigate("/company/jobs");
    } catch (err) {
      setError(err.message || "Server se connect nahi ho paya.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100";

  const fields = [
    { label: "Job Title *", name: "title", placeholder: "Frontend Developer", required: true },
    { label: "Location", name: "location", placeholder: "Lucknow / Remote" },
    { label: "Experience", name: "experience", placeholder: "Fresher / 0–2 years" },
    { label: "Minimum Salary (₹)", name: "salaryMin", type: "number", min: 0 },
    { label: "Maximum Salary (₹)", name: "salaryMax", type: "number", min: 0 },
    { label: "Vacancies", name: "vacancies", type: "number", min: 1, required: true },
    { label: "Qualification", name: "qualification", placeholder: "MCA / B.Tech" },
    { label: "Skills", name: "skills", placeholder: "React, JavaScript, CSS" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/company/jobs" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600">
          <ArrowLeft size={17} /> Back to Job Management
        </Link>

        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700"><BriefcaseBusiness size={26} /></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create a Job</h1>
            <p className="mt-1 text-slate-500">Publish a new opportunity on JobOrbit.</p>
          </div>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map(field => (
              <label key={field.name} className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                <input
                  className={inputClass}
                  name={field.name}
                  type={field.type || "text"}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder || ""}
                  min={field.min}
                  required={field.required || false}
                />
              </label>
            ))}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Job Type *</span>
              <select name="jobType" value={form.jobType} onChange={handleChange} className={inputClass} required>
                {["full-time", "part-time", "internship", "contract", "remote"].map(type =>
                  <option key={type} value={type}>{type}</option>
                )}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Application Deadline</span>
              <input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} min={new Date().toISOString().split("T")[0]} className={inputClass} />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Job Description *</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows={7} required minLength={10} placeholder="Responsibilities, required skills, qualifications and benefits..." className={inputClass} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Publishing Status</span>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="published">Publish now</option>
              <option value="draft">Save as draft</option>
            </select>
          </label>

          <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
            <button type="button" onClick={() => navigate("/company/jobs")} className="rounded-xl border px-5 py-3 font-semibold text-slate-700">
              Cancel
            </button>
            <button disabled={loading} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              <Send size={17} /> {loading ? "Submitting..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
