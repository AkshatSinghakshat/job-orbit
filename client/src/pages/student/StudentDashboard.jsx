import { useEffect, useState } from "react";
import axios from "axios";
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
          response.data.message || "Failed to load dashboard"
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <Loader2
            size={28}
            className="animate-spin text-blue-500"
          />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-900 bg-slate-900 p-6 text-center">
          <AlertCircle
            size={40}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-xl font-bold">
            Something went wrong
          </h2>

          <p className="mt-2 text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              JobOrbit
            </h1>

            <p className="text-sm text-slate-400">
              Student Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="font-semibold">
                {student?.name || "Student"}
              </p>

              <p className="text-xs text-slate-400">
                {student?.email || ""}
              </p>
            </div>

            <div className="rounded-full bg-blue-600 p-3">
              <User size={20} />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 p-3 text-slate-300 hover:bg-slate-800"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* WELCOME */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome, {student?.name || "Student"} 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your profile, discover jobs and track your
            applications.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users size={25} />}
            title="Followers"
            value={followersCount}
            onClick={() => openFollowList("followers")}
          />

          <StatCard
            icon={<User size={25} />}
            title="Profile Views"
            value={profileViews}
          />

          <StatCard
            icon={<Users size={25} />}
            title="Following"
            value={followingCount}
            onClick={() => openFollowList("following")}
          />

          <StatCard
            icon={<BriefcaseBusiness size={25} />}
            title="Available Jobs"
            value={statistics?.totalJobs ?? 0}
          />

          <StatCard
            icon={<FileText size={25} />}
            title="Applications"
            value={statistics?.totalApplications ?? 0}
          />

          <StatCard
            icon={<GraduationCap size={25} />}
            title="Shortlisted"
            value={
              statistics?.shortlistedApplications ?? 0
            }
          />

          <StatCard
            icon={<User size={25} />}
            title="Profile Completion"
            value={`${statistics?.profileCompletion ?? 0}%`}
          />
        </div>

        {/* PROFILE VISITORS */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                Profile Visitors
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                People who viewed your profile
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/10 px-4 py-2 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {profileViews}
              </p>

              <p className="text-xs text-slate-400">
                Total Views
              </p>
            </div>
          </div>

          {profileVisitors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 py-10 text-center">
              <User
                size={40}
                className="mx-auto mb-3 text-slate-600"
              />

              <p className="text-slate-400">
                No one has viewed your profile yet.
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
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-blue-500"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold">
                    {visit.visitor?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">
                      {visit.visitor?.name ||
                        "Unknown User"}
                    </p>

                    <p className="text-xs capitalize text-slate-400">
                      {visit.visitor?.role || "User"}
                    </p>

                    {visit.lastVisitedAt && (
                      <p className="mt-1 text-xs text-slate-500">
                        Last visited:{" "}
                        {new Date(
                          visit.lastVisitedAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-400">
                      {visit.visitCount}
                    </p>

                    <p className="text-xs text-slate-500">
                      visits
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PROFILE + JOBS */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* PROFILE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <User className="text-blue-400" />

                <h3 className="text-xl font-bold">
                  My Profile
                </h3>
              </div>

              <button
                type="button"
                onClick={handleEditProfile}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Update
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
                <div className="border-b border-slate-800 pb-3">
                  <p className="text-xs text-slate-500">
                    Resume
                  </p>

                  <a
                    href={`${SERVER_URL}${student.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <FileText size={16} />
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* LATEST JOBS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Latest Jobs
              </h3>

              <span className="text-sm text-slate-400">
                {latestJobs.length} jobs
              </span>
            </div>

            {latestJobs.length === 0 ? (
              <EmptyState message="No jobs available right now." />
            ) : (
              <div className="space-y-4">
                {latestJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                      <div>
                        <h4 className="text-lg font-semibold">
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
                          navigate(`/jobs/${job.id}`)
                        }
                        className="h-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-700"
                      >
                        View Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* APPLICATIONS */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold">
              My Applications
            </h3>

            <span className="text-sm text-slate-400">
              {applications.length} applications
            </span>
          </div>

          {applications.length === 0 ? (
            <EmptyState message="You haven't applied for any job yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-sm text-slate-400">
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="px-4 py-4 font-medium">
                        {application.Job?.title ||
                          "Unknown Job"}
                      </td>

                      <td className="px-4 py-4 text-slate-400">
                        {application.Job?.Company?.User?.name ||
                          "Unknown Company"}
                      </td>

                      <td className="px-4 py-4 text-slate-400">
                        {application.Job?.location ||
                          "Not specified"}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs capitalize text-blue-400">
                          {application.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowEditProfile(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  Update Profile
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Update your personal and academic details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
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

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Bio
                  </label>

                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="Tell something about yourself..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Skills
                  </label>

                  <textarea
                    name="skills"
                    value={profileForm.skills}
                    onChange={handleProfileChange}
                    rows={3}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="JavaScript, React, Node.js, MySQL"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Education
                  </label>

                  <textarea
                    name="education"
                    value={profileForm.education}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="Add your education details..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Experience
                  </label>

                  <textarea
                    name="experience"
                    value={profileForm.experience}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="Add your internship or work experience..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Projects
                  </label>

                  <textarea
                    name="projects"
                    value={profileForm.projects}
                    onChange={handleProfileChange}
                    rows={5}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="Add your projects and project links..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Achievements
                  </label>

                  <textarea
                    name="achievements"
                    value={profileForm.achievements}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="Add your certificates and achievements..."
                  />
                </div>

                {/* RESUME UPLOAD */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Resume PDF
                  </label>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      setResumeFile(
                        event.target.files?.[0] || null
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                  />

                  {resumeFile && (
                    <p className="mt-2 text-sm text-slate-400">
                      Selected: {resumeFile.name}
                    </p>
                  )}

                  {student?.resume && !resumeFile && (
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

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* FOLLOWERS/FOLLOWING MODAL */}
      {showFollowList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeFollowList}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h3 className="font-bold">
                  {showFollowList === "followers"
                    ? "Followers"
                    : "Following"}
                </h3>

                <p className="text-xs text-slate-400">
                  {followList.length}{" "}
                  {showFollowList === "followers"
                    ? "followers"
                    : "following"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFollowList}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {followList.length === 0 ? (
                <div className="py-12 text-center">
                  <Users
                    size={40}
                    className="mx-auto mb-3 text-slate-600"
                  />

                  <p className="text-slate-400">
                    {showFollowList === "followers"
                      ? "No followers yet."
                      : "Not following anyone yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {followList.map((item) => {
                    const person =
                      showFollowList === "followers"
                        ? item.follower
                        : item.followingUser;

                    if (!person) return null;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handleUserProfile(person.id)
                        }
                        className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-800"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold">
                          {person.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {person.name}
                          </p>

                          <p className="truncate text-xs text-slate-400">
                            {person.role || "User"}
                          </p>
                        </div>

                        <span className="text-xs text-blue-400">
                          View Profile →
                        </span>
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
      className={`w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:border-blue-500"
          : "cursor-default"
      }`}
    >
      <div className="mb-4 w-fit rounded-xl bg-blue-500/10 p-3 text-blue-400">
        {icon}
      </div>

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>
    </button>
  );
}

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
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
      />
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="border-b border-slate-800 pb-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-200">
        {value || `No ${label.toLowerCase()} added`}
      </p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 py-12 text-center">
      <p className="text-slate-400">
        {message}
      </p>
    </div>
  );
}

export default StudentDashboard;