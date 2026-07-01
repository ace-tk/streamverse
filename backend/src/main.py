from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import logging

from backend.src.core.config import settings
from backend.src.database.session import engine
from backend.src.api.v1 import api_router

# Configure logging for the application
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    Used to handle startup and shutdown events.
    Verifies the database connection on application startup.
    """
    try:
        # Verify database connection on startup
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection established successfully.")
    except Exception as e:
        logger.error(f"Failed to connect to the database: {e}")
        # Raise an exception to prevent the app from starting if DB is unreachable
        raise RuntimeError("Could not connect to the database") from e
        
    yield
    
    # Cleanup database connection pool on shutdown
    await engine.dispose()
    logger.info("Database connection closed.")

# Initialize the FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# Register API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint.
    Verifies that the application is running and the database is accessible.
    """
    try:
        # Attempt a simple query to verify database connectivity
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "database": "connected"
        }
    except SQLAlchemyError as e:
        logger.error(f"Database health check failed: {e}")
        # Return an appropriate error if the database connection fails
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service unhealthy"
        )
