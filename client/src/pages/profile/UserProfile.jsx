import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Edit3,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [profileViews, setProfileViews] = useState(0);
const [profileVisitors, setProfileVisitors] = useState([]);

  const loggedInUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isOwnProfile =
    Number(loggedInUser?.id) === Number(userId);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await axios.get(
        `${API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Failed to load profile"
        );
        return;
      }

      setProfile(response.data.user);
      // Get profile visitors and total views
if (isOwnProfile) {
  try {
    const visitorsResponse = await axios.get(
      `${API_URL}/profile-visits/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (visitorsResponse.data.success) {
      setProfileViews(visitorsResponse.data.totalViews || 0);
      setProfileVisitors(visitorsResponse.data.visitors || []);
    }
  } catch (visitorError) {
    console.error(
      "Profile Visitors Error:",
      visitorError.response?.data || visitorError.message
    );
  }
}
      // Record profile visit
if (!isOwnProfile) {
  try {
    await axios.post(
      `${API_URL}/profile-visits/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (visitError) {
    console.error(
      "Profile Visit Error:",
      visitError.response?.data || visitError.message
    );
  }
}
    } catch (error) {
      console.error(
        "User Profile Error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <Loader2
            size={28}
            className="animate-spin"
          />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center">
          <AlertCircle
            size={45}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-xl font-bold text-slate-900">
            Profile Error
          </h2>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const student = profile.Student;
  const college = profile.College;
  const company = profile.Company;
  const training = profile.TrainingInstitute;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}

      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() =>
                navigate("/student/dashboard")
              }
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-700"
            >
              <Edit3 size={17} />
              Update Profile
            </button>
          )}

        </div>
      </header>

      {/* Profile */}

      <main className="mx-auto max-w-5xl px-6 py-8">

        {/* Profile Header */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col items-center gap-5 sm:flex-row">

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold">
              {profile.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="text-center sm:text-left">

              <h1 className="text-3xl font-bold">
                {profile.name}
              </h1>

              <p className="mt-1 capitalize text-blue-400">
                {profile.role}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {profile.email}
              </p>

            </div>

          </div>

        </div>
        {/* Profile Views */}
{isOwnProfile && (
  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold">
          Profile Views
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          People who viewed your profile
        </p>
      </div>

      <div className="text-3xl font-bold text-blue-400">
        {profileViews}
      </div>
    </div>

    {profileVisitors.length > 0 ? (
      <div className="mt-6 space-y-3">
        {profileVisitors.map((visit) => (
          <div
            key={visit.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <div>
             <button
  type="button"
  onClick={() =>
    navigate(`/profile/${visit.visitor?.id}`)
  }
  className="text-left font-semibold text-white hover:text-blue-400"
>
  {visit.visitor?.name || "Unknown User"}
</button>

              <p className="text-sm capitalize text-slate-400">
                {visit.visitor?.role || "user"}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-blue-400">
                {visit.visitCount}
              </p>

             <p className="mt-1 text-xs text-slate-600">
  Last visited:{" "}
  {visit.lastVisitedAt
    ? new Date(visit.lastVisitedAt).toLocaleString()
    : "Unknown"}
</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="mt-6 text-sm text-slate-500">
        No one has viewed your profile yet.
      </p>
    )}
  </div>
)}


        {/* Basic Information */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-6 text-xl font-bold">
            Profile Information
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">

            <InfoCard
              icon={<User size={19} />}
              label="Name"
              value={profile.name}
            />
            <InfoCard
  icon={<User size={19} />}
  label="Bio"
  value={student?.bio}
/>

<InfoCard
  icon={<GraduationCap size={19} />}
  label="Skills"
  value={student?.skills}
/>

<InfoCard
  icon={<GraduationCap size={19} />}
  label="Education"
  value={student?.education}
/>

<InfoCard
  icon={<Building2 size={19} />}
  label="Experience"
  value={student?.experience}
/>

<InfoCard
  icon={<Building2 size={19} />}
  label="Projects"
  value={student?.projects}
/>

<InfoCard
  icon={<GraduationCap size={19} />}
  label="Achievements"
  value={student?.achievements}
/>

{student?.linkedin && (
  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Globe size={19} />
      LinkedIn
    </div>

    <a
      href={student.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block break-all font-medium text-blue-400 hover:underline"
    >
      {student.linkedin}
    </a>
  </div>
)}

{student?.github && (
  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Globe size={19} />
      GitHub
    </div>

    <a
      href={student.github}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block break-all font-medium text-blue-400 hover:underline"
    >
      {student.github}
    </a>
  </div>
)}

            <InfoCard
              icon={<Mail size={19} />}
              label="Email"
              value={profile.email}
            />

            {profile.role === "student" && (
              <>
                <InfoCard
                  icon={<Phone size={19} />}
                  label="Phone"
                  value={student?.phone}
                />

                <InfoCard
                  icon={<GraduationCap size={19} />}
                  label="College"
                  value={student?.college}
                />

                <InfoCard
                  icon={<GraduationCap size={19} />}
                  label="Course"
                  value={student?.course}
                />

                <InfoCard
                  icon={<GraduationCap size={19} />}
                  label="Branch"
                  value={student?.branch}
                />

                <InfoCard
                  icon={<GraduationCap size={19} />}
                  label="Passing Year"
                  value={student?.passingYear}
                />
              </>
            )}

            {profile.role === "college" && (
              <>
                <InfoCard
                  icon={<Phone size={19} />}
                  label="Phone"
                  value={college?.phone}
                />

                <InfoCard
                  icon={<Building2 size={19} />}
                  label="University"
                  value={college?.university}
                />

                <InfoCard
                  icon={<MapPin size={19} />}
                  label="Address"
                  value={college?.address}
                />

                <InfoCard
                  icon={<Globe size={19} />}
                  label="Website"
                  value={college?.website}
                />
              </>
            )}

            {profile.role === "company" && (
              <>
                <InfoCard
                  icon={<Phone size={19} />}
                  label="Phone"
                  value={company?.phone}
                />

                <InfoCard
                  icon={<Building2 size={19} />}
                  label="Industry"
                  value={company?.industry}
                />

                <InfoCard
                  icon={<Building2 size={19} />}
                  label="Company Size"
                  value={company?.companySize}
                />

                <InfoCard
                  icon={<MapPin size={19} />}
                  label="Location"
                  value={company?.location}
                />

                <InfoCard
                  icon={<Globe size={19} />}
                  label="Website"
                  value={company?.website}
                />
              </>
            )}

            {profile.role === "training" && (
              <>
                <InfoCard
                  icon={<Phone size={19} />}
                  label="Phone"
                  value={training?.phone}
                />

                <InfoCard
                  icon={<MapPin size={19} />}
                  label="Address"
                  value={training?.address}
                />

                <InfoCard
                  icon={<Globe size={19} />}
                  label="Website"
                  value={training?.website}
                />

                <InfoCard
                  icon={<GraduationCap size={19} />}
                  label="Categories"
                  value={training?.categories}
                />
              </>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

/* ================= INFO CARD ================= */

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

      <div className="flex items-center gap-2 text-sm text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 font-medium text-slate-200">
        {value || `No ${label.toLowerCase()} added`}
      </p>

    </div>
  );
}

export default UserProfile;