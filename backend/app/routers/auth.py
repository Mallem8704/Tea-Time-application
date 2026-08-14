from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse, UserOut
from app.auth_utils import verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="", tags=["Authentication"])

security = HTTPBearer(auto_error=False)


# ==========================================
# AUTH DEPENDENCIES
# ==========================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that extracts and validates the JWT bearer token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id_int).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_owner(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency restricting endpoint access to owners only."""
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner privileges required for this action",
        )
    return current_user


def require_staff_or_owner(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency allowing both staff and owner roles."""
    if current_user.role not in ["owner", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff or owner privileges required",
        )
    return current_user


# ==========================================
# AUTH ENDPOINTS
# ==========================================

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate owner or staff user and return JWT access token."""
    email_clean = request.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT Token with role and outlet claims
    token_claims = {
        "sub": str(user.id),
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "outlet_id": user.outlet_id,
    }
    access_token = create_access_token(data=token_claims)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        name=user.name,
        email=user.email,
        outlet_id=user.outlet_id,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user profile."""
    return current_user


@router.get("/owner-check")
def test_owner_check(current_user: User = Depends(require_owner)):
    """Test endpoint to verify owner-only access."""
    return {
        "message": f"Welcome Owner {current_user.name}",
        "role": current_user.role,
        "outlet_id": current_user.outlet_id,
    }
