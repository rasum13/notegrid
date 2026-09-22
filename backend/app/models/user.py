from datetime import datetime, UTC
from sqlmodel import Field, SQLModel
from sqlalchemy import DateTime

def get_datetime_utc() -> datetime:
    return datetime.now(UTC)

class UserBase(SQLModel):
    username: str = Field(unique=True, index=True)
    is_admin: bool = False

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

# class UserSignUp(SQLModel):
#     username: str
#     password: str = Field(min_length=8, max_length=128)

class UserUpdateUsername(SQLModel):
    username: str

class UserUpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True), # type: ignore
    )
