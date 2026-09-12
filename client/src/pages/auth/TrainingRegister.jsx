import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  Building2,
} from "lucide-react";

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    console.log("Training Registration:", form);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">

      <div className="mx-auto w-full max-w-2xl">

        <button
          onClick={() => navigate("/register")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="rounded-2xl bg-white p-7 shadow-2xl md:p-9">

          <div className="mb-8 flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BookOpen size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Training Institute Registration
              </h1>

              <p className="text-sm text-slate-500">
                Register your training institute
              </p>
            </div>

          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <Input
              icon={Building2}
              label="Institute Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter institute name"
              required
            />

            <Input
              icon={Mail}
              label="Official Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="institute@example.com"
              required
            />

            <Input
              icon={Phone}
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter institute phone"
            />

            <div className="grid gap-5 md:grid-cols-2">

              <Input
                icon={Lock}
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create password"
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
                required
              />

            </div>

            <Input
              icon={Globe}
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />

            <Input
              icon={BookOpen}
              label="Training Categories"
              name="categories"
              value={form.categories}
              onChange={handleChange}
              placeholder="e.g. Web Development, Java, Data Science"
            />

            <Input
              icon={MapPin}
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter institute address"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-700"
            >
              Create Training Account
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}

function Input({
  icon: Icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="relative">

        <Icon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

      </div>

    </div>
  );
}

export default TrainingRegister;