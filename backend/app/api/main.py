from fastapi import APIRouter

from app.api.routes import resources, recommendation

api_router = APIRouter()
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(recommendation.router, prefix="/recommendations", tags=["recommendations"])

