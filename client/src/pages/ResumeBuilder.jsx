import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Download, Plus, Trash2, Eye, EyeOff, Palette,
  ChevronUp, ChevronDown, RotateCcw, Save, FileText,
  UserRound, GraduationCap, BriefcaseBusiness, Code2, Upload,
} from "lucide-react";

const initialData = {
  personal: {
    fullName: "",
    headline: "Fresher | Software Developer",
    email: "",
    phone: "",
    city: "",
    website: "",
    linkedin: "",
    github: "",
    portfolio: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    photo: "",
  },
  summary: "",
  skills: "",
  education: [
    { id: "edu1", degree: "", institution: "", location: "", start: "", end: "", grade: "", details: "" },
  ],
  experience: [
    { id: "exp1", role: "", company: "", location: "", start: "", end: "", details: "" },
  ],
  projects: [
    { id: "pro1", name: "", role: "", tech: "", link: "", details: "" },
  ],
  certifications: [
    { id: "cer1", name: "", issuer: "", date: "", link: "" },
  ],
  achievements: [],
  languages: [
    { id: "lan1", name: "Hindi", proficiency: "Native" },
    { id: "lan2", name: "English", proficiency: "Professional" },
  ],
  internships: [],
  volunteering: [],
  courses: [],
  publications: [],
  interests: [],
  references: [],
  customSections: [],
};

const sectionConfig = [
  { key: "summary", title: "Professional Summary", type: "text", icon: UserRound },
  { key: "education", title: "Education", type: "education", icon: GraduationCap },
  { key: "experience", title: "Work Experience", type: "experience", icon: BriefcaseBusiness },
  { key: "internships", title: "Internships", type: "experience", icon: BriefcaseBusiness },
  { key: "projects", title: "Projects", type: "projects", icon: Code2 },
  { key: "skills", title: "Technical Skills", type: "text", icon: Code2 },
  { key: "certifications", title: "Certifications", type: "certifications" },
  { key: "courses", title: "Courses & Training", type: "certifications" },
  { key: "achievements", title: "Achievements & Awards", type: "simple" },
  { key: "languages", title: "Languages", type: "language" },
  { key: "volunteering", title: "Volunteering", type: "experience" },
  { key: "publications", title: "Publications", type: "simple" },
  { key: "interests", title: "Interests & Hobbies", type: "simple" },
  { key: "references", title: "References", type: "simple" },
];

const emptyItems = {
  education: { degree: "", institution: "", location: "", start: "", end: "", grade: "", details: "" },
  experience: { role: "", company: "", location: "", start: "", end: "", details: "" },
  projects: { name: "", role: "", tech: "", link: "", details: "" },
  certifications: { name: "", issuer: "", date: "", link: "" },
  courses: { name: "", issuer: "", date: "", link: "" },
  internships: { role: "", company: "", location: "", start: "", end: "", details: "" },
  volunteering: { role: "", company: "", location: "", start: "", end: "", details: "" },
  achievements: { name: "", details: "" },
  languages: { name: "", proficiency: "" },
  publications: { name: "", details: "" },
  interests: { name: "" },
  references: { name: "", details: "" },
};

const fieldConfig = {
  education: [
    ["degree", "Degree / Qualification"],
    ["institution", "College / University"],
    ["location", "Location"],
    ["start", "Start Year"],
    ["end", "End Year"],
    ["grade", "CGPA / Percentage"],
    ["details", "Subjects, coursework or details", true],
  ],
  experience: [
    ["role", "Job Title / Role"],
    ["company", "Company"],
    ["location", "Location"],
    ["start", "Start Date"],
    ["end", "End Date"],
    ["details", "Responsibilities and achievements", true],
  ],
  projects: [
    ["name", "Project Name"],
    ["role", "Your Role"],
    ["tech", "Technologies Used"],
    ["link", "Project URL"],
    ["details", "Description and achievements", true],
  ],
  certifications: [
    ["name", "Certificate / Course Name"],
    ["issuer", "Issuing Organization"],
    ["date", "Completion Date"],
    ["link", "Credential URL"],
  ],
  courses: [
    ["name", "Course Name"],
    ["issuer", "Platform / Organization"],
    ["date", "Completion Date"],
    ["link", "Course URL"],
  ],
  internships: [
    ["role", "Internship Role"],
    ["company", "Organization"],
    ["location", "Location"],
    ["start", "Start Date"],
    ["end", "End Date"],
    ["details", "Work and achievements", true],
  ],
  volunteering: [
    ["role", "Volunteer Role"],
    ["company", "Organization"],
    ["location", "Location"],
    ["start", "Start Date"],
    ["end", "End Date"],
    ["details", "Contributions", true],
  ],
  achievements: [
    ["name", "Achievement / Award"],
    ["details", "Description", true],
  ],
  publications: [
    ["name", "Publication Title"],
    ["details", "Publisher, date or URL", true],
  ],
  interests: [["name", "Interest / Hobby"]],
  references: [
    ["name", "Reference Name"],
    ["details", "Designation and contact (optional)", true],
  ],
  languages: [
    ["name", "Language"],
    ["proficiency", "Proficiency Level"],
  ],
};

const templates = [
  { value: "classic", label: "Classic ATS" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
];

const defaultSections = sectionConfig.map((s) => s.key);

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function loadSaved() {
  try {
    const saved = localStorage.getItem("joborbit-resume-v2");
    if (!saved) return initialData;
    return { ...initialData, ...JSON.parse(saved) };
  } catch {
    return initialData;
  }
}


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// PDF.js worker is bundled by Vite so uploaded, text-based PDFs can be read in-browser.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const asText = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return item;
      return item?.name || item?.title || item?.skill || "";
    }).filter(Boolean).join(", ");
  }
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
};

const mapDashboardStudent = (student) => {
  if (!student) return {};
  const educationItems = Array.isArray(student.education) ? student.education : [];
  const experienceItems = Array.isArray(student.experience) ? student.experience : [];
  const projectItems = Array.isArray(student.projects) ? student.projects : [];
  const certificationItems = Array.isArray(student.certifications) ? student.certifications : [];

  const mapped = {
    personal: {
      fullName: student.name || student.fullName || "",
      headline: student.headline || student.designation || "Fresher | Software Developer",
      email: student.email || "",
      phone: student.phone || student.mobile || "",
      city: student.city || student.location || "",
      website: student.website || "",
      linkedin: student.linkedin || student.linkedinUrl || "",
      github: student.github || student.githubUrl || "",
      portfolio: student.portfolio || "",
      dateOfBirth: student.dateOfBirth || "",
      nationality: student.nationality || "",
      address: student.address || "",
      photo: student.profileImage || student.avatar || "",
    },
    summary: student.bio || student.summary || "",
    skills: asText(student.skills),
  };

  if (educationItems.length) {
    mapped.education = educationItems.map((item, index) => ({
      id: item.id || `dashboard-edu-${index}`,
      degree: item.degree || item.course || item.qualification || "",
      institution: item.institution || item.college || item.university || "",
      location: item.location || "",
      start: item.start || item.startYear || "",
      end: item.end || item.endYear || item.passingYear || "",
      grade: item.grade || item.cgpa || item.percentage || "",
      details: item.details || "",
    }));
  } else if (student.course || student.college || student.branch) {
    mapped.education = [{
      id: "dashboard-education",
      degree: [student.course, student.branch].filter(Boolean).join(" - "),
      institution: student.college || "",
      location: student.city || student.location || "",
      start: student.startYear || "",
      end: student.passingYear || "",
      grade: student.cgpa || student.percentage || "",
      details: "",
    }];
  }

  if (experienceItems.length) {
    mapped.experience = experienceItems.map((item, index) => ({
      id: item.id || `dashboard-exp-${index}`,
      role: item.role || item.title || "",
      company: item.company || item.organization || "",
      location: item.location || "",
      start: item.start || item.startDate || "",
      end: item.end || item.endDate || "",
      details: item.details || item.description || "",
    }));
  }
  if (projectItems.length) {
    mapped.projects = projectItems.map((item, index) => ({
      id: item.id || `dashboard-project-${index}`,
      name: item.name || item.title || "",
      role: item.role || "",
      tech: asText(item.tech || item.technologies || item.techStack),
      link: item.link || item.url || "",
      details: item.details || item.description || "",
    }));
  }
  if (certificationItems.length) {
    mapped.certifications = certificationItems.map((item, index) => ({
      id: item.id || `dashboard-cert-${index}`,
      name: item.name || item.title || "",
      issuer: item.issuer || item.organization || "",
      date: item.date || "",
      link: item.link || item.url || "",
    }));
  }
  if (Array.isArray(student.achievements) && student.achievements.length) {
    mapped.achievements = student.achievements.map((item, index) =>
      typeof item === "string"
        ? { id: `dashboard-ach-${index}`, name: item, details: "" }
        : { id: item.id || `dashboard-ach-${index}`, name: item.name || item.title || "", details: item.details || item.description || "" }
    );
  }
  return mapped;
};

const fillMissingResumeData = (current, incoming) => {
  const merged = { ...current, personal: { ...current.personal } };
  for (const [key, value] of Object.entries(incoming)) {
    if (key === "personal") {
      for (const [personalKey, personalValue] of Object.entries(value || {})) {
        if (!String(merged.personal[personalKey] || "").trim() && String(personalValue || "").trim()) {
          merged.personal[personalKey] = personalValue;
        }
      }
    } else if (typeof value === "string") {
      if (!String(merged[key] || "").trim() && value.trim()) merged[key] = value;
    } else if (Array.isArray(value) && value.length) {
      const currentItems = merged[key] || [];
      const hasRealContent = currentItems.some((item) =>
        Object.entries(item || {}).some(([field, val]) => field !== "id" && String(val || "").trim())
      );
      if (!hasRealContent) merged[key] = value;
    }
  }
  return merged;
};

export default function ResumeBuilder() {
  const [data, setData] = useState(loadSaved);
  const [activeTab, setActiveTab] = useState("personal");
  const [template, setTemplate] = useState("classic");
  const [accent, setAccent] = useState("#2563eb");
  const [fontSize, setFontSize] = useState("13");
  const [fontFamily, setFontFamily] = useState("Arial, Helvetica, sans-serif");
  const [textColor, setTextColor] = useState("#1e293b");
  const [importStatus, setImportStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const resumeFileRef = useRef(null);
  const [visible, setVisible] = useState(
    Object.fromEntries(defaultSections.map((key) => [key, true]))
  );
  const [order, setOrder] = useState(defaultSections);
  const [customTitle, setCustomTitle] = useState("");
  const [customText, setCustomText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("joborbit-resume-v2", JSON.stringify(data));
      setSaved(true);
      const id = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(id);
    } catch {
      setSaved(false);
    }
  }, [data]);

  // Prefill blank resume fields from the signed-in student's JobOrbit profile.
  // Existing resume entries are preserved so manually edited content is not overwritten.
  useEffect(() => {
    let cancelled = false;

    const loadStudentProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/student/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const payload = await response.json();
        const student = payload?.student || payload?.data?.student || payload?.data || payload;
        const profileData = mapDashboardStudent(student);
        if (!cancelled) {
          setData((current) => fillMissingResumeData(current, profileData));
        }
      } catch (error) {
        console.error("Could not prefill resume from student profile:", error);
      }
    };

    loadStudentProfile();
    return () => { cancelled = true; };
  }, []);

  const importResumePdf = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setImportStatus("Please select a PDF resume file.");
      return;
    }
    setIsImporting(true);
    setImportStatus("Reading PDF and detecting resume details...");
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pages = [];
      for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
        const page = await pdf.getPage(pageNo);
        const content = await page.getTextContent();
        let previousY = null;
        let pageText = "";
        for (const item of content.items) {
          const y = item.transform?.[5];
          if (previousY !== null && y !== undefined && Math.abs(y - previousY) > 3) {
            pageText += "\\n";
          } else if (pageText && !pageText.endsWith("\\n")) {
            pageText += " ";
          }
          pageText += item.str || "";
          if (y !== undefined) previousY = y;
        }
        pages.push(pageText);
      }
      const text = pages.join("\n").replace(/[ \t]+/g, " ");
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
      const phone = text.match(/(?:\+?91[ -]?)?[6-9]\d{9}\b/)?.[0] || "";
      const urls = text.match(/https?:\/\/[^\s)]+/gi) || [];
      const linkedin = urls.find((url) => /linkedin\.com/i.test(url)) || "";
      const github = urls.find((url) => /github\.com/i.test(url)) || "";
      const headingIndex = lines.findIndex((line) => /^(professional summary|summary|profile|objective)\b/i.test(line));
      const summary = headingIndex >= 0 ? (lines[headingIndex + 1] || "") : "";
      const skillIndex = lines.findIndex((line) => /^(technical skills|skills|core skills)\b/i.test(line));
      const skills = skillIndex >= 0 ? (lines[skillIndex + 1] || "") : "";
      const nameCandidate = lines.find((line) =>
        /^[A-Z][A-Z .'-]{2,45}$/.test(line) &&
        !/RESUME|CURRICULUM VITAE|PROFILE|SUMMARY|EDUCATION|SKILLS|EXPERIENCE/i.test(line)
      ) || "";
      const educationIndex = lines.findIndex((line) => /^education\b/i.test(line));
      const educationText = educationIndex >= 0 ? lines.slice(educationIndex + 1, educationIndex + 4).join(" | ") : "";
      const projectIndex = lines.findIndex((line) => /^(projects|personal projects)\b/i.test(line));
      const projectText = projectIndex >= 0 ? lines.slice(projectIndex + 1, projectIndex + 3).join(" ") : "";

      setData((current) => {
        const next = {
          ...current,
          personal: {
            ...current.personal,
            fullName: current.personal.fullName || nameCandidate,
            email: current.personal.email || email,
            phone: current.personal.phone || phone,
            linkedin: current.personal.linkedin || linkedin,
            github: current.personal.github || github,
          },
          summary: current.summary || summary,
          skills: current.skills || skills,
        };
        if (educationText && !(current.education || []).some((item) => item.degree || item.institution)) {
          next.education = [{ ...emptyItems.education, id: makeId(), details: educationText }];
        }
        if (projectText && !(current.projects || []).some((item) => item.name || item.details)) {
          next.projects = [{ ...emptyItems.projects, id: makeId(), details: projectText }];
        }
        return next;
      });
      setImportStatus(
        text.trim()
          ? `Imported text from ${file.name}. Please review the fields—PDF formatting varies, so some details may need manual correction.`
          : "This PDF has no selectable text (it may be scanned). Use an OCR-enabled PDF or enter details manually."
      );
      setActiveTab("personal");
    } catch (error) {
      console.error("Resume PDF import failed:", error);
      setImportStatus("Could not read this PDF. Try another text-based PDF resume.");
    } finally {
      setIsImporting(false);
      if (resumeFileRef.current) resumeFileRef.current.value = "";
    }
  };

  const updatePersonal = (key, value) => {
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [key]: value },
    }));
  };

  const updateValue = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (section, id, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addItem = (section) => {
    setData((prev) => ({
      ...prev,
      [section]: [
        ...(prev[section] || []),
        { id: makeId(), ...(emptyItems[section] || { name: "", details: "" }) },
      ],
    }));
  };

  const removeItem = (section, id) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  const moveSection = (key, direction) => {
    setOrder((prev) => {
      const index = prev.indexOf(key);
      const next = index + direction;
      if (next < 0 || next >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[next]] = [updated[next], updated[index]];
      return updated;
    });
  };

  const reset = () => {
    if (!window.confirm("Reset your entire resume? This cannot be undone.")) return;
    setData(initialData);
    setTemplate("classic");
    setAccent("#2563eb");
    setFontSize("13");
    setOrder(defaultSections);
    setVisible(Object.fromEntries(defaultSections.map((key) => [key, true])));
    localStorage.removeItem("joborbit-resume-v2");
  };

  const addCustomSection = () => {
    const title = customTitle.trim();
    if (!title) return;
    const id = `custom-${makeId()}`;
    setData((prev) => ({
      ...prev,
      customSections: [
        ...(prev.customSections || []),
        { id, title, text: customText },
      ],
    }));
    setOrder((prev) => [...prev, id]);
    setVisible((prev) => ({ ...prev, [id]: true }));
    setCustomTitle("");
    setCustomText("");
    setActiveTab(id);
  };

  const field = (label, value, onChange, multiline = false, placeholder = "") => (
    <label className="block min-w-0">
      <span className="mb-1 block text-sm font-medium text-slate-200">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || label}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      ) : (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || label}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      )}
    </label>
  );

  const renderPersonal = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        ["fullName", "Full Name"],
        ["headline", "Professional Headline"],
        ["email", "Email Address"],
        ["phone", "Phone Number"],
        ["city", "City / Location"],
        ["website", "Personal Website"],
        ["linkedin", "LinkedIn URL"],
        ["github", "GitHub URL"],
        ["portfolio", "Portfolio URL"],
        ["dateOfBirth", "Date of Birth (optional)"],
        ["nationality", "Nationality (optional)"],
        ["address", "Address (optional)"],
        ["photo", "Photo URL (optional)"],
      ].map(([key, label]) => (
        <div key={key}>
          {field(label, data.personal[key], (v) => updatePersonal(key, v))}
        </div>
      ))}
    </div>
  );

  const renderSectionEditor = (section) => {
    const config = sectionConfig.find((s) => s.key === section);
    const custom = (data.customSections || []).find((s) => s.id === section);

    if (custom) {
      return (
        <div className="space-y-4">
          {field("Section Title", custom.title, (v) =>
            updateValue("customSections", data.customSections.map((s) =>
              s.id === section ? { ...s, title: v } : s
            ))
          )}
          {field("Section Content", custom.text, (v) =>
            updateValue("customSections", data.customSections.map((s) =>
              s.id === section ? { ...s, text: v } : s
            )), true, "Add any additional information...")}
          <button onClick={() => {
            setData((prev) => ({
              ...prev,
              customSections: prev.customSections.filter((s) => s.id !== section),
            }));
            setOrder((prev) => prev.filter((k) => k !== section));
            setActiveTab("personal");
          }} className="text-sm font-semibold text-red-600">
            Delete Custom Section
          </button>
        </div>
      );
    }

    if (!config) return null;
    if (config.type === "text") {
      return field(
        config.title,
        data[section],
        (v) => updateValue(section, v),
        true,
        section === "skills"
          ? "JavaScript, React, Node.js, MySQL, Git..."
          : "Write a concise, professional summary..."
      );
    }

    return (
      <div className="space-y-4">
        {(data[section] || []).map((item, index) => (
          <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <strong className="text-sm text-slate-100">
                {config.title} #{index + 1}
              </strong>
              <button
                onClick={() => removeItem(section, item.id)}
                title="Delete entry"
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={17} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(fieldConfig[section] || []).map(([key, label, multiline]) => (
                <div key={key} className={multiline ? "sm:col-span-2" : ""}>
                  {field(label, item[key], (v) => updateItem(section, item.id, key, v), !!multiline)}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={() => addItem(section)}
          className="flex items-center gap-2 rounded-lg border border-blue-500/40 px-4 py-2.5 text-sm font-semibold text-blue-300 hover:bg-blue-500/10"
        >
          <Plus size={17} /> Add {config.title} Entry
        </button>
      </div>
    );
  };

  const renderPreviewSection = (key) => {
    const custom = (data.customSections || []).find((s) => s.id === key);
    const config = sectionConfig.find((s) => s.key === key);
    const title = custom?.title || config?.title;
    if (!title) return null;

    const heading = (
      <h2 className="resume-section-heading mb-3 flex items-center gap-3 border-b pb-2 text-[0.82rem] font-extrabold uppercase tracking-[0.16em]"
        style={{ borderColor: `${accent}55`, color: accent }}>
        <span className="h-4 w-1 rounded-full" style={{ backgroundColor: accent }} />
        {title}
      </h2>
    );

    if (custom) {
      return custom.text?.trim() ? (
        <section key={key} className="resume-section mb-4">
          {heading}
          <p className="whitespace-pre-wrap">{custom.text}</p>
        </section>
      ) : null;
    }

    if (key === "summary" || key === "skills") {
      const value = data[key];
      return value?.trim() ? (
        <section key={key} className="resume-section mb-4">
          {heading}
          <p className="whitespace-pre-wrap break-words">
            {key === "skills"
              ? value.split(",").map((s) => s.trim()).filter(Boolean).join("  •  ")
              : value}
          </p>
        </section>
      ) : null;
    }

    const items = (data[key] || []).filter((item) =>
      Object.entries(item).some(([k, v]) => k !== "id" && String(v || "").trim())
    );
    if (!items.length) return null;

    return (
      <section key={key} className="resume-section mb-4">
        {heading}
        <div className="space-y-3">
          {items.map((item) => {
            if (key === "education") {
              return (
                <div key={item.id}>
                  <div className="flex flex-wrap justify-between gap-x-3">
                    <strong>{item.degree}</strong>
                    <span>{[item.start, item.end].filter(Boolean).join(" – ")}</span>
                  </div>
                  <p>{item.institution}{item.location ? ` | ${item.location}` : ""}</p>
                  {item.grade && <p>Grade: {item.grade}</p>}
                  {item.details && <p className="whitespace-pre-wrap">{item.details}</p>}
                </div>
              );
            }
            if (["experience", "internships", "volunteering"].includes(key)) {
              return (
                <div key={item.id}>
                  <div className="flex flex-wrap justify-between gap-x-3">
                    <strong>{item.role}</strong>
                    <span>{[item.start, item.end].filter(Boolean).join(" – ")}</span>
                  </div>
                  <p>{item.company}{item.location ? ` | ${item.location}` : ""}</p>
                  {item.details && <p className="whitespace-pre-wrap">{item.details}</p>}
                </div>
              );
            }
            if (key === "projects") {
              return (
                <div key={item.id}>
                  <strong>{item.name}</strong>
                  {item.role && <span> — {item.role}</span>}
                  {item.tech && <p className="italic">{item.tech}</p>}
                  {item.details && <p className="whitespace-pre-wrap">{item.details}</p>}
                  {item.link && <p className="break-all">{item.link}</p>}
                </div>
              );
            }
            if (["certifications", "courses"].includes(key)) {
              return (
                <div key={item.id}>
                  <strong>{item.name}</strong>
                  <p>{[item.issuer, item.date].filter(Boolean).join(" | ")}</p>
                  {item.link && <p className="break-all">{item.link}</p>}
                </div>
              );
            }
            if (key === "languages") {
              return <p key={item.id}>{item.name}{item.proficiency ? ` — ${item.proficiency}` : ""}</p>;
            }
            return (
              <div key={item.id}>
                <strong>{item.name}</strong>
                {item.details && <p className="whitespace-pre-wrap">{item.details}</p>}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 px-3 py-5 text-white sm:px-6 lg:px-8">
      <style>{`
        #joborbit-resume { color: #1e293b; }
        #joborbit-resume .resume-section { margin-bottom: 1.15rem; }
        #joborbit-resume .resume-section p { margin-top: 0.18rem; line-height: 1.55; }
        #joborbit-resume .resume-section strong { color: #0f172a; font-weight: 700; }
        #joborbit-resume .resume-section-heading { page-break-after: avoid; }
        #joborbit-resume a { color: inherit; text-decoration: none; }
        @page { size: A4; margin: 12mm; }
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden !important; }
          #joborbit-resume, #joborbit-resume * { visibility: visible !important; }
          #joborbit-resume {
            position: absolute; left: 0; top: 0; width: 100%;
            margin: 0; padding: 0; box-shadow: none !important;
          }
          .no-print { display: none !important; }
          .resume-section { break-inside: avoid; }
          #joborbit-resume { border-radius: 0 !important; min-height: 0 !important; padding: 0 !important; }
          #joborbit-resume .resume-section { margin-bottom: 0.8rem !important; }
          #joborbit-resume header { break-inside: avoid; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>

      <header className="no-print mx-auto mb-6 flex max-w-[1720px] flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div>
          <div className="text-sm font-bold tracking-widest text-blue-400">JOBORBIT</div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Professional Resume Builder
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, customize and preview your resume.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Save size={15} /> {saved ? "Auto-saved on this device" : "Saving locally..."}
          </span>
          <button onClick={reset}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
            <Download size={17} /> Export PDF
          </button>
        </div>
      </header>

      <div className="no-print mx-auto mb-5 flex max-w-[1600px] flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-200">
        <Palette size={19} className="text-slate-600" />
        <label className="text-sm font-medium">Template
          <select value={template} onChange={(e) => setTemplate(e.target.value)}
            className="ml-2 rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100">
            {templates.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Accent
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
            className="ml-2 h-9 w-10 cursor-pointer rounded border border-slate-700 bg-slate-950 p-1" />
        </label>
        <label className="text-sm font-medium">Font size
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}
            className="ml-2 rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100">
            <option value="11">Small</option>
            <option value="12">Compact</option>
            <option value="13">Normal</option>
            <option value="14">Large</option>
            <option value="15">Extra Large</option>
          </select>
        </label>
        <label className="text-sm font-medium">Font
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
            className="ml-2 rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100">
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">Text colour
          <input aria-label="Resume text colour" type="color" value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-9 w-10 cursor-pointer rounded border border-slate-700 bg-slate-950 p-1" />
        </label>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input ref={resumeFileRef} type="file" accept=".pdf,application/pdf" className="hidden"
            onChange={(e) => importResumePdf(e.target.files?.[0])} />
          <button type="button" onClick={() => resumeFileRef.current?.click()} disabled={isImporting}
            className="flex items-center gap-2 rounded-lg border border-blue-500/50 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-300 hover:bg-blue-500/20 disabled:opacity-60">
            <Upload size={16} /> {isImporting ? "Importing PDF..." : "Upload Old Resume (PDF)"}
          </button>
        </div>
        {importStatus && <p role="status" className="w-full text-xs text-slate-300">{importStatus}</p>}
      </div>

      <div className="mx-auto grid max-w-[1720px] items-start gap-5 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="no-print min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 bg-slate-950/50 p-3">
            <button onClick={() => setActiveTab("personal")}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === "personal" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
              Personal Details
            </button>
            {order.map((key) => {
              const config = sectionConfig.find((s) => s.key === key);
              const custom = (data.customSections || []).find((s) => s.id === key);
              return (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === key ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                  {custom?.title || config?.title || key}
                </button>
              );
            })}
            <button onClick={() => setActiveTab("settings")}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === "settings" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
              Sections & Settings
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "personal" && (
              <>
                <h2 className="mb-5 text-xl font-bold text-white">Personal Information</h2>
                {renderPersonal()}
              </>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-3 text-xl font-bold text-white">Manage Sections</h2>
                  <p className="mb-4 text-sm text-slate-400">
                    Hide sections you don't need, or change their order.
                  </p>
                  <div className="space-y-2">
                    {order.map((key, index) => {
                      const config = sectionConfig.find((s) => s.key === key);
                      const custom = (data.customSections || []).find((s) => s.id === key);
                      return (
                        <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 p-2">
                          <button onClick={() => setVisible((p) => ({ ...p, [key]: p[key] === false }))}
                            title="Show or hide" className="p-2">
                            {visible[key] === false ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
                            {custom?.title || config?.title || key}
                          </span>
                          <button onClick={() => moveSection(key, -1)} disabled={index === 0}
                            className="rounded p-1 disabled:opacity-30" title="Move up">
                            <ChevronUp size={17} />
                          </button>
                          <button onClick={() => moveSection(key, 1)} disabled={index === order.length - 1}
                            className="rounded p-1 disabled:opacity-30" title="Move down">
                            <ChevronDown size={17} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-5">
                  <h3 className="mb-3 font-bold text-white">Create Your Own Section</h3>
                  <div className="space-y-3">
                    {field("Custom Section Name", customTitle, setCustomTitle, false, "e.g. Open Source Contributions")}
                    {field("Content", customText, setCustomText, true, "Write your additional details...")}
                    <button onClick={addCustomSection}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
                      <Plus size={17} /> Add Custom Section
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "personal" && activeTab !== "settings" && (
              <>
                <h2 className="mb-5 text-xl font-bold text-white">
                  {(data.customSections || []).find((s) => s.id === activeTab)?.title ||
                    sectionConfig.find((s) => s.key === activeTab)?.title}
                </h2>
                {renderSectionEditor(activeTab)}
              </>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="no-print mb-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-slate-200">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <FileText size={18} /> Live Resume Preview
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">A4 • PDF-ready</span>
          </div>

          <article id="joborbit-resume"
            className={`mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-hidden rounded-sm bg-white px-7 py-8 text-slate-800 shadow-2xl sm:px-12 sm:py-11 ${template === "modern" ? "border-t-8" : ""} ${template === "minimal" ? "shadow-sm" : ""}`}
            style={{
              borderTopColor: template === "modern" ? accent : undefined,
              fontSize: `${fontSize}px`,
              fontFamily,
              color: textColor,
              lineHeight: 1.55,
              overflowWrap: "anywhere",
            }}>
            <header className="resume-header mb-6 border-b-2 pb-5"
              style={{ borderColor: accent }}>
              <div className="flex items-start gap-4">
                {data.personal.photo && (
                  <img src={data.personal.photo} alt="Profile"
                    className="h-20 w-20 shrink-0 rounded-2xl border-2 object-cover"
                    style={{ borderColor: `${accent}35` }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-slate-500">Curriculum Vitae</p>
                  <h1 className={`break-words text-[2rem] font-black leading-tight tracking-tight ${template === "minimal" ? "normal-case" : "uppercase"}`}
                    style={{ color: accent }}>
                    {data.personal.fullName || "YOUR NAME"}
                  </h1>
                  {data.personal.headline && <p className="mt-2 text-base font-semibold text-slate-700">{data.personal.headline}</p>}
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.72rem] text-slate-600">
                    {[
                      [data.personal.email, "✉"], [data.personal.phone, "☎"], [data.personal.city, "⌖"],
                      [data.personal.website, "↗"], [data.personal.linkedin, "in"],
                      [data.personal.github, "⌘"], [data.personal.portfolio, "↗"],
                    ].filter(([value]) => value?.trim()).map(([value, icon], i) => (
                      <span key={`${value}-${i}`} className="inline-flex min-w-0 items-center gap-1.5 break-all">
                        <span className="font-bold" style={{ color: accent }}>{icon}</span>{value}
                      </span>
                    ))}
                  </div>
                  {(data.personal.dateOfBirth || data.personal.nationality || data.personal.address) && (
                    <p className="mt-2 text-[0.68rem] text-slate-500">
                      {[data.personal.dateOfBirth, data.personal.nationality, data.personal.address].filter(Boolean).join("  •  ")}
                    </p>
                  )}
                </div>
              </div>
            </header>

            {order.map((key) => visible[key] === false ? null : renderPreviewSection(key))}
          </article>
          <p className="no-print mt-3 text-center text-xs text-slate-500">
Click Export PDF, then select Save as PDF in the browser dialog          </p>
        </div>
      </div>
    </div>
  );
}
