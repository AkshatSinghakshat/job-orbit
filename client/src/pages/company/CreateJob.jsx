
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Send,
  MapPin,
  Wallet,
  GraduationCap,
  CalendarDays,
  FileText,
  Users,
  Code2,
  Clock3,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

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
  status: "published",
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#293650] bg-[#0b1224] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-[#405579] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-2 block text-sm font-medium text-slate-300";

function Field({ label, icon: Icon, children, hint }) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>
        {Icon && (
          <Icon
            size={15}
            className="mr-1.5 inline-block text-slate-400"
          />
        )}
        {label}
      </span>

      {children}

      {hint && (
        <span className="mt-1.5 block text-xs text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-sm font-bold text-blue-400">
        {number}
      </div>

      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function CreateJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Login token nahi mila. Please login again."
        );
      }

      if (
        form.salaryMin !== "" &&
        form.salaryMax !== "" &&
        Number(form.salaryMax) < Number(form.salaryMin)
      ) {
        throw new Error(
          "Maximum salary, minimum salary se kam nahi ho sakti."
        );
      }

      if (
        !Number.isInteger(Number(form.vacancies)) ||
        Number(form.vacancies) < 1
      ) {
        throw new Error(
          "Vacancies kam se kam 1 honi chahiye."
        );
      }

      const payload = {
        ...form,
        salaryMin:
          form.salaryMin === "" ? null : Number(form.salaryMin),
        salaryMax:
          form.salaryMax === "" ? null : Number(form.salaryMax),
        vacancies: Number(form.vacancies || 1),
      };

      const response = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Job create nahi hui."
        );
      }

      alert(
        data.message || "Job successfully create ho gayi!"
      );

      navigate("/company/jobs");
    } catch (err) {
      setError(
        err.message || "Server se connect nahi ho paya."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d20] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Navigation Buttons */}
<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
  <Link
    to="/company/jobs"
    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
  >
    <ArrowLeft size={17} />
    Back to Job Management
  </Link>

  <Link
    to="/company/dashboard"
    className="inline-flex items-center gap-2 rounded-xl border border-[#293650] bg-[#10182e] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500/50 hover:bg-blue-600/10 hover:text-blue-400"
  >
    <LayoutDashboard size={17} />
    Dashboard
  </Link>
</div>

        {/* Page Header */}
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <BriefcaseBusiness size={26} />
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Employer Portal
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Create a Job
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Publish a new opportunity on JobOrbit.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-[#243047] bg-[#10182e] shadow-xl shadow-black/20"
        >
          {/* Job Details */}
          <section className="border-b border-[#243047] p-5 sm:p-7">
            <SectionHeading
              number="01"
              title="Job Details"
              description="Enter the basic information about the opportunity."
            />

            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <Field
                label="Job Title *"
                icon={BriefcaseBusiness}
              >
                <input
                  className={inputClass}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer"
                  maxLength={150}
                  required
                />
              </Field>

              <Field label="Location" icon={MapPin}>
                <input
                  className={inputClass}
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Lucknow / Remote"
                  maxLength={150}
                />
              </Field>

              <Field label="Experience" icon={Clock3}>
                <input
                  className={inputClass}
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Fresher / 0–2 years"
                  maxLength={100}
                />
              </Field>

              <Field label="Job Type *" icon={BriefcaseBusiness}>
                <select
                  className={inputClass}
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </Field>

              <Field
                label="Qualification"
                icon={GraduationCap}
              >
                <input
                  className={inputClass}
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="MCA / B.Tech"
                  maxLength={200}
                />
              </Field>

              <Field label="Skills" icon={Code2}>
                <input
                  className={inputClass}
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React, JavaScript, CSS"
                  maxLength={500}
                />
              </Field>
            </div>
          </section>

          {/* Salary and Vacancies */}
          <section className="border-b border-[#243047] p-5 sm:p-7">
            <SectionHeading
              number="02"
              title="Salary & Vacancies"
              description="Provide compensation and hiring information."
            />

            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <Field label="Minimum Salary (₹)" icon={Wallet}>
                <input
                  className={inputClass}
                  name="salaryMin"
                  type="number"
                  min="0"
                  step="1"
                  value={form.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g. 15000"
                />
              </Field>

              <Field label="Maximum Salary (₹)" icon={Wallet}>
                <input
                  className={inputClass}
                  name="salaryMax"
                  type="number"
                  min="0"
                  step="1"
                  value={form.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g. 30000"
                />
              </Field>

              <Field label="Vacancies" icon={Users}>
                <input
                  className={inputClass}
                  name="vacancies"
                  type="number"
                  min="1"
                  max="100000"
                  step="1"
                  value={form.vacancies}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field
                label="Application Deadline"
                icon={CalendarDays}
                hint="Optional. Select the last date to apply."
              >
                <input
                  className={inputClass}
                  type="date"
                  name="applicationDeadline"
                  value={form.applicationDeadline}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString("en-CA")}
                />
              </Field>
            </div>
          </section>

          {/* Job Description */}
          <section className="border-b border-[#243047] p-5 sm:p-7">
            <SectionHeading
              number="03"
              title="Job Description"
              description="Explain the role, responsibilities and requirements."
            />

            <Field
              label="Description *"
              icon={FileText}
              hint="Include responsibilities, required skills, qualifications and benefits."
            >
              <textarea
                className={`${inputClass} min-h-48 resize-y leading-6`}
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={7}
                minLength={10}
                maxLength={10000}
                placeholder="Responsibilities, required skills, qualifications and benefits..."
                required
              />
            </Field>
          </section>

          {/* Publishing */}
          <section className="p-5 sm:p-7">
            <SectionHeading
              number="04"
              title="Publishing Status"
              description="Choose whether to publish the job now or save it as a draft."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Choose Status">
                <select
                  className={inputClass}
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="published">Publish now</option>
                  <option value="draft">Save as draft</option>
                </select>
              </Field>

              <div className="flex items-center gap-3 rounded-xl border border-[#293650] bg-[#0b1224] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Ready to hire?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Review your details before submitting.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#243047] bg-[#0b1224] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="text-xs text-slate-500">
              * Required fields
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/company/jobs")}
                disabled={loading}
                className="rounded-xl border border-[#34415c] bg-[#10182e] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-[#18233b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={16} />
                {loading ? "Submitting..." : "Create Job"}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          JobOrbit · Connecting talent with opportunity
        </p>
      </div>
    </div>
  );
}