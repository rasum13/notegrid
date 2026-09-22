import { Link } from "react-router-dom";

export default function ResourceCard({ resource, votes, myVote, onVote }) {
  const isFile = Boolean(resource.file_path);

  return (
    <div className="border border-line rounded-card bg-surface px-4 py-3.5 flex gap-3.5">
      <div className="flex flex-col items-center gap-0.5 pt-0.5 w-8 shrink-0">
        <button
          onClick={() => onVote(resource, "UPVOTE")}
          aria-label={`Upvote ${resource.title}`}
          aria-pressed={myVote === "UPVOTE"}
          className={`transition-colors ${
            myVote === "UPVOTE" ? "text-accent-600" : "text-faint hover:text-accent-600"
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={myVote === "UPVOTE" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5l7 8H5l7-8Z" />
          </svg>
        </button>

        <span className="text-[13px] font-medium text-ink">{votes}</span>

        <button
          onClick={() => onVote(resource, "DOWNVOTE")}
          aria-label={`Downvote ${resource.title}`}
          aria-pressed={myVote === "DOWNVOTE"}
          className={`transition-colors ${
            myVote === "DOWNVOTE" ? "text-warn-600" : "text-faint hover:text-warn-600"
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={myVote === "DOWNVOTE" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l-7-8h14l-7 8Z" />
          </svg>
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          {isFile ? <FileIcon /> : <LinkIcon />}
          <Link
            to={`/resource/${resource.id}`}
            className="font-medium text-[14.5px] leading-snug hover:text-accent-700"
          >
            {resource.title}
          </Link>
        </div>
        <p className="text-[13px] text-muted leading-relaxed mb-2 line-clamp-2">
          {resource.description}
        </p>
        <div className="flex items-center gap-2.5 text-[12px] text-faint flex-wrap">
          <span>
            {resource.subjects?.name}
            {resource.subjects?.subject_code ? ` · ${resource.subjects.subject_code}` : ""}
          </span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span className="uppercase tracking-wide">{isFile ? resource.file_type : "link"}</span>
          <span className="w-1 h-1 rounded-full bg-line" />
          <span>Uploaded by {resource.uploader?.full_name ?? "Unknown"}</span>
        </div>
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9C9B91" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9C9B91" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 7.5 12.5 6a3 3 0 0 1 4.5 4.5L15.5 12" />
      <path d="M13 16.5 11.5 18a3 3 0 0 1-4.5-4.5L8.5 12" />
    </svg>
  );
}
