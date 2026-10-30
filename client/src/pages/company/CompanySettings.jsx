import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Bell,
  ShieldCheck,
  Building2,
  Mail,
  BriefcaseBusiness,
  MessageCircle,
  LockKeyhole,
  Eye,
  Palette,
  Globe,
  Save,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  Smartphone,
  UserRound,
  FileText,
  Clock3,
  ChevronRight,
  Info,
  ArrowLeft,
  Monitor,
} from "lucide-react";

const STORAGE_KEY = "joborbit_company_settings";

const DEFAULT_SETTINGS = {
  companyName: "Tech Solutions Pvt. Ltd.",
  companyEmail: "",
  companyWebsite: "",
  timezone: "Asia/Kolkata",
  language: "en",

  emailNotifications: true,
  applicationAlerts: true,
  messageNotifications: true,
  jobStatusAlerts: true,
  interviewReminders: true,
  weeklyReports: false,
  marketingEmails: false,

  publicProfile: true,
  showCompanyEmail: false,
  showCompanyWebsite: true,
  allowRecruiterMessages: true,
  allowSearchIndexing: true,

  darkMode: true,
  compactLayout: false,

  twoFactorEnabled: false,
  loginAlerts: true,
  sessionNotifications: true,
};

const SECTIONS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: LockKeyhole },
];

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        checked ? "bg-blue-600" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 py-4 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-slate-800 p-2 text-slate-300">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100">
            {title}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-400">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </label>
  );
}

export default function CompanySettings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(loadSettings);
  const [activeSection, setActiveSection] = useState("general");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => setNotice(null), 3500);

    return () => clearTimeout(timer);
  }, [notice]);

  const update = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggle = (key) => {
    update(key, !settings[key]);
  };

  const notificationKeys = [
    "emailNotifications",
    "applicationAlerts",
    "messageNotifications",
    "jobStatusAlerts",
    "interviewReminders",
    "weeklyReports",
  ];

  const notificationCount = notificationKeys.filter(
    (key) => settings[key]
  ).length;

  const searchItems = useMemo(
    () => [
      {
        id: "general",
        title: "General Settings",
        keywords: "company name email website language timezone",
      },
      {
        id: "notifications",
        title: "Notification Preferences",
        keywords:
          "notifications applications messages interviews job alerts email reports",
      },
      {
        id: "privacy",
        title: "Privacy & Visibility",
        keywords: "privacy public profile website recruiter visibility",
      },
      {
        id: "appearance",
        title: "Appearance & Theme",
        keywords: "theme dark light compact layout",
      },
      {
        id: "security",
        title: "Security Settings",
        keywords: "security login session two factor authentication",
      },
    ],
    []
  );

  const filteredSections = search.trim()
    ? searchItems.filter((item) =>
        `${item.title} ${item.keywords}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : [];

  const selectSearchResult = (id) => {
    setActiveSection(id);
    setSearch("");
  };

  const saveSettings = () => {
    setSaving(true);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      setSavedAt(new Date());

      setNotice({
        type: "success",
        text: "Settings saved successfully on this device.",
      });
    } catch {
      setNotice({
        type: "error",
        text: "Unable to save settings. Check browser storage.",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Are you sure you want to restore default settings?"
    );

    if (!confirmed) return;

    setSettings({ ...DEFAULT_SETTINGS });

    setNotice({
      type: "success",
      text: "Default values restored. Click Save Changes to save them.",
    });
  };

  const cardClass =
    "rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/10 sm:p-7";

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              title="Go back"
              className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 shadow-lg transition-all duration-200 hover:-translate-x-0.5 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <ArrowLeft
                size={21}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            </button>

            {/* SETTINGS ICON */}
            <div className="hidden rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400 sm:block">
              <Settings size={28} />
            </div>

            {/* PAGE TITLE */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight sm:text-3xl">
                  Company Settings
                </h1>

                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  JobOrbit
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Manage your company, notifications, privacy and preferences.
              </p>
            </div>
          </div>

          {/* TOP SAVE BUTTON */}
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </header>

        {/* STATUS MESSAGE */}
        {notice && (
          <div
            role="status"
            className={`mt-6 flex items-start gap-3 rounded-xl border p-4 ${
              notice.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
            )}

            <p className="text-sm">{notice.text}</p>
          </div>
        )}

        {/* SEARCH SETTINGS */}
        <div className="relative mt-7">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search settings..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
          />

          {search.trim() && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
              {filteredSections.length ? (
                filteredSections.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectSearchResult(item.id)}
                    className="flex w-full items-center justify-between border-b border-slate-800 px-4 py-3 text-left text-sm transition hover:bg-slate-800 last:border-b-0"
                  >
                    <span>{item.title}</span>
                    <ChevronRight size={17} className="text-slate-500" />
                  </button>
                ))
              ) : (
                <p className="px-4 py-4 text-sm text-slate-400">
                  No matching settings found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Active Alerts</span>
              <Bell size={19} className="text-blue-400" />
            </div>

            <p className="mt-3 text-3xl font-extrabold">
              {notificationCount}
              <span className="ml-2 text-sm font-medium text-slate-500">
                / 6
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Enabled notification preferences
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Profile Visibility
              </span>
              <Eye size={19} className="text-emerald-400" />
            </div>

            <p className="mt-3 text-2xl font-extrabold">
              {settings.publicProfile ? "Public" : "Private"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Current saved preference
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Login Alerts
              </span>
              <ShieldCheck size={19} className="text-violet-400" />
            </div>

            <p className="mt-3 text-2xl font-extrabold">
              {settings.loginAlerts ? "Enabled" : "Disabled"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Security notification preference
            </p>
          </div>
        </div>

        {/* MAIN SETTINGS LAYOUT */}
        <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* SIDEBAR */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 lg:sticky lg:top-24">
            <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Settings Menu
            </p>

            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {SECTIONS.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold transition sm:gap-3 ${
                      active
                        ? "border border-blue-500/20 bg-blue-600/15 text-blue-300"
                        : "border border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>

                    {active && (
                      <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-blue-400 lg:block" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 hidden rounded-xl border border-slate-800 bg-slate-950/60 p-4 lg:block">
              <div className="flex items-center gap-2 text-blue-300">
                <Info size={16} />
                <span className="text-xs font-bold">Settings Tip</span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Save your changes before leaving this page.
              </p>
            </div>
          </aside>

          {/* CONTENT */}
          <div className="min-w-0 space-y-6">

            {/* GENERAL SETTINGS */}
            {activeSection === "general" && (
              <section className={cardClass}>
                <SectionHeading
                  icon={Building2}
                  title="General Settings"
                  description="Manage your company identity and regional preferences."
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Company display name"
                    value={settings.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    placeholder="Your company name"
                  />

                  <Field
                    label="Company email"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => update("companyEmail", e.target.value)}
                    placeholder="hr@company.com"
                  />

                  <Field
                    label="Company website"
                    value={settings.companyWebsite}
                    onChange={(e) => update("companyWebsite", e.target.value)}
                    placeholder="https://company.com"
                  />

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-300">
                      Preferred language
                    </span>

                    <select
                      value={settings.language}
                      onChange={(e) => update("language", e.target.value)}
                      className={inputClass}
                    >
                      <option className="bg-slate-900" value="en">
                        English
                      </option>
                      <option className="bg-slate-900" value="hi">
                        Hindi
                      </option>
                    </select>
                  </label>

                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-300">
                      Time Zone
                    </span>

                    <select
                      value={settings.timezone}
                      onChange={(e) => update("timezone", e.target.value)}
                      className={inputClass}
                    >
                      <option className="bg-slate-900" value="Asia/Kolkata">
                        India Standard Time (IST)
                      </option>
                      <option className="bg-slate-900" value="UTC">
                        UTC
                      </option>
                      <option
                        className="bg-slate-900"
                        value="America/New_York"
                      >
                        Eastern Time
                      </option>
                      <option className="bg-slate-900" value="Europe/London">
                        London Time
                      </option>
                    </select>
                  </label>
                </div>

                <div className="mt-6 rounded-xl border border-blue-500/15 bg-blue-500/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                    <Building2 size={17} />
                    Company Profile
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    These settings are stored in this browser. Updating your
                    actual company profile requires backend integration.
                  </p>
                </div>
              </section>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <section className={cardClass}>
                <SectionHeading
                  icon={Bell}
                  title="Notifications"
                  description="Choose the alerts you want to receive."
                />

                <div className="mb-5 rounded-xl border border-blue-500/15 bg-blue-500/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-300">
                        <Bell size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Notification Preferences
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {notificationCount} of 6 preferences enabled
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                      {Math.round((notificationCount / 6) * 100)}%
                    </span>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${(notificationCount / 6) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <SettingRow
                  icon={Mail}
                  title="Email Notifications"
                  description="General account updates and important announcements."
                  checked={settings.emailNotifications}
                  onChange={() => toggle("emailNotifications")}
                />

                <SettingRow
                  icon={UserRound}
                  title="New Application Alerts"
                  description="Know when candidates apply for your jobs."
                  checked={settings.applicationAlerts}
                  onChange={() => toggle("applicationAlerts")}
                />

                <SettingRow
                  icon={MessageCircle}
                  title="Message Notifications"
                  description="Alerts when candidates send messages."
                  checked={settings.messageNotifications}
                  onChange={() => toggle("messageNotifications")}
                />

                <SettingRow
                  icon={BriefcaseBusiness}
                  title="Job Status Updates"
                  description="Updates about job approval and posting status."
                  checked={settings.jobStatusAlerts}
                  onChange={() => toggle("jobStatusAlerts")}
                />

                <SettingRow
                  icon={Clock3}
                  title="Interview Reminders"
                  description="Reminders for upcoming candidate interviews."
                  checked={settings.interviewReminders}
                  onChange={() => toggle("interviewReminders")}
                />

                <SettingRow
                  icon={FileText}
                  title="Weekly Recruitment Report"
                  description="A weekly summary of hiring and application activity."
                  checked={settings.weeklyReports}
                  onChange={() => toggle("weeklyReports")}
                />

                <SettingRow
                  icon={Globe}
                  title="Product Updates and Offers"
                  description="Optional news about JobOrbit features and updates."
                  checked={settings.marketingEmails}
                  onChange={() => toggle("marketingEmails")}
                />

                <p className="mt-5 rounded-xl bg-slate-950/70 p-4 text-xs leading-5 text-slate-400">
                  These preferences do not send emails or push notifications
                  by themselves. A backend notification system is required.
                </p>
              </section>
            )}

            {/* PRIVACY */}
            {activeSection === "privacy" && (
              <section className={cardClass}>
                <SectionHeading
                  icon={ShieldCheck}
                  title="Privacy & Visibility"
                  description="Choose your preferred company profile visibility."
                />

                <SettingRow
                  icon={Eye}
                  title="Public Company Profile"
                  description="Allow candidates to view your company profile."
                  checked={settings.publicProfile}
                  onChange={() => toggle("publicProfile")}
                />

                <SettingRow
                  icon={Mail}
                  title="Show Company Email"
                  description="Preference for displaying your company email publicly."
                  checked={settings.showCompanyEmail}
                  onChange={() => toggle("showCompanyEmail")}
                />

                <SettingRow
                  icon={Globe}
                  title="Show Company Website"
                  description="Preference for displaying your company website."
                  checked={settings.showCompanyWebsite}
                  onChange={() => toggle("showCompanyWebsite")}
                />

                <SettingRow
                  icon={MessageCircle}
                  title="Allow Recruiter Messages"
                  description="Preference for allowing candidates to contact your company."
                  checked={settings.allowRecruiterMessages}
                  onChange={() => toggle("allowRecruiterMessages")}
                />

                <SettingRow
                  icon={Search}
                  title="Search Engine Visibility"
                  description="Preference for public profile indexing."
                  checked={settings.allowSearchIndexing}
                  onChange={() => toggle("allowSearchIndexing")}
                />

                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-300"
                    />

                    <p className="text-xs leading-5 text-slate-300">
                      These are saved preferences. Your public profile and
                      backend APIs must enforce them to change actual
                      visibility.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* APPEARANCE */}
            {activeSection === "appearance" && (
              <section className={cardClass}>
                <SectionHeading
                  icon={Palette}
                  title="Appearance"
                  description="Personalize your settings experience."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                  <button
                    type="button"
                    onClick={() => update("darkMode", true)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      settings.darkMode
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 bg-slate-950/50 hover:border-slate-500"
                    }`}
                  >
                    <Moon size={22} className="text-blue-300" />

                    <p className="mt-4 font-bold">Dark Theme</p>

                    <p className="mt-1 text-xs text-slate-400">
                      Dark surfaces and blue accents.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => update("darkMode", false)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      !settings.darkMode
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 bg-slate-950/50 hover:border-slate-500"
                    }`}
                  >
                    <Sun size={22} className="text-amber-300" />

                    <p className="mt-4 font-bold">Light Theme</p>

                    <p className="mt-1 text-xs text-slate-400">
                      A brighter appearance preference.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotice({
                      type: "success",
                      text: "System theme selection is not implemented yet.",
                    })}
                    className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-left transition hover:border-slate-500"
                  >
                    <Monitor size={22} className="text-violet-300" />

                    <p className="mt-4 font-bold">System Theme</p>

                    <p className="mt-1 text-xs text-slate-400">
                      System theme integration is not configured yet.
                    </p>
                  </button>
                </div>

                <div className="mt-5">
                  <SettingRow
                    icon={Smartphone}
                    title="Compact Layout"
                    description="Preference for a more compact settings layout."
                    checked={settings.compactLayout}
                    onChange={() => toggle("compactLayout")}
                  />
                </div>

                <p className="mt-5 rounded-xl bg-slate-950/70 p-4 text-xs leading-5 text-slate-400">
                  Theme selection is saved as a preference. Applying it
                  throughout JobOrbit requires a shared theme provider or
                  application-wide styling.
                </p>
              </section>
            )}

            {/* SECURITY */}
            {activeSection === "security" && (
              <section className={cardClass}>
                <SectionHeading
                  icon={LockKeyhole}
                  title="Security"
                  description="Manage your account security preferences."
                />

                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />

                  <div>
                    <p className="text-sm font-bold text-emerald-300">
                      Security Preferences
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      These preferences do not replace server-side
                      authentication and security protections.
                    </p>
                  </div>
                </div>

                <SettingRow
                  icon={Bell}
                  title="Login Alerts"
                  description="Preference for alerts about account sign-ins."
                  checked={settings.loginAlerts}
                  onChange={() => toggle("loginAlerts")}
                />

                <SettingRow
                  icon={Smartphone}
                  title="Session Notifications"
                  description="Preference for notifications about account sessions."
                  checked={settings.sessionNotifications}
                  onChange={() => toggle("sessionNotifications")}
                />

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      size={19}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Two-Factor Authentication
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Actual two-factor authentication is not implemented
                        in this settings page. It must be configured securely
                        through the backend.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setNotice({
                            type: "error",
                            text: "Two-factor authentication requires backend implementation.",
                          })
                        }
                        className="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-500 hover:text-blue-300"
                      >
                        View Setup Requirements
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FOOTER ACTIONS */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <p className="text-sm font-semibold text-white">
                  Save your preferences
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {savedAt
                    ? `Last saved at ${savedAt.toLocaleTimeString()}`
                    : "Changes are not saved until you click Save Changes."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetSettings}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  <RotateCcw size={16} />
                  Reset Defaults
                </button>

                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-7 flex flex-col gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>JobOrbit Company Settings</p>

          <p className="flex items-center gap-2">
            <ShieldCheck size={14} />
            Settings are stored locally in this browser.
          </p>
        </footer>
      </main>
    </div>
  );
}