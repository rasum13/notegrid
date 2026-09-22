import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ResourceCard from "../components/ResourceCard.jsx";
import { Tag, SearchInput, PrimaryButton } from "../components/Topbar.jsx";
import { supabase } from "../utils/supabase.js";
import { fetchUserProfile } from "../api/profile.js";
import { fetchSubjects, castVote, computeScore } from "../api/resources.js";
import { fetchRankedResources } from "../api/ranking.js";
import { fetchRecommendations } from "../api/recommendations.js";

export default function Feed() {
  const [currentUser, setCurrentUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All subjects");
  const [sortTop, setSortTop] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const profile = await fetchUserProfile(supabase, user.id);

        const [feed, subjectList, recommendations] = await Promise.all([
          fetchRankedResources({
            facultyId: profile.faculty_id,
            semester: profile.semester,
          }),
          fetchSubjects(supabase, {
            facultyId: profile.faculty_id,
            semester: profile.semester,
          }),
          fetchRecommendations(user.id, 5),
        ]);

        if (cancelled) return;
        setCurrentUser(profile);
        setResources(feed.results);
        setSubjects(subjectList);
        setSuggested(recommendations);
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Could not load the feed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function myVoteType(resource) {
    if (!currentUser) return null;
    return resource.votes.find((v) => v.voter_id === currentUser.id)?.type ?? null;
  }

  async function handleVote(resource, type) {
    if (!currentUser) return;

    const prevVotes = resource.votes;
    const current = myVoteType(resource);
    const removing = current === type;

    // Optimistic update — mutate the votes array only; score is always derived from it
    setResources((list) =>
      list.map((r) => {
        if (r.id !== resource.id) return r;
        const withoutMine = r.votes.filter((v) => v.voter_id !== currentUser.id);
        return {
          ...r,
          votes: removing ? withoutMine : [...withoutMine, { type, voter_id: currentUser.id }],
        };
      })
    );

    try {
      await castVote(supabase, {
        resourceId: resource.id,
        voterId: currentUser.id,
        type,
      });
    } catch (err) {
      setResources((list) =>
        list.map((r) => (r.id === resource.id ? { ...r, votes: prevVotes } : r))
      );
      setError(err.message ?? "Could not save your vote.");
    }
  }

function pointsOf(type) {
  return type === "UPVOTE" ? 1 : type === "DOWNVOTE" ? -1 : 0;
}

  const filterOptions = useMemo(
    () => ["All subjects", ...subjects.map((s) => s.name)],
    [subjects]
  );

  const filtered = useMemo(() => {
    let list = resources.filter((r) => {
      const matchesQuery =
        !query ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subjects?.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All subjects" || r.subjects?.name === filter;
      return matchesQuery && matchesFilter;
    });
    list = [...list].sort((a, b) =>
      sortTop ? computeScore(b.votes) - computeScore(a.votes) : new Date(b.created_at) - new Date(a.created_at)
    );
    return list;
  }, [resources, query, filter, sortTop]);

  if (loading) {
    return <p className="text-sm text-muted py-10 text-center">Loading feed…</p>;
  }

  return (
    <div className="flex gap-10 w-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-5">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by subject, chapter, keyword"
          />
          <Link to="/upload">
            <PrimaryButton>
              <PlusIcon /> Share resource
            </PrimaryButton>
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {filterOptions.map((opt) => (
            <Tag key={opt} active={filter === opt} onClick={() => setFilter(opt)}>
              {opt}
            </Tag>
          ))}
          <span className="w-px h-5 bg-line mx-1" />
          <Tag active={sortTop} onClick={() => setSortTop((s) => !s)}>
            Top rated
          </Tag>
        </div>

        {error && (
          <p className="text-sm text-warn-600 bg-warn-100 px-3.5 py-2.5 rounded-md mb-4">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-sm text-muted py-10 text-center">
              No resources match that search yet.
            </p>
          )}
          {filtered.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              votes={computeScore(r.votes)}
              myVote={myVoteType(r)}
              onVote={handleVote}
            />
          ))}
        </div>
      </div>

      <div className="w-[280px] shrink-0 hidden xl:block">
        <div className="bg-accent-50 rounded-card p-5 mb-7">
          <p className="text-sm font-medium text-accent-700 mb-3">Your reputation</p>
          <p className="text-2xl font-medium text-accent-700 mt-1">
            {currentUser?.reputation ?? 0}
          </p>
        </div>

        <p className="text-sm font-medium mb-3">Suggested for you</p>
        <div className="flex flex-col gap-2">
          {suggested.length === 0 && (
            <p className="text-xs text-faint">Vote on a few resources to get suggestions.</p>
          )}
          {suggested.map((r) => (
            <Link
              key={r.id}
              to={`/resource/${r.id}`}
              className="text-sm px-3.5 py-3 border border-line rounded-md hover:border-faint leading-snug"
            >
              {r.title}
              <span className="block text-xs text-faint mt-1">{r.reason}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
