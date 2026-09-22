from typing import Any, cast
from fastapi import APIRouter, HTTPException, Query
from app.core.supabase import supabase
from app.services.ranking import compute_ranked_score

router = APIRouter()

RESOURCE_SELECT = """
    id,
    created_at,
    title,
    description,
    resource_type,
    file_path,
    file_type,
    url,
    subjects ( id, name, subject_code ),
    uploader:profiles ( id, full_name, reputation ),
    votes ( type )
"""


def _get_upvoted_resource_ids(user_id: str) -> list[str]:
    result = (
        supabase.table("votes")
        .select("resource_id")
        .eq("voter_id", user_id)
        .eq("type", "UPVOTE")
        .execute()
    )
    rows = cast(list[dict[str, Any]], result.data or [])
    return [row["resource_id"] for row in rows]


def _content_based(faculty_id: str, semester: int, exclude_ids: set[str], limit: int):
    """Resources in the user's own faculty/semester, ranked by score.
    This is the safe fallback: works even for a brand new user with zero votes."""
    query = (
        supabase.table("resources")
        .select(RESOURCE_SELECT)
        .eq("subjects.faculty_id", faculty_id)
        .eq("subjects.semester", semester)
    )
    result = query.execute()
    rows = cast(list[dict[str, Any]], result.data or [])
    candidates = [r for r in rows if r["id"] not in exclude_ids]

    scored = [
        {**r, "ranked_score": round(compute_ranked_score(r), 4), "reason": "matches your semester"}
        for r in candidates
    ]
    scored.sort(key=lambda r: r["ranked_score"], reverse=True)
    return scored[:limit]


def _collaborative(user_id: str, upvoted_ids: list[str], exclude_ids: set[str], limit: int):
    """'Students who upvoted what you upvoted also upvoted...'"""
    if not upvoted_ids:
        return []

    neighbors_result = (
        supabase.table("votes")
        .select("voter_id")
        .in_("resource_id", upvoted_ids)
        .eq("type", "UPVOTE")
        .neq("voter_id", user_id)
        .execute()
    )
    neighbor_rows = cast(list[dict[str, Any]], neighbors_result.data or [])
    neighbor_ids = list({row["voter_id"] for row in neighbor_rows})
    if not neighbor_ids:
        return []

    neighbor_votes_result = (
        supabase.table("votes")
        .select("resource_id")
        .in_("voter_id", neighbor_ids)
        .eq("type", "UPVOTE")
        .execute()
    )
    neighbor_vote_rows = cast(list[dict[str, Any]], neighbor_votes_result.data or [])

    overlap_count: dict[str, int] = {}
    for row in neighbor_vote_rows:
        rid = row["resource_id"]
        if rid in exclude_ids:
            continue
        overlap_count[rid] = overlap_count.get(rid, 0) + 1

    if not overlap_count:
        return []

    top_ids = sorted(overlap_count, key=lambda k: overlap_count[k], reverse=True)[: limit * 3]

    resources_result = (
        supabase.table("resources").select(RESOURCE_SELECT).in_("id", top_ids).execute()
    )
    resource_rows = cast(list[dict[str, Any]], resources_result.data or [])

    scored = [
        {
            **r,
            "ranked_score": round(compute_ranked_score(r), 4),
            "overlap_count": overlap_count[r["id"]],
            "reason": "students with similar interests upvoted this",
        }
        for r in resource_rows
    ]
    scored.sort(key=lambda r: (r["overlap_count"], r["ranked_score"]), reverse=True)
    return scored[:limit]


@router.get("")
def get_recommendations(
    user_id: str = Query(...),
    limit: int = Query(5, le=50),
):
    profile_result = (
        supabase.table("profiles")
        .select("faculty_id, semester")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    if not profile_result:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile = cast(dict[str, Any], profile_result.data)
    upvoted_ids = _get_upvoted_resource_ids(user_id)
    exclude_ids = set(upvoted_ids)

    collaborative = _collaborative(user_id, upvoted_ids, exclude_ids, limit)
    exclude_ids |= {r["id"] for r in collaborative}

    remaining = max(limit - len(collaborative), 0)
    content_based = (
        _content_based(profile["faculty_id"], profile["semester"], exclude_ids, remaining)
        if remaining > 0
        else []
    )

    return {"results": collaborative + content_based}
