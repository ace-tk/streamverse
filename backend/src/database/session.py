from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from backend.src.core.config import settings

# Create async engine for PostgreSQL (Supabase)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    # Standard connection pool configurations
    pool_size=5,
    max_overflow=10
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    """Dependency for getting async db session."""
    async with AsyncSessionLocal() as session:
        yield session
