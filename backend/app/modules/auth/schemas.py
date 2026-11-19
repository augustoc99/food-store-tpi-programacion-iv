from sqlmodel import SQLModel

class LoginResult(SQLModel):
    message: str
