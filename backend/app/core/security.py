from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import get_settings

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(username: str) -> str:
    config = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({'sub': username, 'exp': expires}, config.SECRET_KEY, algorithm=config.ALGORITHM)

def decode_access_token(token: str) -> str | None:
    try:
        subject = jwt.decode(token, get_settings().SECRET_KEY, algorithms=[get_settings().ALGORITHM]).get('sub')
        return subject if isinstance(subject, str) else None
    except JWTError:
        return None
