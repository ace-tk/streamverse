from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.concurrency import run_in_threadpool
from supabase import create_client, Client
from gotrue.errors import AuthApiError
from sqlalchemy.future import select

from backend.src.core.config import settings
from backend.src.models.user import User
from backend.src.schemas.auth import UserSignup, UserLogin, TokenResponse
from backend.src.schemas.user import UserResponse

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _get_client(self) -> Client:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

    async def signup(self, user_data: UserSignup) -> UserResponse:
        client = self._get_client()
        try:
            def _signup_call():
                return client.auth.sign_up({
                    "email": user_data.email,
                    "password": user_data.password,
                    "options": {
                        "data": {
                            "name": user_data.name
                        }
                    }
                })
                
            auth_response = await run_in_threadpool(_signup_call)
            
            if not auth_response.user:
                raise HTTPException(status_code=400, detail="Signup failed in Supabase")

            # Create corresponding user in our database using the Supabase UUID
            new_user = User(
                id=auth_response.user.id,
                email=user_data.email,
                name=user_data.name
            )
            self.db.add(new_user)
            await self.db.commit()
            await self.db.refresh(new_user)
            
            return UserResponse.model_validate(new_user)
            
        except AuthApiError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except HTTPException:
            raise
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred during signup: {str(e)}"
            )

    async def login(self, login_data: UserLogin) -> TokenResponse:
        client = self._get_client()
        try:
            def _login_call():
                return client.auth.sign_in_with_password({
                    "email": login_data.email,
                    "password": login_data.password
                })
                
            auth_response = await run_in_threadpool(_login_call)
            
            if not auth_response.session:
                raise HTTPException(status_code=401, detail="Invalid credentials")

            # Fetch the user profile from our DB
            result = await self.db.execute(select(User).where(User.id == auth_response.user.id))
            user = result.scalars().first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User profile not found in database")

            return TokenResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                user=UserResponse.model_validate(user)
            )
        except AuthApiError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

    async def logout(self, access_token: str) -> None:
        client = self._get_client()
        try:
            def _logout_call():
                # Inject the token directly into the headers to sign out the specific user
                client.options.headers.update({"Authorization": f"Bearer {access_token}"})
                client.auth.sign_out()
                
            await run_in_threadpool(_logout_call)
        except AuthApiError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to logout properly due to invalid session"
            )
