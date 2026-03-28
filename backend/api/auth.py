from fastapi import APIRouter, Depends, HTTPException, status

from ..models.user import UserRegister, UserLogin, UserOut, TokenOut
from ..services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from ..services.user_store import create_user, get_user_by_email, get_user_by_id, email_exists

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: UserRegister):
    if email_exists(body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    return UserOut(id=user["id"], name=user["name"], email=user["email"], role=user["role"])


@router.post("/login", response_model=TokenOut)
def login(body: UserLogin):
    user = get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current: dict = Depends(get_current_user)):
    user = get_user_by_id(int(current["sub"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(id=user["id"], name=user["name"], email=user["email"], role=user["role"])
