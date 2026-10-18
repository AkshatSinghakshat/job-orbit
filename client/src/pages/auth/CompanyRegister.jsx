
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BriefcaseBusiness,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  Building2,
  Loader2,
  Users,
} from "lucide-react";

import EmailOtpVerification from "./EmailOtpVerification";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function CompanyRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    officialEmail: "",
    password: "",
    confirmPassword: "",
    phone: "",
    website: "",
    industry: "",
    companySize: "",
    location: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.companyName.trim() ||
      !form.email.trim() ||
      !form.officialEmail.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(form.email.trim()) ||
      !emailRegex.test(form.officialEmail.trim())
    ) {
      setError("Please enter valid email addresses.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      form.website.trim() &&
      !/^https?:\/\/.+\..+/i.test(form.website.trim())
    ) {
      setError(
        "Please enter a valid website URL starting with https:// or http://."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim().toLowerCase(),
        officialEmail: form.officialEmail.trim().toLowerCase(),
        password: form.password,
        role: "company",
        phone: form.phone.trim(),
        website: form.website.trim(),
        industry: form.industry.trim(),
        companySize: form.companySize,
        location: form.location.trim(),
      };

      const response = await axios.post(
        `${API_URL}/auth/register`,
        payload
      );

      if (
        response.data?.success &&
        response.data?.requiresOtp
      ) {
        setOtpEmail(form.email.trim().toLowerCase());
        setSuccess(
          response.data.message ||
            "OTP sent successfully. Please verify your email."
        );
      } else if (response.data?.success) {
        // OTP flow should normally return requiresOtp: true.
        // Do not silently bypass email verification.
        setError(
          "The server did not start email verification. Please check your backend OTP registration route."
        );
      } else {
        setError(
          response.data?.message ||
            "Company registration could not be started."
        );
      }
    } catch (err) {
      console.error(
        "Company Registration Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show OTP verification after the backend sends the OTP.
  if (otpEmail) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <button
            type="button"
            onClick={() => {
              setOtpEmail("");
              setError("");
              setSuccess("");
            }}
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to registration
          </button>

          <EmailOtpVerification email={otpEmail} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="rounded-2xl bg-white p-7 shadow-2xl md:p-9">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BriefcaseBusiness size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Company Registration
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Create your JobOrbit company account
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact Person */}
            <Input
              icon={Users}
              label="Contact Person Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />

            {/* Company Name */}
            <Input
              icon={Building2}
              label="Company Name"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              autoComplete="organization"
              required
            />

            {/* Login Email */}
            <Input
              icon={Mail}
              label="Login Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your login email"
              autoComplete="email"
              required
            />

            {/* Official Email */}
            <Input
              icon={Mail}
              label="Official Company Email"
              type="email"
              name="officialEmail"
              value={form.officialEmail}
              onChange={handleChange}
              placeholder="hr@company.com"
              autoComplete="email"
              required
            />

            {/* Phone */}
            <Input
              icon={Phone}
              label="Company Phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter company phone"
              autoComplete="tel"
            />

            {/* Passwords */}
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                icon={Lock}
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                required
              />

              <Input
                icon={Lock}
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                autoComplete="new-password"
                required
              />
            </div>

            {/* Website */}
            <Input
              icon={Globe}
              label="Company Website"
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
              autoComplete="url"
            />

            {/* Industry */}
            <Input
              icon={Building2}
              label="Industry"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="e.g. Information Technology"
            />

            {/* Company Size */}
            <div>
              <label
                htmlFor="companySize"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Company Size
              </label>

              <select
                id="companySize"
                name="companySize"
                value={form.companySize}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select company size</option>
                <option value="1-10">1–10 employees</option>
                <option value="11-50">11–50 employees</option>
                <option value="51-200">51–200 employees</option>
                <option value="201-500">201–500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            {/* Location */}
            <Input
              icon={MapPin}
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City, State, Country"
              autoComplete="address-level2"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Register & Send Email OTP"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
function Input({
  icon: Icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={name === "password" ? 8 : undefined}
          className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

export default CompanyRegister;
