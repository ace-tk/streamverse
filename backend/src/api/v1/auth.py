from fastapi import APIRouter, Depends, status

from backend.src.schemas.auth import UserSignup, UserLogin, TokenResponse
from backend.src.schemas.user import UserResponse
from backend.src.services.auth import AuthService
from backend.src.dependencies.auth import get_current_user, get_token, get_auth_service
from backend.src.models.user import User

router = APIRouter()

@router.post(
    "/signup", 
    response_model=UserResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
async def signup(
    user_data: UserSignup,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user using Supabase Auth.
    Automatically creates a corresponding user profile in the local database.
    """
    return await auth_service.signup(user_data)


@router.post(
    "/login", 
    response_model=TokenResponse,
    summary="Authenticate a user"
)
async def login(
    login_data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate a user with email and password via Supabase Auth.
    Returns the access token, refresh token, and user profile.
    """
    return await auth_service.login(login_data)


@router.get(
    "/me", 
    response_model=UserResponse,
    summary="Get current user profile"
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the profile of the currently authenticated user.
    Requires a valid JWT Bearer token.
    """
    return current_user


@router.post(
    "/logout", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Log out the user"
)
async def logout(
    current_user: User = Depends(get_current_user),
    token: str = Depends(get_token),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Invalidate the current session and log out the user in Supabase.
    Requires a valid JWT Bearer token.
    """
    await auth_service.logout(token)
    return None
