
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  Building2,
  Loader2,
} from "lucide-react";

import EmailOtpVerification from "./EmailOtpVerification";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function TrainingRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    website: "",
    address: "",
    categories: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      setError("Please enter a valid email address.");
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
        "Website must start with https:// or http://."
      );
      return;
    }

    try {
      setLoading(true);

      const email = form.email.trim().toLowerCase();

      const payload = {
        name: form.name.trim(),
        email,
        password: form.password,
        role: "training",
        phone: form.phone.trim(),
        website: form.website.trim(),
        address: form.address.trim(),
        categories: form.categories.trim(),
      };

      const response = await axios.post(
        `${API_URL}/auth/register`,
        payload
      );

      if (
        response.data?.success &&
        response.data?.requiresOtp
      ) {
        setOtpEmail(email);
      } else if (response.data?.success) {
        setError(
          "Email verification was not initiated. Please check your backend OTP registration route."
        );
      } else {
        setError(
          response.data?.message ||
            "Training institute registration failed."
        );
      }
    } catch (err) {
      console.error(
        "Training Registration Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show OTP verification screen
  if (otpEmail) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <button
            type="button"
            onClick={() => {
              setOtpEmail("");
              setError("");
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
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Registration Card */}
        <div className="rounded-2xl bg-white p-7 shadow-2xl md:p-9">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BookOpen size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Training Institute Registration
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create your JobOrbit training account
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Institute Name */}
            <Input
              icon={Building2}
              label="Institute Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter institute name"
              autoComplete="organization"
              required
            />

            {/* Official Email */}
            <Input
              icon={Mail}
              label="Official Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="institute@example.com"
              autoComplete="email"
              required
            />

            {/* Phone */}
            <Input
              icon={Phone}
              label="Phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter institute phone"
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
              label="Website"
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
              autoComplete="url"
            />

            {/* Categories */}
            <Input
              icon={BookOpen}
              label="Training Categories"
              name="categories"
              value={form.categories}
              onChange={handleChange}
              placeholder="Web Development, Java, Data Science"
            />

            {/* Address */}
            <Input
              icon={MapPin}
              label="Institute Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="City, State, Country"
              autoComplete="street-address"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Sending OTP...
                </>
              ) : (
                "Register & Send Email OTP"
              )}
            </button>
          </form>

          {/* Login */}
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
        {required && (
          <span className="text-red-500"> *</span>
        )}
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

export default TrainingRegister;
