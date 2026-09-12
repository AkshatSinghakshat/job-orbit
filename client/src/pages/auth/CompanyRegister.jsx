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
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function CompanyRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    website: "",
    industry: "",
    companySize: "",
    location: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Required fields
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill all required fields");
      return;
    }

    // Password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password length
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // SEND DATA TO BACKEND
      // ========================================

      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,

          // IMPORTANT
          // Role user ko form mein nahi dikhaya gaya
          role: "company",

          phone: form.phone.trim(),
          website: form.website.trim(),
          industry: form.industry.trim(),
          companySize: form.companySize,
          location: form.location.trim(),
        }
      );

      console.log(
        "Company Registration Response:",
        response.data
      );

      // ========================================
      // SUCCESS
      // ========================================

      if (response.data.success) {
        navigate("/login", {
          state: {
            message:
              "Company account created successfully. Please login.",
          },
        });

        return;
      }

      // Backend success false
      setError(
        response.data.message ||
          "Company registration failed"
      );
    } catch (error) {
      console.error(
        "Company Registration Error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Company registration failed"
        );
      } else if (error.request) {
        setError(
          "Server is not responding. Please start the backend server."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">

        {/* ========================================
            BACK BUTTON
        ========================================= */}

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* ========================================
            CARD
        ========================================= */}

        <div className="rounded-2xl bg-white p-7 shadow-2xl md:p-9">

          {/* ========================================
              HEADER
          ========================================= */}

          <div className="mb-8 flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BriefcaseBusiness size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Company Registration
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create your company account
              </p>
            </div>

          </div>

          {/* ========================================
              ERROR
          ========================================= */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ========================================
              FORM
          ========================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Company Name */}

            <Input
              icon={Building2}
              label="Company Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter company name"
              autoComplete="organization"
              required
            />

            {/* Email */}

            <Input
              icon={Mail}
              label="Official Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="company@example.com"
              autoComplete="email"
              required
            />

            {/* Phone */}

            <Input
              icon={Phone}
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter company phone"
              autoComplete="tel"
            />

            {/* Password */}

            <div className="grid gap-5 md:grid-cols-2">

              <Input
                icon={Lock}
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create password"
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
                <option value="">
                  Select company size
                </option>

                <option value="1-10">
                  1-10 employees
                </option>

                <option value="11-50">
                  11-50 employees
                </option>

                <option value="51-200">
                  51-200 employees
                </option>

                <option value="201-500">
                  201-500 employees
                </option>

                <option value="500+">
                  500+ employees
                </option>
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

            {/* ========================================
                SUBMIT BUTTON
            ========================================= */}

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
                  Creating Account...
                </>
              ) : (
                "Create Company Account"
              )}
            </button>

          </form>

          {/* ========================================
              LOGIN LINK
          ========================================= */}

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

// ========================================
// INPUT COMPONENT
// ========================================

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
          <span className="text-red-500">
            {" "}*
          </span>
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
          className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

      </div>

    </div>
  );
}

export default CompanyRegister;