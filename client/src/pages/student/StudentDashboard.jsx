import { useEffect, useState } from "react";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import {
  User,
  Users,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  MapPin,
  Building2,
  LogOut,
  Loader2,
  AlertCircle,
  X,
  Home,
  Newspaper,
  Eye,
  Pencil,
  ExternalLink,
  Search,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

function StudentDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowList, setShowFollowList] = useState(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);

  const [profileViews, setProfileViews] = useState(0);
  const [profileVisitors, setProfileVisitors] = useState([]);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    course: "",
    branch: "",
    passingYear: "",
    bio: "",
    skills: "",
    education: "",
    experience: "",
    linkedin: "",
    github: "",
    projects: "",
    achievements: "",
  });

  const student = dashboard?.student;
  const statistics = dashboard?.statistics;
  const latestJobs = dashboard?.latestJobs || [];
  const applications = dashboard?.applications || [];

  const followList =
    showFollowList === "followers" ? followers : following;

  /* ================= FETCH DASHBOARD ================= */

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await axios.get(
        `${API_URL}/student/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Failed to load dashboard"
        );
        return;
      }

      const userId = response.data.student?.userId;

      if (userId) {
        const [
          followersResponse,
          followingResponse,
          profileVisitResponse,
        ] = await Promise.all([
          axios.get(
            `${API_URL}/follows/followers/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            `${API_URL}/follows/following/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            `${API_URL}/profile-visits/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        setFollowersCount(
          followersResponse.data.count || 0
        );

        setFollowingCount(
          followingResponse.data.count || 0
        );

        setFollowers(
          followersResponse.data.followers || []
        );

        setFollowing(
          followingResponse.data.following || []
        );

        if (profileVisitResponse.data.success) {
          setProfileViews(
            profileVisitResponse.data.totalViews || 0
          );

          setProfileVisitors(
            profileVisitResponse.data.visitors || []
          );
        }
      }

      setDashboard(response.data);
    } catch (err) {
      console.error("Student Dashboard Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  /* ================= EDIT PROFILE ================= */

  const handleEditProfile = () => {
    setProfileForm({
      name: student?.name || "",
      email: student?.email || "",
      phone: student?.phone || "",
      college: student?.college || "",
      course: student?.course || "",
      branch: student?.branch || "",
      passingYear: student?.passingYear || "",
      bio: student?.bio || "",
      skills: student?.skills || "",
      education: student?.education || "",
      experience: student?.experience || "",
      linkedin: student?.linkedin || "",
      github: student?.github || "",
      projects: student?.projects || "",
      achievements: student?.achievements || "",
    });

    setResumeFile(null);
    setShowEditProfile(true);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const formData = new FormData();

      Object.entries(profileForm).forEach(
        ([key, value]) => {
          formData.append(key, value ?? "");
        }
      );

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await axios.put(
        `${API_URL}/student/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDashboard((previous) => ({
          ...previous,
          student: response.data.student,
        }));

        setResumeFile(null);
        setShowEditProfile(false);

        alert("Profile updated successfully");
      }
    } catch (err) {
      console.error("Update Profile Error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= FOLLOWERS ================= */

  const openFollowList = (type) => {
    setShowFollowList(type);
  };

  const closeFollowList = () => {
    setShowFollowList(null);
  };

  const handleUserProfile = (userId) => {
    if (!userId) return;

    closeFollowList();
    navigate(`/profile/${userId}`);
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-8 py-7 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Loader2
                size={26}
                className="animate-spin text-blue-500"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Loading Dashboard
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Please wait a moment...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-900/50 bg-slate-900 p-7 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle
              size={32}
              className="text-red-500"
            />
          </div>

          <h2 className="text-xl font-bold">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  

  /* ================= MAIN DASHBOARD ================= */

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

          {/* BRAND */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20 transition group-hover:scale-105">
              <BriefcaseBusiness size={20} />
            </div>

            <div className="hidden text-left sm:block">
              <h1 className="text-lg font-bold">
                JobOrbit
              </h1>

              <p className="text-[11px] text-slate-500">
                Student Dashboard
              </p>
            </div>
          </button>

          {/* NAVIGATION */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* HOME */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white sm:px-4"
              title="Go to Home"
            >
              <Home
                size={18}
                className="transition group-hover:scale-110"
              />

              <span className="hidden sm:inline">
                Home
              </span>
            </button>

            {/* FEED */}

            <button
              type="button"
              onClick={() => navigate("/feed")}
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 sm:px-4"
              title="Open Feed"
            >
              <Newspaper
                size={18}
                className="transition group-hover:scale-110"
              />

              <span className="hidden sm:inline">
                Feed
              </span>
            </button>

            {/* CHAT / MESSAGES */}
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className="group flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 sm:px-4"
              title="Open Chat / Messages"
            >
              <MessageCircle size={18} className="transition group-hover:scale-110" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            {/* STUDENT INFO */}

            <div className="hidden border-l border-slate-800 pl-3 text-right md:block lg:pl-4">
              <p className="max-w-[150px] truncate text-sm font-semibold">
                {student?.name || "Student"}
              </p>

              <p className="max-w-[150px] truncate text-xs text-slate-500">
                {student?.email || ""}
              </p>
            </div>

            {/* AVATAR */}

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 font-semibold shadow-lg shadow-blue-500/20">
              {student?.name
                ?.charAt(0)
                ?.toUpperCase() || (
                <User size={19} />
              )}
            </div>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              title="Logout"
            >
              <LogOut size={19} />
            </button>

          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-9">

        {/* WELCOME */}

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 p-6 shadow-xl sm:p-8">

          {/* Decorative background */}

          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Student Portal
            </div>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome, {student?.name || "Student"} 👋
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Manage your profile, discover jobs, build your network
              and track your applications from one place.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-700"
              >
                <BriefcaseBusiness size={17} />
                Find Jobs
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/feed")}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
              >
                <Newspaper size={17} />
                Explore Feed
              </button>

            </div>
          </div>
        </div>

        {/* ================= STATISTICS ================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<Users size={23} />}
            title="Followers"
            value={followersCount}
            onClick={() => openFollowList("followers")}
          />

          <StatCard
            icon={<Eye size={23} />}
            title="Profile Views"
            value={profileViews}
          />

          <StatCard
            icon={<Users size={23} />}
            title="Following"
            value={followingCount}
            onClick={() => openFollowList("following")}
          />

          <StatCard
            icon={<BriefcaseBusiness size={23} />}
            title="Available Jobs"
            value={statistics?.totalJobs ?? 0}
          />

          <StatCard
            icon={<FileText size={23} />}
            title="Applications"
            value={statistics?.totalApplications ?? 0}
          />

          <StatCard
            icon={<GraduationCap size={23} />}
            title="Shortlisted"
            value={
              statistics?.shortlistedApplications ?? 0
            }
          />

          <StatCard
            icon={<User size={23} />}
            title="Profile Completion"
            value={`${statistics?.profileCompletion ?? 0}%`}
          />

        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <div className="mt-8">

          <div className="mb-4">
            <h3 className="text-xl font-bold">
              Quick Actions
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage your career from one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

           <Link
  to="/codearena"
  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
>
  💻 CodeArena — Solve Questions
</Link>
            {/* FIND JOBS */}

            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-blue-500/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:scale-110">
                <BriefcaseBusiness size={22} />
              </div>

              <h4 className="font-bold">
                Find Jobs
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                Explore jobs matching your skills.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-400">
                Explore Jobs
                <ChevronRight size={15} />
              </span>
            </button>

            {/* RESUME BUILDER */}

            <button
              type="button"
              onClick={() => navigate("/resume-builder")}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-blue-500/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:scale-110">
                <FileText size={22} />
              </div>

              <h4 className="font-bold">
                Resume Builder
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                Build a professional resume using your profile details.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-400">
                Create Resume
                <ChevronRight size={15} />
              </span>
            </button>

            {/* UPDATE PROFILE */}

            <button
              type="button"
              onClick={handleEditProfile}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-purple-500/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition group-hover:scale-110">
                <Pencil size={22} />
              </div>

              <h4 className="font-bold">
                Update Profile
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                Improve your professional profile.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-purple-400">
                Edit Profile
                <ChevronRight size={15} />
              </span>
            </button>

            {/* PUBLIC PROFILE */}

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-green-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-green-500/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-400 transition group-hover:scale-110">
                <ExternalLink size={22} />
              </div>

              <h4 className="font-bold">
                My Public Profile
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                See how other users view your profile.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-green-400">
                View Profile
                <ChevronRight size={15} />
              </span>
            </button>

            {/* CHAT / MESSAGES */}
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-emerald-500/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition group-hover:scale-110">
                <MessageCircle size={22} />
              </div>

              <h4 className="font-bold">Chat / Messages</h4>

              <p className="mt-1 text-sm text-slate-400">
                Chat with eligible companies and check your conversations.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
                Open Messages
                <ChevronRight size={15} />
              </span>
            </button>

            {/* NETWORK */}

            <button
              type="button"
              onClick={() => openFollowList("following")}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition group-hover:scale-110">
                <Users size={22} />
              </div>

              <h4 className="font-bold">
                My Network
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                View your connections and following.
              </p>

              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-400">
                View Network
                <ChevronRight size={15} />
              </span>
            </button>

          </div>
        </div>
                {/* ================= PROFILE VISITORS ================= */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <Eye size={20} className="text-blue-400" />

                <h3 className="text-xl font-bold">
                  Profile Visitors
                </h3>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                People who viewed your profile
              </p>
            </div>

            <div className="rounded-xl border border-blue-500/10 bg-blue-500/10 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {profileViews}
              </p>

              <p className="text-xs text-slate-500">
                Total Views
              </p>
            </div>

          </div>

          {profileVisitors.length === 0 ? (

            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 py-12 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
                <Eye
                  size={25}
                  className="text-slate-600"
                />
              </div>

              <p className="font-medium text-slate-400">
                No one has viewed your profile yet.
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Keep improving your profile to get more views.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {profileVisitors.map((visit) => (

                <button
                  key={visit.id}
                  type="button"
                  onClick={() =>
                    handleUserProfile(
                      visit.visitor?.id
                    )
                  }
                  className="group flex w-full items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-blue-500/40 hover:bg-slate-800/70"
                >

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 font-bold shadow-lg shadow-blue-500/10">
                    {visit.visitor?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate font-semibold text-white">
                      {visit.visitor?.name ||
                        "Unknown User"}
                    </p>

                    <p className="text-xs capitalize text-slate-500">
                      {visit.visitor?.role ||
                        "User"}
                    </p>

                    {visit.lastVisitedAt && (
                      <p className="mt-1 text-xs text-slate-600">
                        Last visited:{" "}
                        {new Date(
                          visit.lastVisitedAt
                        ).toLocaleString()}
                      </p>
                    )}

                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-lg font-bold text-blue-400">
                      {visit.visitCount}
                    </p>

                    <p className="text-xs text-slate-600">
                      visits
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                  />

                </button>

              ))}

            </div>

          )}

        </div>


        {/* ================= PROFILE + JOBS ================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* ================= PROFILE ================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <User
                    size={20}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    My Profile
                  </h3>

                  <p className="text-xs text-slate-500">
                    Your professional information
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleEditProfile}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-blue-400"
                title="Edit Profile"
              >
                <Pencil size={17} />
              </button>

            </div>

            <div className="space-y-4">

              <ProfileRow
                label="Name"
                value={student?.name}
              />

              <ProfileRow
                label="Email"
                value={student?.email}
              />

              <ProfileRow
                label="Phone"
                value={student?.phone}
              />

              <ProfileRow
                label="College"
                value={student?.college}
              />

              <ProfileRow
                label="Course"
                value={student?.course}
              />

              <ProfileRow
                label="Branch"
                value={student?.branch}
              />

              <ProfileRow
                label="Passing Year"
                value={student?.passingYear}
              />

              {student?.resume && (

                <div className="border-t border-slate-800 pt-4">

                  <p className="text-xs text-slate-500">
                    Resume
                  </p>

                  <a
                    href={`${SERVER_URL}${student.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    <FileText size={16} />
                    View Resume
                    <ExternalLink size={14} />
                  </a>

                </div>

              )}

            </div>

          </div>


          {/* ================= LATEST JOBS ================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg lg:col-span-2">

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                    <BriefcaseBusiness
                      size={18}
                      className="text-blue-400"
                    />
                  </div>

                  <h3 className="text-xl font-bold">
                    Latest Jobs
                  </h3>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Latest opportunities available for you
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                View All
                <ChevronRight size={16} />
              </button>

            </div>

            {latestJobs.length === 0 ? (

              <EmptyState
                message="No jobs available right now."
              />

            ) : (

              <div className="space-y-4">

                {latestJobs.map((job) => (

                  <div
                    key={job.id}
                    className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-blue-500/40 hover:bg-slate-800/50"
                  >

                    <div className="flex flex-col justify-between gap-5 sm:flex-row">

                      <div className="min-w-0">

                        <h4 className="text-lg font-semibold transition group-hover:text-blue-400">
                          {job.title}
                        </h4>

                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">

                          <span className="flex items-center gap-1">
                            <Building2 size={15} />
                            {job.Company?.User?.name ||
                              "Company"}
                          </span>

                          <span className="flex items-center gap-1">
                            <MapPin size={15} />
                            {job.location ||
                              "Location not specified"}
                          </span>

                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">

                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                            {job.jobType || "Job"}
                          </span>

                          {job.experience && (
                            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                              {job.experience}
                            </span>
                          )}

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/jobs/${job.id}`
                          )
                        }
                        className="flex h-fit items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-700"
                      >
                        View Job
                        <ChevronRight size={15} />
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>


        {/* ================= APPLICATIONS ================= */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                  <FileText
                    size={18}
                    className="text-purple-400"
                  />
                </div>

                <h3 className="text-xl font-bold">
                  My Applications
                </h3>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Track your job applications
              </p>

            </div>

            <span className="w-fit rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400">
              {applications.length} applications
            </span>

          </div>

          {applications.length === 0 ? (

            <EmptyState
              message="You haven't applied for any job yet."
            />

          ) : (

            <div className="overflow-x-auto rounded-xl border border-slate-800">

              <table className="w-full min-w-[700px] text-left">

                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-sm text-slate-400">

                    <th className="px-5 py-4">
                      Job
                    </th>

                    <th className="px-5 py-4">
                      Company
                    </th>

                    <th className="px-5 py-4">
                      Location
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {applications.map(
                    (application) => (

                      <tr
                        key={application.id}
                        className="border-b border-slate-800 last:border-0 transition hover:bg-slate-800/40"
                      >

                        <td className="px-5 py-4 font-medium">
                          {application.Job?.title ||
                            "Unknown Job"}
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {application.Job?.Company?.User
                            ?.name ||
                            "Unknown Company"}
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {application.Job?.location ||
                            "Not specified"}
                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs capitalize text-blue-400">
                            {application.status ||
                              "pending"}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>


      {/* ================= EDIT PROFILE MODAL ================= */}

      {showEditProfile && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() =>
            setShowEditProfile(false)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mb-6 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <Pencil
                      size={19}
                      className="text-blue-400"
                    />
                  </div>

                  <h3 className="text-2xl font-bold">
                    Update Profile
                  </h3>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Update your personal and academic details.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowEditProfile(false)
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={22} />
              </button>

            </div>


            <form
              onSubmit={handleSaveProfile}
              className="space-y-5"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <InputField
                  label="Name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />

                <InputField
                  label="Phone"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                />

                <InputField
                  label="College"
                  name="college"
                  value={profileForm.college}
                  onChange={handleProfileChange}
                />

                <InputField
                  label="Course"
                  name="course"
                  value={profileForm.course}
                  onChange={handleProfileChange}
                />

                <InputField
                  label="Branch"
                  name="branch"
                  value={profileForm.branch}
                  onChange={handleProfileChange}
                />

                <InputField
                  label="Passing Year"
                  name="passingYear"
                  type="number"
                  value={profileForm.passingYear}
                  onChange={handleProfileChange}
                />

                <InputField
                  label="LinkedIn"
                  name="linkedin"
                  type="url"
                  value={profileForm.linkedin}
                  onChange={handleProfileChange}
                />

                <InputField
                  label="GitHub"
                  name="github"
                  type="url"
                  value={profileForm.github}
                  onChange={handleProfileChange}
                />


                {/* BIO */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Bio
                  </label>

                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    placeholder="Tell something about yourself..."
                  />

                </div>


                {/* SKILLS */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Skills
                  </label>

                  <textarea
                    name="skills"
                    value={profileForm.skills}
                    onChange={handleProfileChange}
                    rows={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    placeholder="JavaScript, React, Node.js, MySQL"
                  />

                </div>


                {/* EDUCATION */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Education
                  </label>

                  <textarea
                    name="education"
                    value={profileForm.education}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    placeholder="Add your education details..."
                  />

                </div>


                {/* EXPERIENCE */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Experience
                  </label>

                  <textarea
                    name="experience"
                    value={profileForm.experience}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    placeholder="Add your internship or work experience..."
                  />

                </div>


                {/* PROJECTS */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Projects
                  </label>

                  <textarea
                    name="projects"
                    value={profileForm.projects}
                    onChange={handleProfileChange}
                    rows={5}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    placeholder="Add your projects and project links..."
                  />

                </div>


                {/* ACHIEVEMENTS */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Achievements
                  </label>

                  <textarea
                    name="achievements"
                    value={profileForm.achievements}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    placeholder="Add your certificates and achievements..."
                  />

                </div>


                {/* RESUME */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Resume PDF
                  </label>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      setResumeFile(
                        event.target.files?.[0] ||
                          null
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                  />

                  {resumeFile && (
                    <p className="mt-2 text-sm text-slate-400">
                      Selected:{" "}
                      {resumeFile.name}
                    </p>
                  )}

                  {student?.resume &&
                    !resumeFile && (

                      <a
                        href={`${SERVER_URL}${student.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        <FileText size={16} />
                        View Current Resume
                      </a>

                    )}

                </div>

              </div>


              {/* FORM BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowEditProfile(false)
                  }
                  className="rounded-xl border border-slate-700 px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {savingProfile && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ================= FOLLOWERS / FOLLOWING DRAWER ================= */}

      {showFollowList && (

        <div className="fixed inset-0 z-50">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeFollowList}
          />

          {/* DRAWER */}

          <div className="absolute right-0 top-0 flex h-full w-[340px] max-w-[90vw] flex-col border-l border-slate-700 bg-slate-900 shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

              <div>

                <h3 className="text-lg font-bold">
                  {showFollowList ===
                  "followers"
                    ? "Followers"
                    : "Following"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {followList.length}{" "}
                  {showFollowList ===
                  "followers"
                    ? "followers"
                    : "following"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeFollowList}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>


            {/* LIST */}

            <div className="flex-1 overflow-y-auto p-4">

              {followList.length === 0 ? (

                <div className="flex h-full items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
                      <Users
                        size={25}
                        className="text-slate-600"
                      />
                    </div>

                    <p className="text-sm text-slate-400">
                      {showFollowList ===
                      "followers"
                        ? "No followers yet."
                        : "Not following anyone yet."}
                    </p>

                  </div>

                </div>

              ) : (

                <div className="space-y-2">

                  {followList.map((item) => {

                    const person =
                      showFollowList ===
                      "followers"
                        ? item.follower
                        : item.followingUser;

                    if (!person) return null;

                    return (

                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handleUserProfile(
                            person.id
                          )
                        }
                        className="group flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-left transition hover:border-blue-500/40 hover:bg-slate-800"
                      >

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 font-bold">
                          {person.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "U"}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold">
                            {person.name ||
                              "Unknown User"}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {person.role ||
                              "User"}
                          </p>

                        </div>

                        <ChevronRight
                          size={17}
                          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                        />

                      </button>

                    );
                  })}

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* ================================================= */
/* STAT CARD */
/* ================================================= */

function StatCard({
  icon,
  title,
  value,
  onClick,
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group w-full rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left shadow-sm transition duration-300 ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:border-blue-500/40 hover:bg-slate-800 hover:shadow-xl hover:shadow-blue-500/5"
          : "cursor-default"
      }`}
    >

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:scale-110">
          {icon}
        </div>

        {onClick && (
          <ChevronRight
            size={17}
            className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-blue-400"
          />
        )}

      </div>

      <p className="mt-5 text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-1 text-3xl font-bold">
        {value}
      </h3>

    </button>

  );
}


/* ================================================= */
/* INPUT FIELD */
/* ================================================= */

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      />

    </div>

  );
}


/* ================================================= */
/* PROFILE ROW */
/* ================================================= */

function ProfileRow({
  label,
  value,
}) {

  return (

    <div className="border-b border-slate-800 pb-3 last:border-0">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p className="mt-1 break-words font-medium text-slate-200">
        {value ||
          `No ${label.toLowerCase()} added`}
      </p>

    </div>

  );
}


/* ================================================= */
/* EMPTY STATE */
/* ================================================= */

function EmptyState({
  message,
}) {

  return (

    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 py-12 text-center">

      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">

        <Search
          size={21}
          className="text-slate-600"
        />

      </div>

      <p className="text-sm text-slate-400">
        {message}
      </p>

    </div>

  );
}


export default StudentDashboard;