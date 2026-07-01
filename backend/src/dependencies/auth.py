import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.src.core.config import settings
from backend.src.database.session import get_db
from backend.src.models.user import User
from backend.src.services.auth import AuthService

security = HTTPBearer()

# Initialize JWKS client once at module level.
# PyJWKClient caches the keys internally, so repeated calls
# do not make a network request on every token verification.
_jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_jwks_client = PyJWKClient(_jwks_url)


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency to provide the AuthService"""
    return AuthService(db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to verify the JWT and return the current user profile.
    
    Supabase now signs JWTs with ES256 (asymmetric ECDSA).
    We fetch the public signing key from Supabase's JWKS endpoint
    and use it to verify the token signature.
    
    Raises 401 Unauthorized if the token is invalid or expired.
    """
    token = credentials.credentials
    try:
        # Fetch the signing key that matches the token's "kid" header
        signing_key = _jwks_client.get_signing_key_from_jwt(token)

        # Verify the token using the ES256 public key
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token audience is invalid"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    # Fetch user from DB
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


def get_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency to extract the raw JWT access token"""
    return credentials.credentials
