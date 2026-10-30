import { useEffect, useState } from "react";
import {
  Settings,
  SlidersHorizontal,
  Bell,
  Shield,
  Ban,
  Eye,
  Palette,
  ShieldCheck,
  Database,
  ChevronRight,
  RotateCcw,
  Save,
  Check,
  BriefcaseBusiness,
  Code2,
  Newspaper,
  GraduationCap,
  Users,
  MessageCircle,
  Heart,
  AtSign,
  Mail,
  Moon,
  Sun,
  Monitor,
  Globe,
  Sparkles,
  CircleHelp,
  ArrowLeft,
} from "lucide-react";

import { Link } from "react-router-dom";

const STORAGE_KEY = "joborbit_feed_settings_v1";

const DEFAULT_SETTINGS = {
  preferences: {
    recommendedPosts: true,
    suggestedUsers: true,
    trendingContent: true,
    jobRecommendations: true,
    showTechNews: true,
    showCodingPosts: true,
    showCareerTips: true,
    feedSorting: "relevant",
    language: "both",
  },
  notifications: {
    likes: true,
    comments: true,
    followers: true,
    mentions: true,
    newPosts: false,
    jobAlerts: true,
    emailNotifications: false,
  },
  privacy: {
    postVisibility: "everyone",
    commentPermission: "everyone",
    mentionPermission: "following",
    onlineStatus: true,
    activityStatus: true,
  },
  posts: {
    allowComments: true,
    allowReactions: true,
    allowSharing: true,
    allowMentions: true,
  },
  appearance: {
    theme: "system",
    compactFeed: false,
    reduceAnimations: false,
    autoplayVideos: false,
    dataSaver: false,
  },
  safety: {
    filterSpam: true,
    filterPromotions: false,
    sensitiveContent: false,
    blockedKeywords: "",
  },
};

const NAV_ITEMS = [
  { id: "preferences", label: "Feed Preferences", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "posts", label: "Post Settings", icon: MessageCircle },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "safety", label: "Content Safety", icon: ShieldCheck },
];

const mergeSettings = (saved) => ({
  ...DEFAULT_SETTINGS,
  ...saved,
  preferences: {
    ...DEFAULT_SETTINGS.preferences,
    ...saved?.preferences,
  },
  notifications: {
    ...DEFAULT_SETTINGS.notifications,
    ...saved?.notifications,
  },
  privacy: {
    ...DEFAULT_SETTINGS.privacy,
    ...saved?.privacy,
  },
  posts: {
    ...DEFAULT_SETTINGS.posts,
    ...saved?.posts,
  },
  appearance: {
    ...DEFAULT_SETTINGS.appearance,
    ...saved?.appearance,
  },
  safety: {
    ...DEFAULT_SETTINGS.safety,
    ...saved?.safety,
  },
});

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
        checked ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
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
  label,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="mt-0.5 rounded-xl bg-slate-50 p-2 text-slate-600">
            <Icon size={18} />
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          {description && (
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        label={label || title}
      />
    </div>
  );
}

function SelectRow({
  title,
  description,
  value,
  onChange,
  options,
}) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-center">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 sm:w-52"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

export default function FeedSetting() {
  const [activeSection, setActiveSection] = useState("preferences");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = mergeSettings(JSON.parse(stored));
        setSettings(parsed);
        setSavedSettings(parsed);
      }
    } catch (error) {
      console.error("Unable to load Feed Settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = (section, key, value) => {
    setSettings((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [key]: value,
      },
    }));

    setStatus("");
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedSettings(mergeSettings(settings));
      setStatus("Settings saved successfully!");
    } catch (error) {
      console.error("Unable to save Feed Settings:", error);
      setStatus("Settings save nahi ho payi. Browser storage check karein.");
    }
  };

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Kya aap sabhi Feed Settings ko default par reset karna chahte hain?"
    );

    if (!confirmed) return;

    const defaults = mergeSettings({});
    setSettings(defaults);
    setSavedSettings(defaults);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      setStatus("Settings reset successfully!");
    } catch (error) {
      console.error("Unable to reset Feed Settings:", error);
      setStatus("Settings reset nahi ho payi.");
    }
  };

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const renderSection = () => {
    switch (activeSection) {
      case "preferences":
        return (
          <div className="space-y-5">
            <SectionCard
              title="Personalize Your Feed"
              description="Choose what you want to see on your JobOrbit Feed."
            >
              <SettingRow
                icon={Sparkles}
                title="Recommended Posts"
                description="Show posts recommended for your interests."
                checked={settings.preferences.recommendedPosts}
                onChange={(v) =>
                  updateSetting("preferences", "recommendedPosts", v)
                }
              />

              <SettingRow
                icon={Users}
                title="Suggested Users"
                description="Discover people you may want to follow."
                checked={settings.preferences.suggestedUsers}
                onChange={(v) =>
                  updateSetting("preferences", "suggestedUsers", v)
                }
              />

              <SettingRow
                icon={Newspaper}
                title="Trending Content"
                description="Show popular discussions and trending posts."
                checked={settings.preferences.trendingContent}
                onChange={(v) =>
                  updateSetting("preferences", "trendingContent", v)
                }
              />

              <SettingRow
                icon={BriefcaseBusiness}
                title="Job Recommendations"
                description="Include relevant jobs and internship updates."
                checked={settings.preferences.jobRecommendations}
                onChange={(v) =>
                  updateSetting("preferences", "jobRecommendations", v)
                }
              />
            </SectionCard>

            <SectionCard
              title="Content Categories"
              description="Select the topics you are interested in."
            >
              <SettingRow
                icon={Code2}
                title="Coding & Development"
                description="Programming, projects, and developer discussions."
                checked={settings.preferences.showCodingPosts}
                onChange={(v) =>
                  updateSetting("preferences", "showCodingPosts", v)
                }
              />

              <SettingRow
                icon={Newspaper}
                title="Technology News"
                description="Technology updates and industry news."
                checked={settings.preferences.showTechNews}
                onChange={(v) =>
                  updateSetting("preferences", "showTechNews", v)
                }
              />

              <SettingRow
                icon={GraduationCap}
                title="Career Tips"
                description="Career guidance, interview tips, and learning."
                checked={settings.preferences.showCareerTips}
                onChange={(v) =>
                  updateSetting("preferences", "showCareerTips", v)
                }
              />
            </SectionCard>

            <SectionCard title="Feed Display">
              <SelectRow
                title="Feed Sorting"
                description="Choose how posts should be ordered."
                value={settings.preferences.feedSorting}
                onChange={(v) =>
                  updateSetting("preferences", "feedSorting", v)
                }
                options={[
                  { value: "relevant", label: "Most Relevant" },
                  { value: "latest", label: "Latest First" },
                  { value: "trending", label: "Trending" },
                ]}
              />

              <SelectRow
                title="Content Language"
                description="Choose your preferred content language."
                value={settings.preferences.language}
                onChange={(v) =>
                  updateSetting("preferences", "language", v)
                }
                options={[
                  { value: "both", label: "Hindi & English" },
                  { value: "hindi", label: "Hindi" },
                  { value: "english", label: "English" },
                ]}
              />
            </SectionCard>
          </div>
        );

      case "notifications":
        return (
          <SectionCard
            title="Notification Preferences"
            description="Choose which Feed activities you want to hear about."
          >
            <SettingRow
              icon={Heart}
              title="Likes & Reactions"
              description="When someone reacts to your post."
              checked={settings.notifications.likes}
              onChange={(v) => updateSetting("notifications", "likes", v)}
            />

            <SettingRow
              icon={MessageCircle}
              title="Comments"
              description="When someone comments on your post."
              checked={settings.notifications.comments}
              onChange={(v) =>
                updateSetting("notifications", "comments", v)
              }
            />

            <SettingRow
              icon={Users}
              title="New Followers"
              description="When someone follows your profile."
              checked={settings.notifications.followers}
              onChange={(v) =>
                updateSetting("notifications", "followers", v)
              }
            />

            <SettingRow
              icon={AtSign}
              title="Mentions"
              description="When someone mentions you in a post."
              checked={settings.notifications.mentions}
              onChange={(v) =>
                updateSetting("notifications", "mentions", v)
              }
            />

            <SettingRow
              icon={Newspaper}
              title="New Posts"
              description="Updates from people you follow."
              checked={settings.notifications.newPosts}
              onChange={(v) =>
                updateSetting("notifications", "newPosts", v)
              }
            />

            <SettingRow
              icon={BriefcaseBusiness}
              title="Job Alerts"
              description="Notifications about relevant opportunities."
              checked={settings.notifications.jobAlerts}
              onChange={(v) =>
                updateSetting("notifications", "jobAlerts", v)
              }
            />

            <SettingRow
              icon={Mail}
              title="Email Notifications"
              description="Receive selected updates by email."
              checked={settings.notifications.emailNotifications}
              onChange={(v) =>
                updateSetting(
                  "notifications",
                  "emailNotifications",
                  v
                )
              }
            />
          </SectionCard>
        );

      case "privacy":
        return (
          <div className="space-y-5">
            <SectionCard
              title="Post Visibility"
              description="Control who can view and interact with your posts."
            >
              <SelectRow
                title="Who Can See My Posts?"
                value={settings.privacy.postVisibility}
                onChange={(v) =>
                  updateSetting("privacy", "postVisibility", v)
                }
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "followers", label: "Followers Only" },
                  { value: "only-me", label: "Only Me" },
                ]}
              />

              <SelectRow
                title="Who Can Comment?"
                value={settings.privacy.commentPermission}
                onChange={(v) =>
                  updateSetting("privacy", "commentPermission", v)
                }
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "following", label: "People I Follow" },
                  { value: "nobody", label: "No One" },
                ]}
              />

              <SelectRow
                title="Who Can Mention Me?"
                value={settings.privacy.mentionPermission}
                onChange={(v) =>
                  updateSetting("privacy", "mentionPermission", v)
                }
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "following", label: "People I Follow" },
                  { value: "nobody", label: "No One" },
                ]}
              />
            </SectionCard>

            <SectionCard
              title="Activity Visibility"
              description="Manage how your activity appears to other users."
            >
              <SettingRow
                icon={Eye}
                title="Online Status"
                description="Let others know when you are online."
                checked={settings.privacy.onlineStatus}
                onChange={(v) =>
                  updateSetting("privacy", "onlineStatus", v)
                }
              />

              <SettingRow
                icon={Users}
                title="Activity Status"
                description="Allow others to see your recent activity."
                checked={settings.privacy.activityStatus}
                onChange={(v) =>
                  updateSetting("privacy", "activityStatus", v)
                }
              />
            </SectionCard>
          </div>
        );

      case "posts":
        return (
          <SectionCard
            title="Post Interaction"
            description="Set default interaction permissions for your posts."
          >
            <SettingRow
              icon={MessageCircle}
              title="Allow Comments"
              description="Allow people to comment on your posts."
              checked={settings.posts.allowComments}
              onChange={(v) => updateSetting("posts", "allowComments", v)}
            />

            <SettingRow
              icon={Heart}
              title="Allow Reactions"
              description="Allow people to like and react to your posts."
              checked={settings.posts.allowReactions}
              onChange={(v) => updateSetting("posts", "allowReactions", v)}
            />

            <SettingRow
              icon={Globe}
              title="Allow Sharing"
              description="Allow others to share your posts."
              checked={settings.posts.allowSharing}
              onChange={(v) => updateSetting("posts", "allowSharing", v)}
            />

            <SettingRow
              icon={AtSign}
              title="Allow Mentions"
              description="Allow others to mention you in posts."
              checked={settings.posts.allowMentions}
              onChange={(v) => updateSetting("posts", "allowMentions", v)}
            />
          </SectionCard>
        );

      case "appearance":
        return (
          <div className="space-y-5">
            <SectionCard
              title="Theme"
              description="Choose your preferred visual appearance."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((item) => {
                  const Icon = item.icon;
                  const selected =
                    settings.appearance.theme === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        updateSetting("appearance", "theme", item.id)
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                          : "border-slate-200 hover:border-indigo-200"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={
                          selected ? "text-indigo-600" : "text-slate-500"
                        }
                      />
                      <p className="mt-3 text-sm font-semibold text-slate-800">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {selected ? "Selected" : "Choose theme"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Display & Performance"
              description="Customize the Feed experience on your device."
            >
              <SettingRow
                icon={Monitor}
                title="Compact Feed"
                description="Use a more compact layout for posts."
                checked={settings.appearance.compactFeed}
                onChange={(v) =>
                  updateSetting("appearance", "compactFeed", v)
                }
              />

              <SettingRow
                icon={Sparkles}
                title="Reduce Animations"
                description="Reduce motion and visual transitions."
                checked={settings.appearance.reduceAnimations}
                onChange={(v) =>
                  updateSetting("appearance", "reduceAnimations", v)
                }
              />

              <SettingRow
                icon={Eye}
                title="Auto-play Videos"
                description="Automatically play videos while scrolling."
                checked={settings.appearance.autoplayVideos}
                onChange={(v) =>
                  updateSetting("appearance", "autoplayVideos", v)
                }
              />

              <SettingRow
                icon={Database}
                title="Data Saver"
                description="Prefer lower data usage when supported."
                checked={settings.appearance.dataSaver}
                onChange={(v) =>
                  updateSetting("appearance", "dataSaver", v)
                }
              />
            </SectionCard>
          </div>
        );

      case "safety":
        return (
          <div className="space-y-5">
            <SectionCard
              title="Content Filters"
              description="Choose which types of content to filter."
            >
              <SettingRow
                icon={ShieldCheck}
                title="Spam Filter"
                description="Filter content identified as spam."
                checked={settings.safety.filterSpam}
                onChange={(v) =>
                  updateSetting("safety", "filterSpam", v)
                }
              />

              <SettingRow
                icon={Ban}
                title="Promotional Content"
                description="Reduce unwanted promotional posts."
                checked={settings.safety.filterPromotions}
                onChange={(v) =>
                  updateSetting("safety", "filterPromotions", v)
                }
              />

              <SettingRow
                icon={Eye}
                title="Sensitive Content"
                description="Hide sensitive content where supported."
                checked={settings.safety.sensitiveContent}
                onChange={(v) =>
                  updateSetting("safety", "sensitiveContent", v)
                }
              />
            </SectionCard>

            <SectionCard
              title="Blocked Keywords"
              description="Enter words separated by commas. Filtering must be connected to the Feed logic to take effect."
            >
              <label
                htmlFor="blocked-keywords"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Keywords to hide
              </label>

              <textarea
                id="blocked-keywords"
                rows={4}
                value={settings.safety.blockedKeywords}
                onChange={(event) =>
                  updateSetting(
                    "safety",
                    "blockedKeywords",
                    event.target.value
                  )
                }
                placeholder="Example: spam, unwanted topic, keyword"
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </SectionCard>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Loading Feed Settings...
        </div>
      </div>
    );
  }

  const ActiveIcon =
    NAV_ITEMS.find((item) => item.id === activeSection)?.icon || Settings;

  const activeItem = NAV_ITEMS.find(
    (item) => item.id === activeSection
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/feed"
              aria-label="Back to Feed"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Settings size={21} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Feed Settings
              </h1>
              <p className="text-xs text-slate-500">
                Personalize your JobOrbit experience
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
            <ShieldCheck size={15} />
            Your preferences
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Intro */}
        <div className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 p-6 text-white shadow-xl shadow-indigo-100 sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                <Sparkles size={14} />
                YOUR FEED, YOUR CHOICE
              </div>

              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Make JobOrbit yours.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                Control your content preferences, notifications, privacy,
                and the way you experience your professional community.
              </p>
            </div>

            <div className="hidden h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 md:flex">
              <SlidersHorizontal size={44} />
            </div>
          </div>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
            <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Settings Menu
            </p>

            <nav className="flex gap-2 overflow-x-auto lg:flex-col">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 lg:w-full ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {active && (
                      <ChevronRight
                        size={16}
                        className="ml-auto hidden lg:block"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 hidden rounded-xl bg-slate-50 p-4 lg:block">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CircleHelp size={17} />
                Need help?
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Update your preferences whenever you want. Remember to save
                your changes.
              </p>
            </div>
          </aside>

          {/* Main Settings */}
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                  <ActiveIcon size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {activeItem?.label}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage your preferences below.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetSettings}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Reset All
              </button>
            </div>

            {renderSection()}

            {/* Save Bar */}
            <div className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-xl sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {hasChanges ? "Unsaved changes" : "All changes saved"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {status ||
                      "Save your preferences to keep your changes on this browser."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={!hasChanges}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition ${
                    hasChanges
                      ? "bg-indigo-600 shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                      : "cursor-not-allowed bg-slate-300"
                  }`}
                >
                  {hasChanges ? <Save size={17} /> : <Check size={17} />}
                  {hasChanges ? "Save Changes" : "Saved"}
                </button>
              </div>
            </div>

            <p className="px-1 text-xs leading-5 text-slate-400">
              Note: These preferences are stored in this browser using
              localStorage. Privacy restrictions, notifications, content
              filtering, and other behavioral controls must also be
              implemented in your backend and Feed logic to take effect.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
