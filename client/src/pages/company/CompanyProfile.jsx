
import { useState } from "react";
import { Building2, Globe, MapPin, BriefcaseBusiness, Pencil, Save } from "lucide-react";

export default function CompanyProfile() {
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState({
    companyName: "Tech Solutions Pvt. Ltd.",
    industry: "Information Technology",
    location: "Lucknow, Uttar Pradesh",
    website: "https://example.com",
    description: "We build modern digital products and help people grow their careers.",
    email: "hr@example.com",
    size: "11–50 employees",
  });

  const update = (e) =>
    setCompany({ ...company, [e.target.name]: e.target.value });

  const field = (label, name, placeholder = "") => (
    <label className="block space-y-2" key={name}>
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input
        name={name}
        value={company[name]}
        onChange={update}
        disabled={!editing}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-50"
      />
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600">Company Workspace</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Company Profile</h1>
            <p className="mt-2 text-slate-500">Manage your public company information.</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {editing ? <Save size={18} /> : <Pencil size={18} />}
            {editing ? "Save Preview" : "Edit Profile"}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600" />
          <div className="px-6 pb-7">
            <div className="-mt-10 mb-6 flex items-end gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-blue-50 text-blue-700 shadow">
                <Building2 size={34} />
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900">{company.companyName}</h2>
                <p className="text-sm text-slate-500">{company.industry}</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {field("Company Name", "companyName")}
              {field("Industry", "industry")}
              {field("Location", "location")}
              {field("Website", "website", "https://")}
              {field("Contact Email", "email")}
              {field("Company Size", "size")}
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-slate-600">About Company</span>
              <textarea
                name="description"
                value={company.description}
                onChange={update}
                disabled={!editing}
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-50"
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-5 border-t border-slate-100 pt-5 text-sm text-slate-500">
              <span className="flex items-center gap-2"><MapPin size={16} />{company.location}</span>
              <span className="flex items-center gap-2"><Globe size={16} />{company.website}</span>
              <span className="flex items-center gap-2"><BriefcaseBusiness size={16} />{company.size}</span>
            </div>
            {editing && <p className="mt-4 text-sm text-amber-700">Demo mode: changes are currently stored only in this page.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
