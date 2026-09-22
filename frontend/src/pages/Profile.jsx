import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase.js";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api/profile.js";

export default function Profile() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate("/login");
          return;
        }

        const userData = await fetchUserProfile(supabase, user.id);
        setCurrentUser(userData);
      }
      catch (err) {
        console.error("Unexpected error: ", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading profile...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-5 mb-9">
        <div className="w-16 h-16 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center text-xl font-medium shrink-0">
          {currentUser?.full_name[0].toUpperCase() + (currentUser?.full_name.split(" ").length > 1 ? currentUser?.full_name.split(" ")[1][0]?.toUpperCase() : "") }
        </div>
        <div>
          <h1 className="text-lg font-medium">{currentUser?.full_name}</h1>
          <p className="text-sm text-muted">
            {currentUser?.faculties?.name} · Semester {currentUser?.semester}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-9">
        <StatCard label="Reputation" value={currentUser?.reputation} />
        <StatCard label="Resources shared" value={currentUser?.resources.length} />
        <StatCard label="Total votes" value={currentUser?.votes.length} />
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Resources you've shared</p>
        <div className="flex flex-col gap-2.5">
          {currentUser.resources.map((r) => (
            <div key={r.id} className="flex items-center justify-between border border-line rounded-card px-5 py-4 bg-surface gap-4">
              <div className="min-w-0">
                <p className="text-base font-medium truncate">{r.title}</p>
                <p className="text-xs text-faint mt-0.5">{r.subjects.name}</p>
              </div>
              <span className="text-sm text-muted shrink-0">{r.votes.filter((v) => v.type == "UPVOTE").length - r.votes.filter((v) => v.type == "DOWNVOTE").length} upvotes</span>
            </div>
          ))}
          {currentUser.resources.length === 0 && <p className="text-sm text-muted">No resources shared yet.</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, small }) {
  return (
    <div className="border border-line rounded-card p-5 bg-surface">
      <p className="text-xs text-muted mb-1.5">{label}</p>
      <p className={`${small ? "text-base" : "text-xl"} font-medium`}>{value}</p>
    </div>
  );
}
