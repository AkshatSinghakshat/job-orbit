
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  Phone,
  FileText,
  Code2,
  FolderKanban,
  LoaderCircle,
  UserRound,
  AlertCircle,
  ExternalLink,
  CalendarDays,
  Building2,
  CheckCircle2,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function getInitials(name = "Candidate") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function displayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}

function Section({ icon, title, children }) {
  return (
    <section className="candidate-section">
      <div className="candidate-section-title">
        <span className="candidate-section-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="candidate-detail">
      <span className="candidate-detail-icon">{icon}</span>
      <div className="candidate-detail-content">
        <span className="candidate-detail-label">{label}</span>
        <strong>{displayValue(value)}</strong>
      </div>
    </div>
  );
}

function getStudent(record) {
  return (
    record?.Student ||
    record?.student ||
    record?.Candidate ||
    record?.candidate ||
    record?.applicant ||
    record?.user ||
    record
  );
}

function getResumeUrl(resume) {
  if (!resume || typeof resume !== "string") return "";

  if (/^https?:\/\//i.test(resume)) {
    return resume;
  }

  return `${API_URL}/${resume.replace(/^\/+/, "")}`;
}

function getExternalUrl(url) {
  if (!url || typeof url !== "string") return "";

  const trimmedUrl = url.trim();

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}

export default function CandidateDetails() {
  const { id } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCandidate() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          throw new Error(
            "Please log in to view candidate details."
          );
        }

        const response = await fetch(
          `${API_URL}/api/applications/${encodeURIComponent(id)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              `Unable to load candidate details (${response.status}).`
          );
        }

        const record =
          data.application ||
          data.data?.application ||
          data.candidate ||
          data.data ||
          data;

        const student = getStudent(record);

        if (!student || typeof student !== "object") {
          throw new Error("Candidate information was not found.");
        }

        setApplication(record);
        setCandidate(student);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (!id) {
      setError("Application ID is missing.");
      setLoading(false);
    } else {
      loadCandidate();
    }

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="candidate-page">
        <div className="candidate-state">
          <LoaderCircle
            className="candidate-spin"
            size={36}
          />
          <h2>Loading candidate profile</h2>
          <p>Please wait while we fetch the information.</p>
        </div>
        <CandidateStyles />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="candidate-page">
        <div className="candidate-state candidate-error-state">
          <AlertCircle size={42} />
          <h2>Unable to load profile</h2>
          <p>{error || "Candidate information was not found."}</p>

          <Link
            to="/company/applications"
            className="candidate-button"
          >
            <ArrowLeft size={17} />
            Back to Applications
          </Link>
        </div>
        <CandidateStyles />
      </div>
    );
  }

  const name =
    candidate.fullName ||
    candidate.name ||
    candidate.studentName ||
    candidate.username ||
    "Candidate";

  const email =
    candidate.email ||
    candidate.emailAddress ||
    candidate.user?.email;

  const phone =
    candidate.phone ||
    candidate.phoneNumber ||
    candidate.mobile;

  const title =
    candidate.title ||
    candidate.jobTitle ||
    candidate.headline ||
    candidate.designation ||
    "Job Seeker";

  const location =
    candidate.location ||
    candidate.city ||
    candidate.address;

  const education =
    candidate.qualification ||
    candidate.education ||
    candidate.degree ||
    candidate.highestQualification;

  const college =
    candidate.college ||
    candidate.collegeName ||
    candidate.university ||
    candidate.universityName;

  const passingYear =
    candidate.passingYear ||
    candidate.graduationYear;

  const percentage =
    candidate.percentage ||
    candidate.cgpa ||
    candidate.grade;

  const rawSkills = candidate.skills;

  const skills = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string"
      ? rawSkills
          .split(/[,;\n]/)
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

  const about =
    candidate.about ||
    candidate.bio ||
    candidate.summary ||
    candidate.description;

  const projects =
    candidate.projects ||
    candidate.projectDescription ||
    candidate.workExperience;

  const experience =
    candidate.experienceType ||
    candidate.experienceLevel ||
    (candidate.experienceYears
      ? `${candidate.experienceYears} years`
      : candidate.yearsOfExperience
        ? `${candidate.yearsOfExperience} years`
        : "");

  const linkedin = getExternalUrl(
    candidate.linkedin ||
      candidate.linkedinUrl ||
      candidate.linkedIn
  );

  const portfolio = getExternalUrl(
    candidate.githubUrl ||
      candidate.github ||
      candidate.portfolio ||
      candidate.portfolioUrl
  );

  const resume = getResumeUrl(
    candidate.resumeUrl ||
      candidate.resume ||
      candidate.cvUrl ||
      candidate.resumePath
  );

  const status = application?.status;

  const appliedAt =
    application?.createdAt ||
    application?.appliedAt ||
    candidate.appliedAt;

  const jobTitle =
    application?.Job?.title ||
    application?.job?.title ||
    application?.jobTitle ||
    application?.job?.jobTitle;

  return (
    <div className="candidate-page">
      <header className="candidate-header">
        <Link
          to="/company/applications"
          className="candidate-brand"
        >
          <span className="candidate-brand-icon">
            <BriefcaseBusiness size={22} />
          </span>
          <span>
            Job<span>Orbit</span>
          </span>
        </Link>

        <Link
          to="/company/applications"
          className="candidate-back-link"
        >
          <ArrowLeft size={17} />
          Back to Applications
        </Link>
      </header>

      <main className="candidate-container">
        <div className="candidate-page-intro">
          <span className="candidate-eyebrow">
            COMPANY WORKSPACE
          </span>
          <h1>Candidate Profile</h1>
          <p>
            Review the candidate's professional information.
          </p>
        </div>

        <div className="candidate-profile-card">
          <div className="candidate-cover" />

          <div className="candidate-profile-content">
            <div className="candidate-profile-top">
              <div className="candidate-avatar">
                {getInitials(name)}
              </div>

              <div className="candidate-primary-info">
                <h2>{name}</h2>
                <p>{displayValue(title, "Job Applicant")}</p>

                <div className="candidate-primary-meta">
                  {location && (
                    <span>
                      <MapPin size={15} />
                      {location}
                    </span>
                  )}

                  {status && (
                    <span className="candidate-status">
                      <CheckCircle2 size={14} />
                      {String(status)}
                    </span>
                  )}
                </div>
              </div>

              {resume && (
                <a
                  className="candidate-resume-button"
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={17} />
                  View Resume
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            <div className="candidate-details-grid">
              <Detail
                icon={<Mail size={18} />}
                label="Email Address"
                value={email}
              />

              <Detail
                icon={<Phone size={18} />}
                label="Phone Number"
                value={phone}
              />

              <Detail
                icon={<GraduationCap size={19} />}
                label="Qualification"
                value={education}
              />

              <Detail
                icon={<Building2 size={18} />}
                label="College / University"
                value={college}
              />

              <Detail
                icon={<CalendarDays size={18} />}
                label="Passing Year"
                value={passingYear}
              />

              <Detail
                icon={<GraduationCap size={18} />}
                label="Percentage / CGPA"
                value={percentage}
              />

              <Detail
                icon={<BriefcaseBusiness size={18} />}
                label="Experience"
                value={experience}
              />

              {jobTitle && (
                <Detail
                  icon={<BriefcaseBusiness size={18} />}
                  label="Applied Job"
                  value={jobTitle}
                />
              )}

              {appliedAt && (
                <Detail
                  icon={<CalendarDays size={18} />}
                  label="Applied On"
                  value={new Date(appliedAt).toLocaleDateString(
                    "en-IN"
                  )}
                />
              )}
            </div>

            <Section
              icon={<UserRound size={20} />}
              title="About Candidate"
            >
              <p className="candidate-about">
                {displayValue(
                  about,
                  "The candidate has not added an introduction yet."
                )}
              </p>
            </Section>

            <Section
              icon={<Code2 size={20} />}
              title="Skills"
            >
              {skills.length > 0 ? (
                <div className="candidate-skills">
                  {skills.map((skill, index) => (
                    <span key={`${skill}-${index}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="candidate-muted">
                  No skills added yet.
                </p>
              )}
            </Section>

            <Section
              icon={<FolderKanban size={20} />}
              title="Projects & Experience"
            >
              <p className="candidate-about">
                {displayValue(
                  projects,
                  "No projects or work experience details provided."
                )}
              </p>
            </Section>

            {(linkedin || portfolio) && (
              <Section
                icon={<ExternalLink size={20} />}
                title="Online Profiles"
              >
                <div className="candidate-social-links">
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={17} />
                      LinkedIn
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {portfolio && (
                    <a
                      href={portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Code2 size={17} />
                      GitHub / Portfolio
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </Section>
            )}

            <div className="candidate-profile-footer">
              <div>
                <strong>Application ID:</strong>{" "}
                {displayValue(application?.id, id)}
              </div>

              <Link to="/company/applications">
                <ArrowLeft size={16} />
                Return to Applications
              </Link>
            </div>
          </div>
        </div>
      </main>

      <CandidateStyles />
    </div>
  );
}

function CandidateStyles() {
  return (
    <style>{`
      .candidate-page {
        min-height: 100vh;
        padding: 0 22px 45px;
        background: #f5f8fd;
        color: #192944;
        font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
      }

      .candidate-page * { box-sizing: border-box; }

      .candidate-header {
        max-width: 1050px;
        min-height: 78px;
        margin: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .candidate-brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: #1b2b47;
        font-size: 24px;
        font-weight: 850;
        text-decoration: none;
      }

      .candidate-brand > span:last-child > span {
        color: #2563eb;
      }

      .candidate-brand-icon {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #187bff, #4f46e5);
        color: white;
      }

      .candidate-back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 13px;
        border: 1px solid #dce4f0;
        border-radius: 10px;
        background: white;
        color: #34445e;
        text-decoration: none;
        font-size: 13px;
        font-weight: 650;
      }

      .candidate-container {
        max-width: 900px;
        margin: 25px auto 0;
      }

      .candidate-page-intro { margin-bottom: 22px; }

      .candidate-eyebrow {
        color: #2865df;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.7px;
      }

      .candidate-page-intro h1 {
        margin: 8px 0 5px;
        font-size: 30px;
        letter-spacing: -.7px;
      }

      .candidate-page-intro p {
        margin: 0;
        color: #718099;
        font-size: 14px;
      }

      .candidate-profile-card {
        overflow: hidden;
        border: 1px solid #e1e8f2;
        border-radius: 19px;
        background: white;
        box-shadow: 0 15px 45px #1e3a6a0d;
      }

      .candidate-cover {
        height: 145px;
        background:
          radial-gradient(circle at 85% 15%, #ffffff30 0 50px, transparent 52px),
          radial-gradient(circle at 95% 90%, #ffffff20 0 100px, transparent 102px),
          linear-gradient(115deg, #123c86, #2868e7 55%, #7654dd);
      }

      .candidate-profile-content {
        padding: 0 32px 30px;
      }

      .candidate-profile-top {
        display: flex;
        align-items: flex-end;
        gap: 19px;
        margin-top: -48px;
        padding-bottom: 25px;
        border-bottom: 1px solid #edf0f5;
      }

      .candidate-avatar {
        display: grid;
        place-items: center;
        flex-shrink: 0;
        width: 94px;
        height: 94px;
        border: 5px solid white;
        border-radius: 22px;
        background: #e4edff;
        color: #2058c9;
        font-size: 27px;
        font-weight: 850;
        box-shadow: 0 4px 15px #203f7010;
      }

      .candidate-primary-info {
        flex: 1;
        min-width: 0;
        padding-bottom: 5px;
      }

      .candidate-primary-info h2 {
        margin: 0 0 5px;
        font-size: 25px;
        overflow-wrap: anywhere;
      }

      .candidate-primary-info > p {
        margin: 0;
        color: #6d7a91;
        font-size: 14px;
      }

      .candidate-primary-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 9px 16px;
        margin-top: 12px;
      }

      .candidate-primary-meta span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #64738c;
        font-size: 12px;
        overflow-wrap: anywhere;
      }

      .candidate-primary-meta .candidate-status {
        padding: 5px 9px;
        border-radius: 20px;
        background: #e9f8ee;
        color: #178044;
        font-weight: 750;
      }

      .candidate-resume-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        flex-shrink: 0;
        padding: 10px 12px;
        border-radius: 10px;
        background: #215ee9;
        color: white;
        text-decoration: none;
        font-size: 12px;
        font-weight: 750;
      }

      .candidate-details-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 22px;
        padding: 27px 0;
        border-bottom: 1px solid #edf0f5;
      }

      .candidate-detail {
        display: flex;
        align-items: flex-start;
        gap: 11px;
        min-width: 0;
      }

      .candidate-detail-icon {
        display: grid;
        place-items: center;
        flex-shrink: 0;
        width: 38px;
        height: 38px;
        border-radius: 11px;
        background: #eef4ff;
        color: #2865df;
      }

      .candidate-detail-content {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
      }

      .candidate-detail-label {
        color: #7b879a;
        font-size: 11px;
      }

      .candidate-detail-content strong {
        color: #293852;
        font-size: 13px;
        font-weight: 700;
        overflow-wrap: anywhere;
      }

      .candidate-section { padding-top: 27px; }

      .candidate-section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }

      .candidate-section-title h2 {
        margin: 0;
        font-size: 16px;
      }

      .candidate-section-icon {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: #eef4ff;
        color: #2865df;
      }

      .candidate-about {
        margin: 0;
        color: #5f6f88;
        font-size: 13px;
        line-height: 1.9;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .candidate-muted {
        color: #8995a8;
        font-size: 13px;
      }

      .candidate-skills {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .candidate-skills span {
        padding: 8px 12px;
        border: 1px solid #dce7ff;
        border-radius: 9px;
        background: #f0f5ff;
        color: #2858bb;
        font-size: 12px;
        font-weight: 700;
      }

      .candidate-social-links {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .candidate-social-links a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: 1px solid #dce4f0;
        border-radius: 10px;
        color: #31557f;
        text-decoration: none;
        font-size: 12px;
        font-weight: 700;
      }

      .candidate-social-links a:hover,
      .candidate-back-link:hover {
        background: #f3f7ff;
      }

      .candidate-profile-footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #edf0f5;
        color: #8290a5;
        font-size: 11px;
      }

      .candidate-profile-footer a {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #2865df;
        text-decoration: none;
        font-size: 12px;
        font-weight: 750;
      }

      .candidate-state {
        max-width: 550px;
        margin: 100px auto;
        padding: 35px 25px;
        border: 1px solid #e1e8f2;
        border-radius: 18px;
        background: white;
        text-align: center;
        box-shadow: 0 15px 45px #1e3a6a0d;
      }

      .candidate-state > svg { color: #2563eb; }

      .candidate-state h2 {
        margin: 16px 0 8px;
        font-size: 21px;
      }

      .candidate-state p {
        color: #718099;
        font-size: 13px;
        line-height: 1.7;
      }

      .candidate-error-state > svg { color: #dc4545; }

      .candidate-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 15px;
        padding: 12px 16px;
        border-radius: 10px;
        background: #245fe7;
        color: white;
        text-decoration: none;
        font-size: 13px;
        font-weight: 700;
      }

      .candidate-spin {
        animation: candidate-spin 1s linear infinite;
      }

      @keyframes candidate-spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 650px) {
        .candidate-page { padding: 0 12px 25px; }
        .candidate-header { min-height: 70px; }
        .candidate-brand { font-size: 21px; }
        .candidate-back-link { padding: 9px; font-size: 11px; }
        .candidate-container { margin-top: 18px; }
        .candidate-page-intro h1 { font-size: 26px; }
        .candidate-cover { height: 110px; }
        .candidate-profile-content { padding: 0 17px 22px; }

        .candidate-profile-top {
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: -37px;
        }

        .candidate-avatar {
          width: 76px;
          height: 76px;
          border-radius: 18px;
          font-size: 23px;
        }

        .candidate-primary-info {
          flex-basis: calc(100% - 95px);
          padding-top: 32px;
        }

        .candidate-primary-info h2 { font-size: 20px; }
        .candidate-resume-button { width: 100%; }

        .candidate-details-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 18px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .candidate-spin { animation: none; }
      }
    `}</style>
  );
}
