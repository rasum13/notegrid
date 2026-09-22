from datetime import datetime, timezone
from math import log10

from app.core.config import settings

VOTE_POINTS = {"UPVOTE": 1, "DOWNVOTE": -1}


def vote_score(votes: list[dict]) -> int:
    return sum(VOTE_POINTS.get(v["type"], 0) for v in votes)


def reputation_bonus(reputation: int | None) -> float:
    rep = max(reputation or 0, 0)
    return log10(rep + 1) * settings.REPUTATION_WEIGHT


def recency_multiplier(created_at: str) -> float:
    created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    age_days = (datetime.now(timezone.utc) - created).total_seconds() / 86400
    half_life = settings.RECENCY_HALF_LIFE_DAYS
    return 0.5 ** (age_days / half_life)


def compute_ranked_score(resource: dict) -> int:
    base = vote_score(resource["votes"]) + reputation_bonus(
        resource.get("uploader", {}).get("reputation")
    )
    return round(base * recency_multiplier(resource["created_at"]))
