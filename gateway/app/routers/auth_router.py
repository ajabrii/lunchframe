"""Launchframe — Auth Router (register, login, me)."""

import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import AuthResponse, LoginRequest, RegisterRequest, UserResponse, GoogleLoginRequest

router = APIRouter(prefix="/v1/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=body.email,
        name=body.name,
        password_hash=hash_password(body.password),
        api_key=secrets.token_hex(32),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate token
    token = create_access_token(user.id)

    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id)

    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user."""
    return UserResponse.model_validate(current_user)


@router.post("/google", response_model=AuthResponse)
async def google_auth(body: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with Google ID token."""
    try:
        # Verify Google Token
        idinfo = id_token.verify_oauth2_token(
            body.id_token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]
        name = idinfo.get("name")

        # Check if user exists
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            # Create new user
            import secrets
            user = User(
                email=email,
                name=name,
                password_hash="oauth_shared_account", # Not used for OAuth
                api_key=secrets.token_hex(32),
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # Generate local JWT
        token = create_access_token(user.id)

        return AuthResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )
