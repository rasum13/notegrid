import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";

const inputCls =
  "px-3.5 py-2.5 text-sm rounded-md border border-line bg-surface focus:border-accent-400 outline-none w-full placeholder:text-faint";

export default function Upload() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUpoading] = useState(false);
  const [step, setStep] = useState("form");
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject_id: "",
    chapter: "",
    type: "file",
    url: "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePreview(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setStep("preview");
  }

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        const profileRes = await supabase
                            .from("profiles")
                            .select("full_name, faculty_id, semester")
                            .eq("id", user.id)
                            .maybeSingle();

        const subjectsRes = await supabase.from("subjects").select("id, name").eq("semester", profileRes.data.semester).eq("faculty_id", profileRes.data.faculty_id);

        if (subjectsRes.error) throw subjectsRes.error;

        setSubjects(subjectsRes.data ?? []);
      } catch (err) {
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [])

  async function handleSubmit() {
    setUpoading(true);
    try {
      // 1. get user
      const {
        data: { user },
      } = await supabase.auth.getUser();


      if (!user) {
        navigate("/login");
        return;
      }

      let filePath = null;

      // 2. upload file if PDF
      if (form.type === "file") {
        if (!file) {
          alert("Please select a file");
          return;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(fileName, file);

        if (uploadError) {
          console.error(uploadError);
          alert("Upload failed");
          return;
        }

        filePath = fileName;
      }

      // 3. insert into DB
      const { error: insertError } = await supabase.from("resources").insert({
        title: form.title,
        description: form.description,
        resource_type: form.type.toUpperCase(), // matches your ENUM
        uploader_id: user.id,

        file_path: filePath,
        file_type: form.type === "file" ? "PDF" : null,

        url: form.type === "url" ? form.url : null,

        subject_id: form.subject_id, // adjust if FK later
      });

      if (insertError) {
        console.error(insertError);
        alert("Failed to save resource");
        return;
      }

      // 4. done
      setStep("done");

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  const resourceSummary = form.description
    ? `${form.description.slice(0, 160)}${form.description.length > 160 ? "…" : ""}`
    : "You have not provided a description...";

  if (step === "done") {
    return (
      <div className="w-full flex flex-col items-center text-center py-24">
        <div className="w-12 h-12 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-lg font-medium mb-2">Resource shared</h1>
        <p className="text-sm text-muted mb-7">
          "{form.title}" is now visible to students in {form.subject}.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-md bg-accent-600 text-white text-sm font-medium hover:bg-accent-700"
        >
          Back to feed
        </button>
      </div>
    );
  }

  return (
    <div className="w-[80%]">
      <h1 className="text-lg font-medium mb-1.5">Share a resource</h1>
      <p className="text-sm text-muted mb-7">
        Upload a PDF or link an external resource, tagged to the right subject and chapter.
      </p>

      <div className="flex items-center gap-2.5 mb-7 text-xs text-faint">
        <StepDot active={step === "form"} done={step !== "form"} label="Details" />
        <span className="w-8 h-px bg-line" />
        <StepDot active={step === "preview"} label="Preview" />
      </div>

      {step === "form" && (
        <form onSubmit={handlePreview}>
          <div className="flex flex-col gap-5 min-w-0">
            <div className="flex gap-2 p-1 bg-paper border border-line rounded-md w-fit">
              {["file", "url"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => update("type", t)}
                  className={`px-4 py-2 rounded text-sm ${
                    form.type === t ? "bg-surface border border-line font-medium" : "text-muted"
                  }`}
                >
                  {t === "file" ? "Upload PDF" : "External link"}
                </button>
              ))}
            </div>

            <Field label="Title">
              <input
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Requirements engineering complete notes"
                className={inputCls}
              />
            </Field>

            {form.type === "url" ? (
              <Field label="URL">
                <input
                  required
                  value={form.url}
                  onChange={(e) => update("url", e.target.value)}
                  placeholder="https://"
                  className={inputCls}
                />
              </Field>
            ) : (
              <Field label="File">
                <input
                    required
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="border border-dashed border-line rounded-md px-4 py-10 text-center text-sm text-muted bg-surface"
                    placeholder="Drag a PDF here, or click to browse"
                  />
                  
              </Field>
            )}

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What does this resource cover?"
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Subject">
                {
                  loading
                  ? <p className="text-sm text-muted">Loading subjects...</p>
                  : <select
                    required
                    value={form.subject_id}
                    onChange={(e) => update("subject_id", e.target.value)}
                    className={inputCls}
                  >
                    <option value="" disabled>Selet a subject</option>
                    {subjects.map((s) => (
                      <option value={s.id} key={s.id}>{s.name}</option>
                    ))}
                  </select>
                }
              </Field>
            </div>

            <button
              type="submit"
              className="mt-1 self-start px-5 py-2.5 rounded-md bg-accent-600 text-white text-sm font-medium hover:bg-accent-700"
            >
              Continue to preview
            </button>
          </div>
        </form>
      )}

      {step === "preview" && (
        <div className="w-full">
          <div className="border border-line rounded-card p-6 mb-5 bg-surface">
            <p className="text-base font-medium mb-1.5">{form.title}</p>
            <p className="text-sm text-muted mb-4">
              {form.subject} {form.chapter && `· ${form.chapter}`}
            </p>
            <p className="text-sm text-muted leading-relaxed">{resourceSummary}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("form")}
              className="px-5 py-2.5 rounded-md border border-line text-sm font-medium hover:bg-paper"
            >
              Back
            </button>
            {
              uploading
              ? <button
                className="px-5 py-2.5 rounded-md bg-accent-400/20 text-muted text-sm font-medium"
                disabled
              >
                Uploading...
              </button>
              : <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-md bg-accent-600 text-white text-sm font-medium hover:bg-accent-700"
              >
                Confirm and submit
              </button>
            }
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

function StepDot({ active, done, label }) {
  return (
    <span className={`flex items-center gap-2 ${active ? "text-ink font-medium" : ""}`}>
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
          active ? "bg-accent-600 text-white" : done ? "bg-accent-100 text-accent-700" : "border border-line"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      {label}
    </span>
  );
}
