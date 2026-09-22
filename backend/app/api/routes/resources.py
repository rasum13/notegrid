from typing import Any, cast

from fastapi import APIRouter, HTTPException, Query

from app.core.supabase import supabase
from app.services.ranking import compute_ranked_score

router = APIRouter()

SELECT = """
    id,
    created_at,
    title,
    description,
    resource_type,
    file_path,
    file_type,
    url,
    subjects ( id, name, subject_code, faculty_id, semester ),
    uploader:profiles ( id, full_name, reputation ),
    votes ( type, voter_id )
"""


@router.get(path="/ranked")
async def get_ranked_resources(
    faculty_id: str | None = Query(None),
    semester: int | None = Query(None),
    subject_id: str | None = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
):
    query = supabase.table("resources").select(SELECT)

    if subject_id:
        query = query.eq("subject_id", subject_id)
    if faculty_id:
        query = query.eq("subjects.faculty_id", faculty_id)
    if semester is not None:
        query = query.eq("subjects.semester", semester)

    result = query.execute()
    resources = cast(list[dict[str, Any]], result.data or [])

    for r in resources:
        r["ranked_score"] = compute_ranked_score(r)
    resources.sort(key=lambda item: item["ranked_score"], reverse=True)

    return {
        "total": len(resources),
        "results": resources[offset : offset + limit],
    }


@router.get("/{resource_id}/score")
def get_resource_score(resource_id: str):
    result = (
        supabase.table("resources")
        .select(SELECT)
        .eq("id", resource_id)
        .maybe_single()
        .execute()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Resource not found")

    resource = cast(dict[str, Any], result.data)

    return {"resource_id": resource_id, "ranked_score": compute_ranked_score(resource)}
