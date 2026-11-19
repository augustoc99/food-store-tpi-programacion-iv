from datetime import datetime
from pydantic import EmailStr, field_validator
from sqlmodel import SQLModel, Field

class UserCreate(SQLModel):
    username: str = Field(min_length=2, max_length=80)
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator('username', 'full_name')
    @classmethod
    def no_blancos(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError('El campo no puede estar vacío ni contener solo espacios')
        return value

    @field_validator('password')
    @classmethod
    def password_bcrypt(cls, value: str) -> str:
        if len(value.encode('utf-8')) > 72:
            raise ValueError('La contraseña supera los 72 bytes admitidos por bcrypt')
        return value

class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
