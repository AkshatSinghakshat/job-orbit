

import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useNavigate, useParams } from "react-router-dom";

import {

  BriefcaseBusiness,

  UserRound,

  GraduationCap,

  Code2,

  FileUp,

  MessageSquareText,

  ArrowLeft,

  Send,

  LoaderCircle,

  CheckCircle2,

  Info,

  MapPin,

  Building2,

  X,

} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();



const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");



const initialForm = {

  fullName: "",

  email: "",

  phone: "",

  city: "",

  linkedin: "",

  github: "",

  qualification: "",

  college: "",

  passingYear: "",

  percentage: "",

  experienceType: "Fresher",

  experienceYears: "",

  skills: "",

  projects: "",

  expectedSalary: "",

  availability: "Immediately",

  coverLetter: "",

};



function getToken() {

  return (

    localStorage.getItem("token") ||

    localStorage.getItem("authToken") ||

    localStorage.getItem("accessToken")

  );

}



async function readResponse(response) {

  const data = await response.json().catch(() => ({}));



  if (!response.ok) {

    throw new Error(

      data.message || data.error || `Request failed (${response.status})`

    );

  }



  return data;

}



function Section({ icon, title, description, children }) {
  return (
    <section className="mt-8 border-t border-slate-700 pt-7 first:mt-0 first:border-0 first:pt-0">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-400">{icon}</div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-slate-200">
        {label}{required && <span className="text-red-400"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60";

function findMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/[|,;]+$/, "");
  }
  return "";
}

function parseResumeText(text) {
  const clean = text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n");
  const lines = clean.split("\n").map((line) => line.trim()).filter(Boolean);
  const find = (patterns) => {
    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match?.[1]) return match[1].trim().replace(/[|,;]+$/, "");
    }
    return "";
  };
  const email = find([/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i]);
  const phone = find([/\b([6-9]\d{9})\b/, /(?:phone|mobile|contact)\s*[:|-]?\s*([+\d()\s-]{7,20})/i]);
  const linkedin = find([/(https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+)/i]);
  const github = find([/(https?:\/\/(?:www\.)?github\.com\/[^\s)]+)/i]);
  const qualification = find([/\b(MCA|M\.?Tech|MBA|B\.?Tech|BCA|B\.?Sc|B\.?Com|B\.?A\.?|Diploma|12th|10th)\b/i]);
  const college = find([/([A-Z][A-Za-z&.,' -]{3,70}(?:University|College|Institute))/i]);
  const year = find([/(?:passing year|graduation|year of passing)\s*[:|-]?\s*((?:19|20)\d{2})/i, /\b(20\d{2})\b/]);
  const percentage = find([/\b(\d{1,2}(?:\.\d{1,2})?\s?%|\d(?:\.\d{1,2})?\s?CGPA)\b/i]);
  const city = find([/\b(Lucknow|Delhi|Noida|Gurugram|Mumbai|Pune|Bengaluru|Hyderabad|Kanpur|Varanasi|Prayagraj|Sultanpur)\b/i]);
  const name = lines.find((line) => line.length >= 3 && line.length <= 45 && !/@|https?:|resume|curriculum vitae|\d{5,}/i.test(line) && !/^(profile|objective|education|experience|skills|projects|contact|summary)$/i.test(line)) || "";
  const skills = find([/(?:technical skills|skills|technologies)\s*[:\n-]+([^\n]{3,250})/i]);
  const projectIndex = clean.search(/projects|personal projects|work experience|internship/i);
  const projects = projectIndex >= 0 ? clean.slice(projectIndex, projectIndex + 700).split(/\n(?:education|skills|certifications|achievements)\b/i)[0].trim() : "";
  const experienceYears = find([/(\d+(?:\.\d+)?)\+?\s+years?\s+(?:of\s+)?experience/i]);
  return { fullName: name, email, phone, linkedin, github, city, qualification: qualification.toUpperCase().replace(/\./g, ""), college, passingYear: year, percentage, skills, projects, experienceYears };
}

async function extractPdfText(file) {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n += 1) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str || "").join(" "));
  }
  return pages.join("\n");
}

export default function ApplyForm() {

  const { id } = useParams();

  const navigate = useNavigate();



  const [job, setJob] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);



  useEffect(() => {

    const controller = new AbortController();



    async function loadJob() {

      try {

        setLoading(true);

        setError("");



        if (!id || !Number.isFinite(Number(id))) {

          throw new Error("Invalid job ID.");

        }



        const response = await fetch(`${API_URL}/api/jobs/${id}`, {

          signal: controller.signal,

        });



        const data = await readResponse(response);

        const jobData = data.job || data.data || data;



        if (!jobData || !jobData.id) {

          throw new Error("Job details could not be found.");

        }



        setJob(jobData);

      } catch (err) {

        if (err.name !== "AbortError") {

          setError(err.message || "Unable to load job details.");

        }

      } finally {

        if (!controller.signal.aborted) {

          setLoading(false);

        }

      }

    }



    loadJob();

    return () => controller.abort();

  }, [id]);



  function updateField(event) {

    const { name, value } = event.target;



    setForm((previous) => ({

      ...previous,

      [name]: value,

    }));

  }



  async function handleResume(event) {
    const file = event.target.files?.[0];
    if (!file) { setResume(null); return; }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload your resume as a PDF file.");
      event.target.value = "";
      setResume(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Resume must be 5 MB or smaller.");
      event.target.value = "";
      setResume(null);
      return;
    }
    setError("");
    setResume(file);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) {
        setError("This PDF appears to be scanned/image-based. Please fill the fields manually or use a text-based PDF.");
        return;
      }
      const extracted = parseResumeText(text);
      setForm((previous) => {
        const next = { ...previous };
        for (const [key, value] of Object.entries(extracted)) {
          if (value && (!previous[key] || previous[key] === initialForm[key])) next[key] = value;
        }
        if (extracted.experienceYears && Number(extracted.experienceYears) > 0 && previous.experienceType === "Fresher") {
          next.experienceType = "Experienced";
        }
        return next;
      });
      setError("Resume read successfully. Recognized details were filled in—please review each field before submitting.");
    } catch {
      setError("Could not read the PDF text. Please check the PDF or fill the fields manually.");
    }
  }

  async function handleSubmit(event) {

    event.preventDefault();



    if (submitting) return;



    setError("");



    const token = getToken();



    if (!token) {

      navigate("/login");

      return;

    }



    if (!job || !id || !Number.isFinite(Number(id))) {

      setError("Valid job details are required before applying.");

      return;

    }



    if (

      form.experienceType === "Experienced" &&

      !form.experienceYears

    ) {

      setError("Please enter your years of experience.");

      return;

    }



    try {

      setSubmitting(true);



      // FormData is used because the application may include a resume file.

      const body = new FormData();



      body.append("jobId", String(id));



      Object.entries(form).forEach(([key, value]) => {

        body.append(key, String(value).trim());

      });



      if (resume) {

        body.append("resume", resume);

      }



      const response = await fetch(`${API_URL}/api/applications`, {

        method: "POST",

        headers: {

          Authorization: `Bearer ${token}`,

        },

        body,

      });



      await readResponse(response);

      setSuccess(true);

    } catch (err) {

      setError(

        err.message || "Unable to submit your application. Please try again."

      );

    } finally {

      setSubmitting(false);

    }

  }



  const jobTitle =

    job?.title || job?.jobTitle || job?.position || "Job Opportunity";



  const companyName =

    job?.Company?.companyName ||

    job?.Company?.name ||

    job?.companyName ||

    job?.company?.name ||

    (typeof job?.company === "string" ? job.company : "") ||

    "Company";



  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 px-3 pb-9 text-slate-100 sm:px-6">

        <div className="mx-auto my-24 flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-8 text-slate-200">

          <LoaderCircle className="animate-spin" size={32} />

          <p className="text-sm text-slate-300">Loading job details...</p>

        </div>

        

      </div>

    );

  }



  if (!job) {

    return (

      <div className="min-h-screen bg-slate-950 px-3 pb-9 text-slate-100 sm:px-6">

        <div className="mx-auto my-24 max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center shadow-xl">

          <Info size={36} />

          <h2 className="mb-3 text-xl font-bold">Unable to load application</h2>

          <p className="mb-5 text-slate-400">{error || "This job could not be found."}</p>

          <button

            type="button"

            className={buttonClass + " w-full border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"}

            onClick={() => navigate(-1)}

          >

            <ArrowLeft size={18} /> Go Back

          </button>

        </div>

        

      </div>

    );

  }



  if (success) {

    return (

      <div className="min-h-screen bg-slate-950 px-3 pb-9 text-slate-100 sm:px-6">

        <div className="mx-auto my-12 flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-emerald-900 bg-slate-900 p-8 text-center shadow-xl">

          <div className="mb-4 text-emerald-400">

            <CheckCircle2 size={48} />

          </div>

          <h1 className="mb-3 text-2xl font-extrabold">Application Submitted!</h1>

          <p>

            Your application for <strong>{jobTitle}</strong> has been

            submitted successfully.

          </p>

          <button

            type="button"

            className={buttonClass + " w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/30 hover:from-blue-500 hover:to-indigo-500"}

            onClick={() => navigate("/student")}

          >

            Go to Student Dashboard

          </button>

          <button

            type="button"

            className={buttonClass + " w-full border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"}

            onClick={() => navigate("/")}

          >

            Back to Home

          </button>

        </div>

        

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-slate-950 px-3 pb-9 text-slate-100 sm:px-6">

      <header className="mx-auto flex min-h-[76px] max-w-5xl flex-wrap items-center justify-between gap-4">

        <button

          className="inline-flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white"

          type="button"

          onClick={() => navigate("/")}

        >

          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">

            <BriefcaseBusiness size={23} />

          </span>

          <span>

            Job<span className="text-blue-400">Orbit</span>

          </span>

        </button>



        <nav className="flex flex-wrap items-center justify-end gap-2">

          <button type="button" className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white" onClick={() => navigate("/feed")}>Feed</button>

          <button type="button" className="rounded-xl border border-blue-600 bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500" onClick={() => navigate("/student")}>Dashboard</button>

          <button

            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"

            type="button"

            onClick={() => navigate(-1)}

          >

            <ArrowLeft size={17} /> Back

          </button>

        </nav>

      </header>



      <main className="mx-auto mt-6 w-full max-w-4xl">

        <div className="mb-7 text-center">

          <span className="text-[11px] font-extrabold tracking-[0.2em] text-blue-400">YOUR NEXT OPPORTUNITY</span>

          <h1 className="my-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Job Application</h1>

          <p>

            Share your details and take the next step in your career.

          </p>

        </div>



        <div className="mb-5 flex items-center gap-4 rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5">

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-400 sm:h-14 sm:w-14">

            <BriefcaseBusiness size={27} />

          </div>

          <div className="min-w-0 flex-1">

            <h2 className="mb-2 break-words text-lg font-bold text-white">{jobTitle}</h2>

            <p>

              <Building2 size={16} /> {companyName}

            </p>

            {job.location && (

              <p>

                <MapPin size={16} /> {job.location}

              </p>

            )}

          </div>

          <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-extrabold text-blue-300">Applying</span>

        </div>



        <form className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4 shadow-2xl shadow-black/20 sm:p-8" onSubmit={handleSubmit}>

          {error && (

            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-900 bg-red-950/60 p-3 text-sm leading-6 text-red-200" role="alert">

              <Info size={18} />

              <span>{error}</span>

              <button

                type="button"

                className="ml-auto shrink-0 text-slate-400 hover:text-white"

                aria-label="Dismiss error"

                onClick={() => setError("")}

              >

                <X size={17} />

              </button>

            </div>

          )}



          <Section

            icon={<UserRound size={21} />}

            title="Personal Information"

            description="Tell the employer how to contact you."

          >

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <Field label="Full Name" required>

                <input

                  name="fullName"

                  value={form.fullName}

                  onChange={updateField}

                  placeholder="Enter your full name"

                  autoComplete="name"

                  maxLength={100}

                  required

                 className={inputClass}/>

              </Field>



              <Field label="Email Address" required>

                <input

                  type="email"

                  name="email"

                  value={form.email}

                  onChange={updateField}

                  placeholder="you@example.com"

                  autoComplete="email"

                  required

                 className={inputClass}/>

              </Field>



              <Field label="Mobile Number" required>

                <input

                  type="tel"

                  name="phone"

                  value={form.phone}

                  onChange={updateField}

                  placeholder="Enter your phone number"

                  autoComplete="tel"

                  pattern="[0-9+\\-\s()]{7,20}"

                  required

                 className={inputClass}/>

              </Field>



              <Field label="Current City" required>

                <input

                  name="city"

                  value={form.city}

                  onChange={updateField}

                  placeholder="e.g. Lucknow"

                  autoComplete="address-level2"

                  required

                 className={inputClass}/>

              </Field>



              <Field label="LinkedIn Profile">

                <input

                  type="url"

                  name="linkedin"

                  value={form.linkedin}

                  onChange={updateField}

                  placeholder="https\://linkedin.com/in/..."

                 className={inputClass}/>

              </Field>



              <Field label="GitHub / Portfolio">

                <input

                  type="url"

                  name="github"

                  value={form.github}

                  onChange={updateField}

                  placeholder="https\://github.com/..."

                 className={inputClass}/>

              </Field>

            </div>

          </Section>



          <Section

            icon={<GraduationCap size={22} />}

            title="Education Details"

            description="Add your latest qualification."

          >

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <Field label="Highest Qualification" required>

                <select

                  name="qualification"

                  value={form.qualification}

                  onChange={updateField}

                  required

                 className={inputClass}>

                  <option value="">Select qualification</option>

                  <option value="10th">10th</option>

                  <option value="12th">12th</option>

                  <option value="Diploma">Diploma</option>

                  <option value="BCA">BCA</option>

                  <option value="B.Tech">B.Tech / B.E.</option>

                  <option value="B.Sc">B.Sc</option>

                  <option value="B.Com">B.Com</option>

                  <option value="BA">B.A.</option>

                  <option value="MCA">MCA</option>

                  <option value="M.Tech">M.Tech / M.E.</option>

                  <option value="MBA">MBA</option>

                  <option value="M.Sc">M.Sc</option>

                  <option value="Other">Other</option>

                </select>

              </Field>



              <Field label="College / University" required>

                <input

                  name="college"

                  value={form.college}

                  onChange={updateField}

                  placeholder="Enter college name"

                  maxLength={150}

                  required

                 className={inputClass}/>

              </Field>



              <Field label="Passing Year" required>

                <select

                  name="passingYear"

                  value={form.passingYear}

                  onChange={updateField}

                  required

                 className={inputClass}>

                  <option value="">Select year</option>

                  {Array.from(

                    { length: 31 },

                    (_, i) => new Date().getFullYear() + 5 - i

                  ).map((year) => (

                    <option key={year} value={year}>

                      {year}

                    </option>

                  ))}

                </select>

              </Field>



              <Field label="Percentage / CGPA">

                <input

                  name="percentage"

                  value={form.percentage}

                  onChange={updateField}

                  placeholder="e.g. 78% or 8.2 CGPA"

                  maxLength={20}

                 className={inputClass}/>

              </Field>

            </div>

          </Section>



          <Section

            icon={<Code2 size={22} />}

            title="Skills & Experience"

            description="Help the recruiter understand your strengths."

          >

            <Field label="Candidate Type" required>

              <div className="flex flex-wrap gap-3">

                {["Fresher", "Experienced"].map((type) => (

                  <label

                    key={type}

                    className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${

                      form.experienceType === type ? "border-blue-500 bg-blue-500/10 text-blue-300" : "border-slate-700 text-slate-300"

                    }`}

                  >

                    <input

                      type="radio"

                      name="experienceType"

                      value={type}

                      checked={form.experienceType === type}

                      onChange={updateField}

                    />

                    <span>{type}</span>

                  </label>

                ))}

              </div>

            </Field>



            {form.experienceType === "Experienced" && (

              <div className="my-4 max-w-full sm:max-w-[50%]">

                <Field label="Years of Experience" required>

                  <input

                    type="number"

                    name="experienceYears"

                    value={form.experienceYears}

                    onChange={updateField}

                    placeholder="e.g. 2"

                    min="0"

                    max="60"

                    step="0.5"

                    required

                   className={inputClass}/>

                </Field>

              </div>

            )}



            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="sm:col-span-2">

                <Field label="Technical / Professional Skills" required>

                  <textarea

                    name="skills"

                    value={form.skills}

                    onChange={updateField}

                    placeholder="e.g. HTML, CSS, JavaScript, React, Node.js, MySQL"

                    rows={3}

                    maxLength={1000}

                    required

                   className={inputClass}/>

                  <div className="mt-2 text-xs text-slate-400">

                    Separate your skills with commas.

                  </div>

                </Field>

              </div>



              <div className="sm:col-span-2">

                <Field label="Projects / Work Experience">

                  <textarea

                    name="projects"

                    value={form.projects}

                    onChange={updateField}

                    placeholder="Describe relevant projects, internships or work experience..."

                    rows={4}

                    maxLength={2000}

                   className={inputClass}/>

                </Field>

              </div>

            </div>

          </Section>



          <Section

            icon={<FileUp size={22} />}

            title="Resume & Portfolio"

            description="Upload a text-based PDF to auto-fill recognized details. Review the fields after extraction."

          >

            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-slate-600 bg-slate-950 p-6 text-center transition hover:border-blue-500 hover:bg-slate-800" htmlFor="resume">

              <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500/10 text-blue-400">

                <FileUp size={27} />

              </span>

              <strong>

                {resume ? resume.name : "Upload your resume"}

              </strong>

              <span>

                {resume

                  ? `${(resume.size / 1024).toFixed(0)} KB · PDF`

                  : "PDF format · Maximum file size 5 MB"}

              </span>

              <span className="font-bold text-blue-400">

                {resume ? "Choose another file" : "Browse files"}

              </span>

            </label>



            <input

              id="resume"

              className="sr-only"

              type="file"

              accept=".pdf,application/pdf"

              onChange={handleResume}

            />



            {resume && (

              <button

                type="button"

                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300"

                onClick={() => {

                  setResume(null);

                  const input = document.getElementById("resume");

                  if (input) input.value = "";

                }}

              >

                <X size={15} /> Remove resume

              </button>

            )}

          </Section>



          <Section

            icon={<MessageSquareText size={22} />}

            title="Application Preferences"

            description="Let the employer know your expectations."

          >

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <Field label="Expected Salary / Stipend">

                <input

                  name="expectedSalary"

                  value={form.expectedSalary}

                  onChange={updateField}

                  placeholder="e.g. ₹15,000/month or Negotiable"

                  maxLength={100}

                 className={inputClass}/>

              </Field>



              <Field label="Joining Availability" required>

                <select

                  name="availability"

                  value={form.availability}

                  onChange={updateField}

                  required

                 className={inputClass}>

                  <option value="Immediately">Immediately</option>

                  <option value="Within 15 days">Within 15 days</option>

                  <option value="Within 30 days">Within 30 days</option>

                  <option value="After 30 days">After 30 days</option>

                  <option value="Flexible">Flexible</option>

                </select>

              </Field>



              <div className="sm:col-span-2">

                <Field label="Cover Letter" required>

                  <textarea

                    name="coverLetter"

                    value={form.coverLetter}

                    onChange={updateField}

                    placeholder="Explain why you are a good fit for this position. Mention your relevant skills, projects and interest in the role..."

                    rows={6}

                    maxLength={1000}

                    required

                   className={inputClass}/>

                  <div className="mt-2 text-right text-xs text-slate-400">

                    {form.coverLetter.length}/1000 characters

                  </div>

                </Field>

              </div>

            </div>

          </Section>



          <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-400">

            <Info size={18} />

            <p>

              Please make sure your information is accurate. Your application

              details will be shared with the employer for recruitment.

            </p>

          </div>



          <div className="mt-6 grid gap-3">

            <button

              className={buttonClass + " w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/30 hover:from-blue-500 hover:to-indigo-500"}

              type="submit"

              disabled={submitting}

            >

              {submitting ? (

                <>

                  <LoaderCircle className="animate-spin" size={19} />

                  Submitting Application...

                </>

              ) : (

                <>

                  <Send size={18} />

                  Submit Application

                </>

              )}

            </button>



            <button

              className={buttonClass + " w-full border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"}

              type="button"

              disabled={submitting}

              onClick={() => navigate(-1)}

            >

              Cancel

            </button>

          </div>

        </form>



        <footer className="mt-6 text-center text-xs text-slate-500">

          Powered by <strong>JobOrbit</strong> · Connecting talent with

          opportunity

        </footer>

      </main>



      

    </div>

  );

}
