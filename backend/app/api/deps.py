import jwt
from fastapi import Header, HTTPException

from app.core.config import settings


def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.replace(settings.AUTH_PREFIX, "")
        payload = jwt.decode(
            jwt=token,
            key=settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.ALGORITHM],
            audience="authenticated",
        )
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid Token")
