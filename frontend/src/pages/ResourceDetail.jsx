import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../utils/supabase.js";
import { fetchUserProfile } from "../api/profile.js";
import {
  fetchResourceById,
  fetchRelatedResources,
  castVote,
  computeScore,
} from "../api/resources.js";

export default function ResourceDetail() {
  const { id } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [resource, setResource] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const [profile, res] = await Promise.all([
          user ? fetchUserProfile(supabase, user.id) : null,
          fetchResourceById(supabase, id),
        ]);

        if (cancelled) return;

        setCurrentUser(profile);
        setResource(res);

        if (res.subjects?.id) {
          const relatedList = await fetchRelatedResources(supabase, {
            subjectId: res.subjects.id,
            excludeId: res.id,
          });
          if (!cancelled) setRelated(relatedList);
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Could not load this resource.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function myVoteType() {
    if (!currentUser || !resource) return null;
    return resource.votes.find((v) => v.voter_id === currentUser.id)?.type ?? null;
  }

  async function handleVote(type) {
    if (!currentUser || !resource) return;

    const prevVotes = resource.votes;
    const current = myVoteType();
    const removing = current === type;

    setResource((r) => {
      const withoutMine = r.votes.filter((v) => v.voter_id !== currentUser.id);
      return {
        ...r,
        votes: removing ? withoutMine : [...withoutMine, { type, voter_id: currentUser.id }],
      };
    });

    try {
      await castVote(supabase, { resourceId: resource.id, voterId: currentUser.id, type });
    } catch (err) {
      setResource((r) => ({ ...r, votes: prevVotes }));
      setError(err.message ?? "Could not save your vote.");
    }
  }

  if (loading) {
    return <p className="text-sm text-muted py-10 text-center">Loading…</p>;
  }

  if (error && !resource) {
    return (
      <div>
        <p className="text-sm text-warn-600 bg-warn-100 px-3.5 py-2.5 rounded-md mb-3">{error}</p>
        <Link to="/" className="text-sm text-accent-700 font-medium">Back to feed</Link>
      </div>
    );
  }

  if (!resource) {
    return (
      <div>
        <p className="text-sm text-muted mb-2">Resource not found.</p>
        <Link to="/" className="text-sm text-accent-700 font-medium">Back to feed</Link>
      </div>
    );
  }

  const isFile = Boolean(resource.file_path);
  const score = computeScore(resource.votes);
  const voted = myVoteType();

  return (
    <div className="w-full">
      <Link to="/" className="text-sm text-muted hover:text-ink inline-flex items-center gap-1 mb-5">
        ← Back to feed
      </Link>

      {error && (
        <p className="text-sm text-warn-600 bg-warn-100 px-3.5 py-2.5 rounded-md mb-5">{error}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-10 items-start">
        <div className="min-w-0">
          <div className="flex gap-5 mb-7">
            <div className="flex flex-col items-center gap-1 px-4 py-3.5 rounded-card border border-line h-fit shrink-0">
              <button
                onClick={() => handleVote("UPVOTE")}
                aria-label="Upvote"
                aria-pressed={voted === "UPVOTE"}
                className={voted === "UPVOTE" ? "text-accent-600" : "text-faint hover:text-accent-600"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={voted === "UPVOTE" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5l7 8H5l7-8Z" />
                </svg>
              </button>
              <span className="text-base font-medium text-ink">{score}</span>
              <button
                onClick={() => handleVote("DOWNVOTE")}
                aria-label="Downvote"
                aria-pressed={voted === "DOWNVOTE"}
                className={voted === "DOWNVOTE" ? "text-warn-600" : "text-faint hover:text-warn-600"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={voted === "DOWNVOTE" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l-7-8h14l-7 8Z" />
                </svg>
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-faint mb-2">
                {resource.subjects?.name}
                {resource.subjects?.subject_code ? ` · ${resource.subjects.subject_code}` : ""}
              </p>
              <h1 className="text-xl font-serif font-semibold leading-snug mb-3 max-w-[60ch]">
                {resource.title}
              </h1>
              <div className="flex items-center gap-2.5 text-sm text-muted flex-wrap">
                <div className="w-7 h-7 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center text-xs font-medium">
                  {initials(resource.uploader?.full_name)}
                </div>
                {resource.uploader?.full_name ?? "Unknown"}
                <span className="w-1 h-1 rounded-full bg-line" />
                {new Date(resource.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {resource.description && (
            <p className="text-base leading-relaxed text-ink mb-7 max-w-[80ch]">
              {resource.description}
            </p>
          )}

          {isFile ? (
            <a
              href={
                supabase.storage.from("resources").getPublicUrl(resource.file_path).data.publicUrl
              }
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center py-3 rounded-md border border-line text-sm font-medium hover:bg-paper mb-10 bg-surface"
            >
              Download {resource.file_type ?? "file"}
            </a>
          ) : (
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center py-3 rounded-md border border-line text-sm font-medium hover:bg-paper mb-10 bg-surface"
            >
              Open external link →
            </a>
          )}
        </div>

        <aside className="hidden xl:block">
          <p className="text-sm font-medium mb-3">More in {resource.subjects?.name}</p>
          <div className="flex flex-col gap-2">
            {related.length === 0 && (
              <p className="text-sm text-muted">Nothing else here yet.</p>
            )}
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/resource/${r.id}`}
                className="text-sm px-3.5 py-3 border border-line rounded-md hover:border-faint leading-snug bg-surface"
              >
                {r.title}
                <span className="block text-xs text-faint mt-1">
                  {computeScore(r.votes)} {computeScore(r.votes) === 1 ? "vote" : "votes"}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
