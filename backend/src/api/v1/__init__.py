from fastapi import APIRouter
from backend.src.api.v1.auth import router as auth_router
from backend.src.api.v1.streams import router as streams_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(streams_router, prefix="/streams", tags=["Streams"])
