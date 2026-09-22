import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../utils/supabase";
import { faculties as mockFaculties } from "../data/mockData.js";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const inputCls =
  "px-3.5 py-2.5 text-sm rounded-md border border-line bg-surface focus:border-accent-400 outline-none w-full placeholder:text-faint disabled:opacity-60";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isExisting, setIsExisting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    faculty_id: "",
    semester: 1,
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  /* Load the faculty list, plus any profile row that already exists
     for the signed-in user (so this page doubles as "edit profile"). */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        // Fallback so the UI is testable without a backend.
        if (!cancelled) {
          setFaculties(mockFaculties.map((name, i) => ({ id: `mock-${i}`, name })));
          setLoading(false);
        }
        return;
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          navigate("/login");
          return;
        }

        const [facultyRes, profileRes] = await Promise.all([
          supabase.from("faculties").select("id, name").order("name"),
          supabase
            .from("profiles")
            .select("full_name, faculty_id, semester")
            .eq("id", user.id)
            .maybeSingle(),
        ]);

        if (facultyRes.error) throw facultyRes.error;
        if (profileRes.error) throw profileRes.error;

        if (cancelled) return;

        setFaculties(facultyRes.data ?? []);

        const existing = profileRes.data;
        if (existing) {
          setIsExisting(true);
          setForm({
            full_name: existing.full_name ?? "",
            faculty_id: existing.faculty_id ?? "",
            semester: existing.semester ?? 1,
          });
        } else {
          // Prefill the name from whatever the auth provider gave us.
          const metaName =
            user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
          setForm((f) => ({ ...f, full_name: metaName }));
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Could not load profile data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.faculty_id) {
      setError("Please select your faculty.");
      return;
    }

    setSaving(true);

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setSaving(false);
        navigate("/");
      }, 400);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      /* id is the FK to auth.users, so it must be the signed-in user's id.
         reputation and role are left to their column defaults (0 / STUDENT)
         and are deliberately not settable from this form. */
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: form.full_name.trim(),
          faculty_id: form.faculty_id,
          semester: Number(form.semester),
        },
        { onConflict: "id" }
      );

      if (upsertError) throw upsertError;

      navigate("/");
    } catch (err) {
      setError(err.message ?? "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-md bg-accent-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
              <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
              <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
              <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
            </svg>
          </div>
          <span className="font-serif text-xl font-semibold">Notegrid</span>
        </div>

        <div className="border border-line rounded-card bg-surface p-7">
          <h1 className="text-lg font-medium mb-1.5">
            {isExisting ? "Edit your profile" : "Set up your profile"}
          </h1>
          <p className="text-sm text-muted mb-7">
            Your faculty and semester decide which resources show up in your feed.
          </p>

          {loading ? (
            <div className="flex flex-col gap-5" aria-busy="true">
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted">Full name</span>
                <input
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="e.g. John Doe"
                  maxLength={120}
                  disabled={saving}
                  className={inputCls}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-muted">Faculty</span>
                <select
                  value={form.faculty_id}
                  onChange={(e) => update("faculty_id", e.target.value)}
                  disabled={saving}
                  className={inputCls}
                >
                  <option value="">Select your faculty</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                {faculties.length === 0 && (
                  <span className="text-xs text-faint">
                    No faculties found — an admin needs to add them first.
                  </span>
                )}
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted">Current semester</span>
                <div className="flex flex-wrap gap-2">
                  {SEMESTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={saving}
                      onClick={() => update("semester", s)}
                      aria-pressed={Number(form.semester) === s}
                      className={`w-11 h-11 rounded-md border text-sm transition-colors ${
                        Number(form.semester) === s
                          ? "bg-accent-50 border-accent-400 text-accent-700 font-medium"
                          : "border-line text-muted hover:border-faint"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-warn-600 bg-warn-100 px-3.5 py-2.5 rounded-md">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-1 py-2.5 rounded-md bg-accent-600 text-white text-sm font-medium hover:bg-accent-700 transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : isExisting ? "Save changes" : "Finish setup"}
              </button>

              {!isExisting && (
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  disabled={saving}
                  className="text-sm text-muted hover:text-ink"
                >
                  Skip for now
                </button>
              )}
            </form>
          )}
        </div>

        {!isSupabaseConfigured && (
          <p className="text-xs text-faint text-center mt-4">
            Supabase env vars not set — running with mock faculties.
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonField() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-4 w-24 rounded bg-line/60" />
      <div className="h-10 w-full rounded-md bg-line/40" />
    </div>
  );
}
